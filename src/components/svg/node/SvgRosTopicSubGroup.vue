<template>
    <g ref="refRoot">
        <g :transform="innerTransform ?? ''">
            <g :transform="anchorTransform">
                <!-- :fill="props.bgFill"
                :stroke="props.bgStroke" :fill-opacity="props.bgFillOpacity" :rx="props.bgRx" :ry="props.bgRy"
                :stroke-width="props.bgStrokeWidth" -->
                <rect :x="bBox.x" :y="bBox.y" :width="bBox.width" :height="bBox.height" class="subgroup-bg"></rect>

                <g ref="refGContent">
                    <SvgRosTopic @click="toggleVisibility" ref="refHeaderTopic"
                        :topic="new ROS.Topic(topicSubgroup.prefix + '/...', 'Subgroup-Header', 'SUBGROUP')"
                        :node-key="nodeKey" :topic-group="topicGroup.groupName" :topic-subgroup="topicSubgroup"
                        :width="headerWidth" anchor="lefttop" :inner-transform="`translate(${props.ml}, ${props.mt})`"
                        :height="props.topicHeight" :bg-rx="0" :bg-ry="0">
                    </SvgRosTopic>
                    <g v-if="true" v-for="(topic, index) in topicSubgroup.topics" :key="topic.name">
                        <SvgRosTopic :node-key="nodeKey" :node-type="nodeType" :topic="topic"
                            :topic-group="topicGroup.groupName" :topic-subgroup="topicSubgroup"
                            :prefix="topicSubgroup.prefix" font-size="90%" :side="orientation" :width="topicWidth"
                            :height="topicHeight" anchor="lefttop"
                            :text-visible="topicsVisible"
                            :inner-transform="`translate(${props.ml + props.topicsMl}, ${props.mt + props.topicHeight + topicsMt + index * (topicsSpacingAdapted + topicHeight)})`"
                            :parent-transformation="transformNodeAnchor" @mouseenter="hoverTopic(topic)"
                            @mouseleave="hoverTopic(undefined)" />
                        <!-- :text-visible="topicSubgroup.visible" -->
                    </g>

                </g>
            </g>
        </g>
        <circle cx="0" cy="0" r="3" fill="red" opacity="0" />
    </g>
</template>

<script setup lang="ts">

import { ref, reactive, onMounted, onUpdated, computed, type Ref, onBeforeUpdate, watch, nextTick, shallowRef, onUnmounted, h, toRef, toValue } from 'vue'
import * as ROS from 'src/ros/rosNode'
import { useRosStore } from 'src/stores/ros'

import { BBoxAdaption, vBackgroundRect, vCenteredGroup, useBackgroundRectUpdater, calculateTransform, transformBoundingBox, useElementBbox, useAnchorTransform } from 'src/components/svg/scripts/directives'
import type { orientation } from 'src/components/svg/scripts/properties';

import SvgRosTopic from './SvgRosTopic.vue'
import SvgRosTopicConnection from '../nodes/SvgRosTopicConnection.vue'
import { identity, type Matrix } from 'transformation-matrix';
import { TransformNode } from 'src/stores/anchors';
import { symbol } from 'd3-shape';
import { Transformation } from '../composables/anchor';
import { useDebounceFn, useThrottleFn } from '@vueuse/core';


const refGContent = ref<SVGGElement | null>(null)
const refHeaderTopic = ref<InstanceType<typeof SvgRosTopic> | null>(null)
const refRoot = ref<SVGGElement | null>(null)

const store = useRosStore()

const emit = defineEmits<{
    (e: 'updatedSize'): void,
}>()

