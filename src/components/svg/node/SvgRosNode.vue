<template>
    <g :transform="innerTransform ?? ''">
        <g :transform="anchorTransform">
            <!-- :fill="props.bgFill"
            :stroke="props.bgStroke" :fill-opacity="props.bgFillOpacity" :rx="props.bgRx" :ry="props.bgRy"
            :stroke-width="props.bgStrokeWidth" -->
            <rect :x="bBox.x" :y="bBox.y" :width="bBox.width" :height="bBox.height" class="node-bg"/>
            <g ref="refGContent">
                <g ref="refHeaderRoot" :transform="`translate(0, ${mt})`">
                    <SvgRosTopic ref="refHeaderTopic" content-orientation="center" anchor="middletop"
                        :node-key="props.nodeKey" :width="nodeNameWidth" :height="nodeNameHeight" :topic-group="'HEADER'"
                        :topic="new ROS.Topic(node?.name ?? '', 'Header', 'NONE')" font-size="110%" :bg-rx="10"
                        :bg-ry="10" :mb="10" :mt="10" :ml="10" :mr="10" bg-fill="cyan" />
                </g>
                <g v-if="true" :transform="`translate(0, ${0})`">
                    <g v-for="group in rightSideGroups" :key="group.groupName"
                        :ref="el => storeRightGroupParentRef(el, group)">
                        <SvgRosTopicGroup :node-key="nodeKey" :node-type="nodeType" :topic-type="group.groupName"
                            anchor="lefttop"
                            :parent-transformation="transformNodeAnchor" :inner-transform="getGroupTransform(group).value"
                            :width="groupWidth" :orientation="'right'" :topic-subgroup="group"
                            :ref="el => storeGroupRef(el, group)" />
                    </g>
                </g>
                <g v-if="true" :transform="`translate(0, ${0})`">
                    <g v-for="group in leftSideGroups" :key="group.groupName + nodeKey"
                        :ref="el => storeLeftGroupParentRef(el, group)">
                        <SvgRosTopicGroup :node-key="nodeKey" :node-type="nodeType" :topic-type="group.groupName"
                            anchor="righttop"
                            :parent-transformation="transformNodeAnchor" :inner-transform="getGroupTransform(group).value"
                            :width="groupWidth" :orientation="'left'" :topic-subgroup="group"
                            :ref="el => storeGroupRef(el, group)" />
                    </g>
                </g>
            </g>
        </g>
        <circle cx="0" cy="0" r="14" fill="cyan" opacity="0" />
    </g>
</template>

<script setup lang="ts">

import { ref, reactive, onMounted, onUpdated, computed, type Ref, onBeforeUpdate, watch, nextTick, shallowRef, type WatchStopHandle, provide } from 'vue'
import * as ROS from 'src/ros/rosNode'
import { useRosStore } from 'src/stores/ros'
import { BBoxAdaption, useBackgroundRectUpdater, vCenteredGroup, type BBox, useAnchorTransform, transformBoundingBox } from 'src/components/svg/scripts/directives'
import type { orientation } from 'src/components/svg/scripts/properties';

import SvgRosTopic from './SvgRosTopic.vue'
import SvgRosTopicGroup from './SvgRosTopicGroup.vue'
import { TransformNode } from 'src/stores/anchors';
import { Transformation } from '../composables/anchor';

////////////////////////////////////////////////////////////////////////////
// Stores
////////////////////////////////////////////////////////////////////////////

const store = useRosStore()

////////////////////////////////////////////////////////////////////////////
// Refs
////////////////////////////////////////////////////////////////////////////

const refGContent = ref<SVGGElement | null>(null)
const refHeaderTopic = ref<InstanceType<typeof SvgRosTopic> | null>(null)

////////////////////////////////////////////////////////////////////////////
// Emits
////////////////////////////////////////////////////////////////////////////

const emit = defineEmits<{
    (e: 'updatedSize'): void,
}>()

////////////////////////////////////////////////////////////////////////////
// Props
////////////////////////////////////////////////////////////////////////////

const props = withDefaults(defineProps<{
    nodeKey: string,
    nodeType?: ROS.nodeType,
    groupSpacing?: number,
    spacingNodeNameGroups?: number,
    horizontalGroupSpacing?: number,
    width?: number,
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
    anchorMappingPrefix?: string,
}>(), {
    nodeType: 'central',
    groupSpacing: 15,
    spacingNodeNameGroups: 10,
    horizontalGroupSpacing: 25,
    width: 600,
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
    anchorMappingPrefix: "",
})

////////////////////////////////////////////////////////////////////////////
// Computed values
////////////////////////////////////////////////////////////////////////////

// TODO: Make this props
const nodeNameWidth = ref(250)
const nodeNameHeight = ref(40)

const node = computed(() => {
    return store.getNode(props.nodeKey)
})

const rightSideGroups = computed(() => {
    return [
        node.value?.topicGroups.get('Publishers')!,
        node.value?.topicGroups.get('Clients')!
    ]
})

const leftSideGroups = computed(() => {
    return [
        node.value?.topicGroups.get('Subscribers')!,
        node.value?.topicGroups.get('Services')!
    ]
})

const groupWidth = computed(() => {
    return (props.width - props.horizontalGroupSpacing - props.ml - props.mr) / 2
})

const bBox = computed<BBox>(() => {
    return {
        x: -props.width / 2,
        y: 0,
        width: props.width, //props.width,
        height: totalGroupHeight.value + props.mt + props.mb + nodeNameHeight.value + props.spacingNodeNameGroups,
    }
})

const anchorTransform = useAnchorTransform(bBox, computed(() => props.anchor))

