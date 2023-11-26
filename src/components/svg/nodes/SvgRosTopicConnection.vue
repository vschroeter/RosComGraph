<template>
    <!-- <line v-if="showLine" :x1="startPoint.x ?? 0" :y1="startPoint.y ?? 0" :x2="endPoint.x ?? 0" :y2="endPoint.y ?? 0" stroke="red" stroke-width="1" /> -->
    <path v-if="showLine" :d="linePath" stroke="white" stroke-width="2" stroke-opacity="0.7" fill="none" />
</template>

<script setup lang="ts">

import { ref, reactive, onMounted, onUpdated, computed, type Ref, onBeforeUpdate, watch, nextTick, toValue } from 'vue'
import * as ROS from '@/ros/rosNode'
import { useRosStore } from '@/stores/ros'
import { useAnchorStore, type Point2D } from '@/stores/anchors';
import * as d3 from 'd3'

const store = useRosStore()
const anchorStore = useAnchorStore()

const props = withDefaults(defineProps<{
    startNodeName: string,
    startNodeType?: ROS.nodeType,
    startNodeTopicGroup: string,
    startNodeTopicName: string,
    endNodeName?: string,
    endNodeType?: ROS.nodeType,
    endNodeTopicGroup?: string,
    endNodeTopicName?: string,
}>(), {
    startNodeType: "none",
    endNodeType: "none",
})

// const startGroup = computed(() => {
//     return store.topicRootRefs.get(props.startNodeName)?.get(props.startNodeTopicName)
// })

// const endGroup = computed(() => {
//     return store.topicRootRefs.get(props.endNodeName)?.get(props.endNodeTopicName)
// })

const showLine = computed(() => {
    return props.endNodeName != undefined && props.endNodeTopicName != undefined && props.startNodeName != props.endNodeName
})

const startPoint = computed(() => {
    const a = anchorStore.getTopicAnchor(props.startNodeName, props.startNodeType, props.startNodeTopicGroup, props.startNodeTopicName)
    // console.log("startAnchor", a, a?.localInPoint, a?.inPoint)
    if (a) return a.outPoint
    return { x: 0, y: 0 }
})

const endPoint = computed(() => {
    const a = anchorStore.getTopicAnchor(props.endNodeName, props.endNodeType, props.endNodeTopicGroup, props.endNodeTopicName)
    // console.log("endPoint", a, a?.inPoint)
    if (a) return a.inPoint
    return { x: 0, y: 0 }
})

const pathGenerator = computed(() => {
    return d3.line<Point2D>()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveBasis)
        // .curve(d3.curveLinear)
})

const linePath = computed(() => {
    const start = toValue(startPoint.value)
    const end = toValue(endPoint.value)
    
    const points = [
        start,
        { x: start.x + 100, y: start.y },
        { x: end.x - 100, y: end.y },
        end
    ]

    return pathGenerator.value(points)
})

// watch(() => store.topicAnchorsChanged, () => {
//     console.log("topicAnchors changed", store.topicAnchors, props.startNodeName, props.startNodeTopicGroup, props.startNodeTopicName)
// })

onMounted(() => {
    console.log("SvgRosTopicConnection mounted")
    // console.log(store.topicRootRefs.get(props.endNodeName)?.get(props.endNodeTopicName), getDomPath(startGroup.value))
})

onBeforeUpdate(() => {
})

onUpdated(() => {
    // console.log("SvgRosTopicConnection updated")
    // console.log(store.topicRootRefs.get(props.endNodeName)?.get(props.endNodeTopicName), getDomPath(startGroup.value))
})

</script>

<style scoped></style>