const props = withDefaults(defineProps<{
    // topics: ROS.Topic[],
    nodeKey: string,
    nodeType: ROS.nodeType,
    topicGroup: ROS.TopicGroup,
    topicSubgroup: ROS.TopicSubGroup,
    topicsSpacing?: number,
    topicsMl?: number,
    topicsMr?: number,
    topicsMt?: number,
    topicsMb?: number,
    width: number,
    topicHeight?: number,
    orientation?: "left" | "right",
    // topicWidth: number,
    // height: number,
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
    parentTransformation?: Transformation | undefined,
}>(), {
    nodeType: "none",
    orientation: "right",
    topicHeight: 16,
    topicsSpacing: 2,
    topicsMl: 15,
    topicsMr: 0,
    topicsMt: 5,
    topicsMb: 0,
    minWidth: 0,
    minHeight: 0,
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
    contentAlign: "rightcenter",
    anchor: "center",
})

const topicsVisible = computed(() => {
    const centerNode = store.selectedNode;
    const secondNode = store.selectedSecondaryNode;

    if (!secondNode) return true

    if (store.visibleSubgroups.has(props.topicSubgroup.prefix)) return true

    const secondNodeTopicTypes: ROS.TopicType[] = props.orientation == "left" ? ["Publishers", "Clients"] : ["Subscribers", "Services"]

    const secondNodeTopics = secondNode?.topics.filter(topic => {
        if (secondNodeTopicTypes.includes(topic.type)) return true
    })

    const topicNames = secondNodeTopics?.map(topic => topic.name) ?? []
    const subGroupTopicNames = props.topicSubgroup.topics.map(topic => topic.name)

    // Check if there are any topics in the subgroup that are also in the second node
    if (subGroupTopicNames.some(name => topicNames.includes(name))) {
        return true
    }

    return false
})

const topicsSpacingAdapted = computed(() => {
    return topicsVisible.value ? props.topicsSpacing : 1
})

// const topicHeight = computed(() => { return props.topicSubgroup.visible ? props.topicHeight : 5 })
const topicHeight = computed(() => { return topicsVisible.value ? props.topicHeight : 1 })
const height = computed(() => {
    const headerHeight = props.topicHeight
    const topicsHeight = props.topicSubgroup.topics.length * (topicHeight.value + topicsSpacingAdapted.value) - topicsSpacingAdapted.value
    const margin = props.topicsMt + props.topicsMb + props.mt + props.mb
    return headerHeight + topicsHeight + margin
})

const bBox = computed(() => {
    return {
        x: 0,
        y: 0,
        width: props.width,
        height: height.value,
    }
})

const headerWidth = computed(() => {
    return props.width - props.ml - props.mr
})

const topicWidth = computed(() => {
    return headerWidth.value - props.topicsMl - props.topicsMr
})



const anchorTransform = useAnchorTransform(bBox, computed(() => props.anchor))

const transformNodeInner = computed(() => new Transformation(computed(() => props.innerTransform), props.parentTransformation))
const transformNodeAnchor = computed(() => new Transformation(anchorTransform, transformNodeInner.value))
// function toggleVisibility(e: MouseEvent) {
//     const subGroup = store.getNode(props.nodeKey)?.topicGroups.get(props.topicGroup.groupName)!.subGroups.get(props.topicSubgroup.prefix)!
//     subGroup.visible = !subGroup.visible;
// }

function toggleVisibility(e: MouseEvent) {
    store.toggleSubgroupVisibility(props.topicSubgroup.prefix)
}


function hoverTopic(topic: ROS.Topic | undefined) {
    if (topic) {
        // store.selectedTopic = topic.name
        store.setSelectedTopic(toValue(topic), 0)
    } else {
        store.setSelectedTopic(undefined, 300)
    }
    // lastSelectedTopic.value = topic
    // throttledTopicSelection()
}



onUpdated(() => {
    // console.log("> UPDATE SUBGROUP")
})

onMounted(() => {
    watch(outerBBox, () => {
        if (subgroupHeight.value == outerBBox.value.height) return
        // console.log("UPDATE SUBGROUP HEIGHT")
        subgroupHeight.value = outerBBox.value.height
    }, { immediate: true })
})

const outerBBox = computed(() => { return transformBoundingBox(bBox.value, [anchorTransform.value]) });
const subgroupHeight = ref(0)






defineExpose({
    bBox: outerBBox,
    height: subgroupHeight,
})

</script>

<style scoped></style>