const transformNodeInner = computed(() => new Transformation(computed(() => props.innerTransform), props.parentTransformation))
const transformNodeAnchor = computed(() => new Transformation(anchorTransform, transformNodeInner.value))
// const transformNodeCenter = computed(() => new TransformNode(centerTransform, transformNodeAnchor.value))


////////////////////////////////////////////////////////////////////////////
// Topic group refs
////////////////////////////////////////////////////////////////////////////

const refsRightGroupParents = ref<Map<string, SVGElement | null>>(new Map());
const refsLeftGroupParents = ref<Map<string, SVGElement | null>>(new Map());
const refsGroups = ref<Map<string, InstanceType<typeof SvgRosTopic> | null>>(new Map());
function storeRightGroupParentRef(el: SVGElement, group: ROS.TopicGroup) {
    refsRightGroupParents.value.set(group.groupName, el)
}
function storeLeftGroupParentRef(el: SVGElement, group: ROS.TopicGroup) {
    refsLeftGroupParents.value.set(group.groupName, el)
}
function storeGroupRef(el: InstanceType<typeof SvgRosTopic>, group: ROS.TopicGroup) {
    refsGroups.value.set(group.groupName, el)
}

////////////////////////////////////////////////////////////////////////////
// Topic group placement
////////////////////////////////////////////////////////////////////////////

const groupTransforms = reactive<Map<string, Ref<string>>>(new Map())
function getGroupTransform(group: ROS.TopicGroup) {
    if (!groupTransforms.has(group.groupName)) {
        groupTransforms.set(group.groupName, ref(""))
    }
    return groupTransforms.get(group.groupName)!
}
function setGroupTransform(group: ROS.TopicGroup | string, transform: string) {
    if (typeof group !== 'string') group = group.groupName

    if (!groupTransforms.has(group)) {
        groupTransforms.set(group, ref(transform))
    } else {
        const r = groupTransforms.get(group)
        if (r && r.value != transform) r.value = transform
    }
}

function updateElements() {
    1
    // console.log(">>> updateElements NODE")

    // Anchors are set so that they can start directly under the title
    const startY = props.mt + nodeNameHeight.value + props.spacingNodeNameGroups;

    let currentY = startY;
    refsRightGroupParents.value.forEach((el, key) => {
        const group = refsGroups.value.get(key)
        const groupHeight = group?.height ?? 0;

        const x = props.horizontalGroupSpacing / 2;

        if (el) {
            // el.setAttribute("transform", `translate(${x}, ${currentY})`)
            let transform = `translate(${x}, ${currentY})`
            setGroupTransform(key, transform)
            currentY += groupHeight + props.groupSpacing
        }
    })

    currentY = startY;
    refsLeftGroupParents.value.forEach((el, key) => {
        const group = refsGroups.value.get(key)
        const groupHeight = group?.height ?? 0;

        const x = -props.horizontalGroupSpacing / 2;

        if (el) {
            // el.setAttribute("transform", `translate(${x}, ${currentY})`)
            let transform = `translate(${x}, ${currentY})`
            setGroupTransform(key, transform)
            currentY += groupHeight + props.groupSpacing
        }
    })
}


const groupWatcher = shallowRef<WatchStopHandle | null>(null);
const totalLeftGroupHeight = ref(0);
const totalRightGroupHeight = ref(0);
const totalGroupHeight = ref(300)

function updateGroupWatcher(immediate = false) {
    groupWatcher.value?.()
    groupWatcher.value = watch(() => Array.from(refsGroups.value.keys()).map(groupName => refsGroups.value.get(groupName)?.height), () => {
        [
            { groups: rightSideGroups, heightRef: totalRightGroupHeight },
            { groups: leftSideGroups, heightRef: totalLeftGroupHeight }
        ].forEach(({ groups, heightRef }) => {
            const heights = groups.value.map(el => refsGroups.value.get(el.groupName)?.height ?? 0);
            const h = heights.reduce((a, b) => a + b, 0) + props.groupSpacing * (heights.length - 1)
            if (h != heightRef.value) {
                // console.log(`>>> Node Groups updates`, groups.value.map(g => g.groupName), heights, h);
                heightRef.value = h;
            }
        })
        let maxHeight = Math.max(totalLeftGroupHeight.value, totalRightGroupHeight.value)
        if (maxHeight != totalGroupHeight.value) {
            totalGroupHeight.value = maxHeight;
        }

        updateElements();

    }, { immediate: immediate })
}

////////////////////////////////////////////////////////////////////////////
// Lifecycle Hooks
////////////////////////////////////////////////////////////////////////////

onMounted(() => {
    // console.log(">>> SVG NODE Mounted");
    updateGroupWatcher(true);

    watch(outerBBox, () => {
        if (nodeHeight.value == outerBBox.value.height) return
        nodeHeight.value = outerBBox.value.height
    }, { immediate: true })
})

onBeforeUpdate(() => {
    // console.log("SVG TOPIC Before Update");
    groupWatcher.value?.();

    refsRightGroupParents.value = new Map();
    refsLeftGroupParents.value = new Map();
    refsGroups.value = new Map();
})

onUpdated(() => {
    // console.log(`>>> NODE updated ${props.nodeName}`);
    updateGroupWatcher(true);
})


////////////////////////////////////////////////////////////////////////////
// Exposes
////////////////////////////////////////////////////////////////////////////

const outerBBox = computed(() => { return transformBoundingBox(bBox.value, [anchorTransform.value]) });
const nodeHeight = ref(0)

defineExpose({
    bBox: outerBBox,
    height: nodeHeight,
})

</script>

<style scoped></style>