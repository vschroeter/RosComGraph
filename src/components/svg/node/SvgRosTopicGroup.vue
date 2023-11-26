<template>
    <g ref="refRoot">
        <g :transform="innerTransform ?? ''">
            <g :transform="anchorTransform">
                <!-- :fill="props.bgFill"
                    :stroke="props.bgStroke" :fill-opacity="props.bgFillOpacity" :rx="props.bgRx" :ry="props.bgRy"
                    :stroke-width="props.bgStrokeWidth"  -->
                <rect :x="bBox.x" :y="bBox.y" :width="bBox.width" :height="bBox.height" class="group-bg" />
                <g ref="refGContent">
                    <g ref="refHeaderRoot">
                        <SvgRosTopic ref="refHeaderTopic"
                            :inner-transform="`translate(${headerTranslateX}, ${mt}) rotate(${rotation})`"
                            content-orientation="center" :anchor="headerAnchor" :width="headerWidth" :height="headerHeight"
                            :topic="new ROS.Topic(displayedText, 'Group-Header', 'NONE')" :bg-rx="1" :bg-ry="1"
                            :topic-group="'HEADER'" @updated-size="() => updateElements()">
                        </SvgRosTopic>
                    </g>
                    <g v-if="true" v-for="(group, index) in sortedSubGroups" :key="group.prefix"
                        :ref="el => storeSubgroupParentRef(el, group)">
                        <!-- :min-width="subGroupsMinWidth" -->
                        <SvgRosTopicSubGroup :topic-subgroup="group" :node-key="nodeKey" :node-type="nodeType"
                            :topic-group="topicGroup" :anchor="'lefttop'" :width="subGroupWidth"
                            :parent-transformation="transformNodeAnchor" :orientation="orientation"
                            :inner-transform="getSugroupTransform(group).value" :ref="el => storeSubgroupRef(el, group)"
                            font-size="90%" :text-visible="topicsVisible" />
                    </g>
                </g>
            </g>
        </g>
        <circle cx="0" cy="0" r="3" fill="blue" opacity="0" />
    </g>
</template>

<script setup lang="ts">

import { ref, reactive, onMounted, onUpdated, computed, type Ref, onBeforeUpdate, watch, nextTick, h, shallowRef, type WatchStopHandle } from 'vue'
import * as ROS from 'src/ros/rosNode'
import { useRosStore } from 'src/stores/ros'
import type { orientation } from 'src/components/svg/scripts/properties';

import SvgRosTopic from './SvgRosTopic.vue'
import SvgRosTopicSubGroup from './SvgRosTopicSubGroup.vue'
import { BBoxAdaption, transformBoundingBox, useBackgroundRectUpdater, vCenteredGroup, type BBox, useAnchorTransform } from 'src/components/svg/scripts/directives'
import { TransformNode } from 'src/stores/anchors';
import { Transformation } from '../composables/anchor';

const store = useRosStore()

const refGContent = ref<SVGGElement | null>(null)
const refHeaderTopic = ref<InstanceType<typeof SvgRosTopic> | null>(null)
const refRoot = ref<SVGGElement | null>(null)

const emit = defineEmits<{
    (e: 'updatedSize'): void,
}>()

const props = withDefaults(defineProps<{
    nodeKey: string,
    nodeType: ROS.nodeType,
    topicType: ROS.TopicType,
    orientation?: "left" | "right",
    subgroupSpacing?: number,
    spacingHeaderSubgroups?: number,
    spacingSubgroupsBorder?: number,
    marginSubgroupsTop?: number,
    marginSubgroupsBot?: number,
    width: number,
    bgFill?: string,
    bgStroke?: string,
    bgFillOpacity?: number,
    bgRx?: number,
    bgRy?: number,
    bgStrokeWidth?: number,
    mt?: number,
    mb?: number,
    ml?: number,
    mr?: number,
    contentAlign?: orientation,
    anchor?: orientation,
    innerTransform?: string | undefined,
    parentTransformation?: Transformation,
}>(), {
    nodeType: "central",
    orientation: "right",
    subgroupSpacing: 5,
    spacingHeaderSubgroups: 5,
    spacingSubgroupsBorder: 0,
    marginSubgroupsTop: 10,
    marginSubgroupsBot: 10,
    width: 240,
    bgFill: "var(--q-detailed-node-bg)",
    bgStroke: "var(--q-detailed-node-stroke)",
    bgFillOpacity: 0.5,
    bgRx: 5,
    bgRy: 5,
    bgStrokeWidth: 1,
    mt: 5,
    mb: 5,
    ml: 5,
    mr: 5,
    contentAlign: "center",
    anchor: "center",
})


const topicGroup = computed(() => {
    return store.getNode(props.nodeKey)?.topicGroups.get(props.topicType)!
})

const sortedSubGroups = computed(() => {
    return Array.from(topicGroup.value.subGroups.values()).sort((a, b) => a.prefix.localeCompare(b.prefix))
})

const isEmpty = computed(() => {
    return topicGroup.value.subGroups.size == 0
})

const subGroupWidth = computed(() => {
    return props.width - props.spacingHeaderSubgroups - props.spacingSubgroupsBorder - headerHeight.value - props.ml - props.mr
})

const totalSubgroupHeight = ref(100)

const bBox = computed<BBox>(() => {
    return {
        x: 0,
        y: 0,
        width: props.width, //props.width,
        height: totalHeight.value + props.mt + props.mb,
    }
})

const totalHeight = computed(() => {
    if (isEmpty.value) return headerHeight.value

    return headerWidth.value
})

const anchorTransform = useAnchorTransform(bBox, computed(() => props.anchor))


const headerHeight = ref(30)
const headerWidth = computed(() => {
    if (isEmpty.value) return props.width - props.ml - props.mr

    return totalSubgroupHeight.value + props.marginSubgroupsBot + props.marginSubgroupsTop
})

const rotation = computed(() => {
    if (isEmpty.value) return 0

    return -90
})

const headerTranslateX = computed(() => {
    if (isEmpty.value) return props.ml
    return props.orientation == "right" ? props.ml : subGroupWidth.value + props.ml + props.spacingHeaderSubgroups + props.spacingSubgroupsBorder
})

const headerAnchor = computed(() => {
    if (isEmpty.value) return "lefttop"

    return "righttop"
})

const displayedText = computed(() => {
    const name = topicGroup.value.groupName
    if (isEmpty.value) return "No " + name
    return name
})

const topicsVisible = ref(true);


const transformNodeInner = computed(() => new Transformation(computed(() => props.innerTransform), props.parentTransformation))
const transformNodeAnchor = computed(() => new Transformation(anchorTransform, transformNodeInner.value))


onMounted(() => {
    // console.log(">> SVG Topic GROUP Mounted");

    watch(outerBBox, () => {
        if (groupHeight.value == outerBBox.value.height) return
        groupHeight.value = outerBBox.value.height
    }, { immediate: true })

    updateSubGroupWatcher(true);
})

const refsSubgroupParents = ref<Map<string, SVGElement | null>>(new Map());
const refsSubgroups = ref<Map<string, InstanceType<typeof SvgRosTopicSubGroup> | null>>(new Map());
function storeSubgroupParentRef(el: SVGElement, group: ROS.TopicSubGroup) {
    refsSubgroupParents.value.set(group.prefix, el)
    // console.log(refsSubgroupParents.value)
}
function storeSubgroupRef(el: InstanceType<typeof SvgRosTopicSubGroup>, group: ROS.TopicSubGroup) {
    refsSubgroups.value.set(group.prefix, el)
    // console.log(refsSubgroups.value)
}

const subGroupTransforms = reactive<Map<string, Ref<string>>>(new Map())
function getSugroupTransform(group: ROS.TopicSubGroup) {
    if (!subGroupTransforms.has(group.prefix)) {
        subGroupTransforms.set(group.prefix, ref(""))
    }
    return subGroupTransforms.get(group.prefix)!
}
function updateElements() {
    // console.log(">> updateElements Topic Group")
    let currentY = props.mt + props.marginSubgroupsTop // + h + props.subgroupSpacing * index
    refsSubgroupParents.value.forEach((parentGEl, key) => {
        const subGroup = refsSubgroups.value.get(key)
        const subgroupHeight = subGroup?.height ?? 0

        if (parentGEl) {
            let transform = ``
            if (props.orientation == "right") {
                const x = props.ml + headerHeight.value + props.spacingHeaderSubgroups
                // parentGEl.setAttribute("transform", `translate(${x}, ${currentY})`)
                transform = `translate(${x}, ${currentY})`
            } else if (props.orientation == "left") {
                const x = props.ml + props.spacingSubgroupsBorder
                // parentGEl.setAttribute("transform", `translate(${x}, ${currentY})`)
                transform = `translate(${x}, ${currentY})`
            }
            if (subGroupTransforms.has(key)) {
                subGroupTransforms.set(key, ref(transform))
            } else {
                const r = subGroupTransforms.get(key)
                if (r) r.value = transform
            }


            currentY += subgroupHeight + props.subgroupSpacing;
        }
    })
}



watch(() => props.orientation, () => {
    updateElements()
})

onBeforeUpdate(() => {
    // console.log("SVG Topic GROUP Before Update");
    subGroupWatcher.value?.();
    refsSubgroupParents.value = new Map();
    refsSubgroups.value = new Map();
})

const subGroupWatcher = shallowRef<WatchStopHandle | null>(null);
const heights = ref<number[]>([]);
onUpdated(() => {
    // console.log(`>> GROUP updated: ${props.nodeKey} ${props.topicType}`);
    updateSubGroupWatcher(true);
})

function updateSubGroupWatcher(immediate = false) {
    subGroupWatcher.value?.();

    subGroupWatcher.value = watch(() => Array.from(refsSubgroups.value.values()).map(el => el?.height), () => {
        const newHeights = Array.from(refsSubgroups.value.values()).map(el => el?.height ?? 0);
        if (newHeights.every((v, i) => v == heights.value[i])) return;

        heights.value = Array.from(refsSubgroups.value.values()).map(el => el?.height ?? 0);
        const h = heights.value.reduce((a, b) => a + b, 0) + props.subgroupSpacing * (heights.value.length - 1)
        // console.log(">> Some Subgroups updates", heights.value, h);
        // if (h != totalSubgroupHeight.value) {
        totalSubgroupHeight.value = h;
        updateElements();
        // }

    }, { immediate: immediate })
}

const outerBBox = computed(() => { return transformBoundingBox(bBox.value, [anchorTransform.value]) });
const groupHeight = ref(0)


defineExpose({
    bBox: outerBBox,
    height: groupHeight,
})


</script>

<style scoped></style>