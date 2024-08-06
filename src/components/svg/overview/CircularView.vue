<template>
    <g ref="refGRoot">
        <!-- For mouse event
        <rect :x="bBox?.x ?? 0" :y="bBox?.y ?? 0" :width="bBox?.width ?? 0" :height="bBox?.height ?? 0" fill="white"
            stroke="white" stroke-width="1" opacity="0" /> -->

        <Marker marker-type="arrow" :marker-name="markerName" align="end" :height="markerHeight" :width="markerWidth"
            marker-units="strokeWidth" class="marker" :offset-x="0"></Marker>
        <!-- <SvgLine :points="[{ x: 0, y: 200 }, { x: 100, y: 100 }, { x: 200, y: 200 }]" curve-style="basis" marker-end="arrow"
            :marker-length="markerWidth" marker-start="arrow" style-class="line test" /> -->

        <circle x="0" y="0" fill="var(--q-stroke)" opacity="0.04" :r="_outerRadius * 1.00">

        </circle>

        <g v-if="true">
            <!-- d3.curveNatural -->
            <SvgLine v-for="(line, index) in connectionLines" :key="index" :points="line.value.points"
                :curve-style="'basis'" :marker-end="markerName" :marker-length="markerWidth"
                :style-class="lineClass(line.value)" />
            <!-- <SvgLine v-for="line in connectionLines" :points="line.value.points" :curve-style="'natural'"
                :marker-end="markerName" :marker-length="markerWidth" :style-class="lineClass(line.value)" /> -->
        </g>

        <g v-for="(nodes, connectedIndex) in connectionComponents" :key="connectedIndex">
            <g v-for="(node, nodeIndex) in nodes" @click="selectNode(node)" @mouseenter="hoverNode(node)"
                @dblclick="doubleClickNode(node)" @mouseleave="hoverNode(null)" :key="nodeIndex">
                <CircleNode :node="node" :cx="getPosition(node).value.x" :cy="getPosition(node).value.y" :r="10"
                    :style-class="circleClass(node)" :angle="getAngle(node).value" :anchor-mapping-prefix="name" />
            </g>
        </g>

        <!-- <g v-if="false">
            <SvgLine v-for="line in debugLines" :points="line.points" curve-style="basis" marker-end="arrow"
                marker-mid="arrow1" :style-class="'line'" />
        </g> -->

    </g>
</template>

<script setup lang="ts">
import { onMounted, watch, type Ref, nextTick, computed, ref, reactive, onUpdated, ComputedRef, toValue } from "vue"
import gsap from 'gsap';

import * as RGr from 'src/ros/rosGraph'
import * as ROS from 'src/ros/rosNode'
import type { Point2D } from 'stores/anchors'
import { BBox } from "../scripts/directives"
import { useNodeAnchorStore } from "src/stores/nodeAnchors"

import SvgLine from "components/svg/connection/SvgLine.vue"
import Marker from "components/svg/connection/Marker.vue"
import CircleNode from "components/svg/overview/nodes/CircleNode.vue"
import { Anchor, ObjectAnchor } from "../composables/anchor"
import { useThrottleFn } from "@vueuse/core";
import { modPositive } from "src/utils/helper";


////////////////////////////////////////////////////////////////////////////
// Anchor store to get node positions
////////////////////////////////////////////////////////////////////////////
const anchorStore = useNodeAnchorStore()

////////////////////////////////////////////////////////////////////////////
// Emit events
////////////////////////////////////////////////////////////////////////////
const emit = defineEmits<{
    (e: 'selectedNode', node: string): void,
    (e: 'dblclickedNode', node: string): void,
    (e: 'hoveredNode', node: string | null): void,
}>()

function selectNode(node: RGr.RosGraphNode | null) {
    if (node === null) return
    emit('selectedNode', node.node.key)
}

function hoverNode(node: RGr.RosGraphNode | null) {
    if (node === null) {
        emit('hoveredNode', null)
        return
    }
    emit('hoveredNode', node.node.key)
}

function doubleClickNode(node: RGr.RosGraphNode | null) {
    if (node === null) return
    emit('dblclickedNode', node.node.key)
}

////////////////////////////////////////////////////////////////////////////
// Props
////////////////////////////////////////////////////////////////////////////
const props = withDefaults(defineProps<{
    /** Name to distinguish between multiple circular views */
    name?: string,

    /** List of nodes to visualize */
    nodes: ROS.Node[],

    /** List of nodes to hide */
    hiddenNodes?: Set<string>,

    /** Selected node displayed in the circular view */
    selectedNode?: string,
    /** Hovered node displayed in the circular view */
    hoveredNode?: string,

    graphSorting?: RGr.SortingMethod,

    // Connection component parameters
    usePubSubConnections?: boolean,
    useServiceConnections?: boolean,
    useBroadcastConnections?: boolean,
    // Visual parameters
    markerWidth?: number,
    markerHeight?: number,
    strokeWidthPubSub?: number,
    strokeWidthService?: number,
    strokeWidthBroadcast?: number,

    /** The outer radius of the visualization */
    outerRadius?: number,

    /** The factor, how much smaller the maximum inner radius of connection lines is compared to the outer radius */
    maxInnerRadiusFactor?: number,

    /** The factor, how much smaller the minimum inner radius of connection lines is compared to the outer radius */
    minInnerRadiusFactor?: number,

    maxOuterRadiusFactor?: number,
    minOuterRadiusFactor?: number,

    /** The gap between first and last node of the visualization. 0 means, that the nodes are distributed among the full circle */
    circleGap?: number,
    /** The factor, how much bigger the gap between nodes of different connected components is. */
    connectedGapFactor?: number,

    /** The offset of the start angle. 0 means, that the first node is at the right of the circle */
    startAngleOffset?: number,

    /** Flag to show or hide PubSub connections */
    showPubSubConnections?: boolean,

    /** Flag to show or hide Broadcast connections */
    showBroadcastConnections?: boolean,

    /** Flag to show or hide ServiceClient connections */
    showServiceClientConnections?: boolean,


}>(), {
    name: "CircularView",
    graphSorting: "flow",
    markerWidth: 5,
    markerHeight: 4,
    strokeWidthPubSub: 3.0,
    strokeWidthService: 2.0,
    strokeWidthBroadcast: 0.5,
    outerRadius: 300,
    maxInnerRadiusFactor: 0.8,
    minInnerRadiusFactor: -0.5,//-0.5,
    maxOuterRadiusFactor: 2.9,
    minOuterRadiusFactor: 1.4,
    startAngleOffset: -90,
    circleGap: 0,
    connectedGapFactor: 1.5,
    showPubSubConnections: true,
    showBroadcastConnections: true,
    showServiceClientConnections: true,
    usePubSubConnections: true,
    useServiceConnections: false,
    useBroadcastConnections: false,

})

const _outerRadius = ref(props.outerRadius)
const markerName = computed(() => "marker-" + props.name)

////////////////////////////////////////////////////////////////////////////
// Bounding Box stuff
////////////////////////////////////////////////////////////////////////////

const refGRoot = ref<SVGGElement | null>(null)
const bBox = ref<BBox | null>(null)
function updateBBox() {
    if (refGRoot.value) {
        const _bbox = refGRoot.value.getBBox()
        if (bBox.value === null || _bbox.x !== bBox.value.x || _bbox.y !== bBox.value.y || _bbox.width !== bBox.value.width || _bbox.height !== bBox.value.height) {
            bBox.value = _bbox
            // console.log("BBox", bBox.value)
        }
    }
}


////////////////////////////////////////////////////////////////////////////
// Helper functions
////////////////////////////////////////////////////////////////////////////

type LineType = "PubSub" | "Service" | "Broadcast"

interface LineData {
    points: Point2D[],
    startNode: ROS.Node,
    endNode: ROS.Node,
    type: LineType
}

/**
 * Calculates the circular distance between two numbers, e.g. in a residue classes or on a circle
 */
function getCircularDistance(a: number, b: number, n: number) {
    return Math.min(Math.abs(a - b), n - Math.abs(a - b))
}

/**
 * Calculates the position on a circle given the angle and the distance from the center
 * @param angle Angle in degrees
 * @param radius Distance from the center
 */
function getPosForAngleAndRadius(angle: number, radius: number) {
    const x = Math.cos(angle * Math.PI / 180) * radius
    const y = Math.sin(angle * Math.PI / 180) * radius
    return { x, y }
}

function getComputedPosForAngleAndRadius(angle: Ref<number> | number, radius: number | Ref<number>) {
    return computed(() => {
        const x = Math.cos(toValue(angle) * Math.PI / 180) * toValue(radius)
        const y = Math.sin(toValue(angle) * Math.PI / 180) * toValue(radius)
        return { x, y }
    })
}

function getAngleForPos(x: number, y: number) {
    return Math.atan2(y, x) * 180 / Math.PI
}

/** 
 * Gets the assigned angle of the node in degrees
 * @param node The node to get the angle for 
 */
function getAngle(node: RGr.RosGraphNode | string) {
    const key = typeof node === 'string' ? node : node.node.key
    return angleMap.value.get(key) ?? ref(0)
}

/** 
 * Gets the assigned position of the node in degrees
 * @param node The node to get the angle for 
 */
function getPosition(node: RGr.RosGraphNode | string) {
    const key = typeof node === 'string' ? node : node.node.key
    return positionMap.value.get(key) ?? ref({ x: 0, y: 0 })
}

/** 
 * Gets the anchor of the node
 * @param node The node to get the angle for 
 * @param position The source position to get the anchor for
 */
function getAnchor(node: RGr.RosGraphNode | ROS.Node | string, position: Point2D): Anchor {
    let key: string
    if (typeof node === 'string') {
        key = node
    } else if (node instanceof RGr.RosGraphNode) {
        key = node.node.key
    } else {
        key = node.key
    }
    return anchorStore.getNodeAnchor(key, props.name).getAnchor(position)
}



////////////////////////////////////////////////////////////////////////////
// Graph data
////////////////////////////////////////////////////////////////////////////

const visibleNodes = computed(() => {
    const nodes = new Array<ROS.Node>()
    const hidden = props.hiddenNodes ?? new Set<string>()
    for (const node of props.nodes) {
        if (!hidden.has(node.key)) {
            nodes.push(node)
        }
    }
    return Array.from(nodes)
})

/** Graph Data from the nodes */
const graphData = computed(() => {
    return new RGr.RosGraphData(visibleNodes.value)
})

/** Graph node mapping */
const graphNodes = computed(() => {
    return graphData.value.nodes.map(n => new RGr.RosGraphNode(n, graphData.value))
})

/** The actual graph containing the graph nodes */
const nodeGraph = computed(() => {
    return new RGr.RosNodeGraph(graphNodes.value)
})

/** The connection components of the graph */
const connectionComponents = computed(() => nodeGraph.value.getConnectionComponents(props.graphSorting, props.usePubSubConnections, props.useServiceConnections, props.useBroadcastConnections))
// const connectionComponents = computed(() => nodeGraph.value.getConnectionComponents(props.graphSorting, true, false, false))

/** The number of nodes in the graph */
const countNodes = computed(() => graphNodes.value.length)
/** The number of connected components */
const countConnectedComponents = computed(() => connectionComponents.value.length)

// watch(() => connectionComponents.value, () => {
//     console.log("Update eval")
//     const nodeSorting = new Array<RGr.RosGraphNode>()
//     connectionComponents.value.forEach(component => {
//         nodeSorting.push(...component)
//     });
//     const evaluation = new RGr.SortingEvaluation(nodeGraph.value, nodeSorting)
//     evaluation.calculate()
// }, { immediate: true })

////////////////////////////////////////////////////////////////////////////
// Visual calculations
////////////////////////////////////////////////////////////////////////////

// const startAngle = computed(() => props.circleGap / 2 + props.startAngleOffset + addAngle.value)
const startAngle = ref(0)

// const restAngle = computed(() => 360 - props.circleGap)
// const restAngle = computed(() => (connectionComponents.value.length > 1 ? 360 : 270) - props.circleGap)
const restAngle = computed(() => (connectionComponents.value.length > 1 ? 360 : 360) - props.circleGap)

/**
 * The angle between two nodes of the same connected component
 */
const nodesGapAngle = computed(() => {
    // We want to fill the circle the following way:
    // > restAngle = (countNodes) * nodesGapAngle + (countConnectedComponents) * connectedGapAngle
    // with connectedGapAngle = nodesGapAngle * connectedGapFactor
    // > restAngle = (countNodes) * nodesGapAngle + (countConnectedComponents) * nodesGapAngle * connectedGapFactor
    // > nodesGapAngle = restAngle / (countNodes + (countConnectedComponents) * connectedGapFactor)
    // console.log(restAngle.value, countNodes.value, countConnectedComponents.value, props.connectedGapFactor, connectionComponents.value)
    const gapFac = countConnectedComponents.value > 1 ? props.connectedGapFactor : 1
    const val = restAngle.value / (countNodes.value + (countConnectedComponents.value) * gapFac);
    // return Math.min(val, 22.5)

    return val
})

/**
 * The angle between two nodes of different connected components
 */
const connectedGapAngle = computed(() => nodesGapAngle.value * props.connectedGapFactor)

/** Mapping node keys to the assigned angle in the circle */
const angleMap: Ref<Map<string, Ref<number>>> = ref(new Map());
watch([() => connectionComponents.value, () => connectedGapAngle.value, () => startAngle.value], () => {
    // console.log("Update angle map", {
    //     connectionComponents: connectionComponents.value,
    //     connectedGapAngle: connectedGapAngle.value,
    //     startAngle: startAngle.value,
    //     nodesGapAngle: nodesGapAngle.value,
    //     restAngle: restAngle.value,
    //     countNodes: countNodes.value,
    //     countConnectedComponents: countConnectedComponents.value,
    // })

    const newAngleMap = new Map<string, Ref<number>>()
    const angleChangeValue = ref(0)

    let nodeNr = 0;
    for (const [connectedIndex, nodes] of connectionComponents.value.entries()) {
        if (nodes.length === 0) continue
        for (const [nodeIndex, node] of nodes.entries()) {
            nodeNr++;
            // Avoid local space issues
            const currentNr = nodeNr
            const oldVal = angleMap.value.get(node.node.key)
            const newVal = connectedIndex * connectedGapAngle.value + (currentNr) * nodesGapAngle.value
            const currentVal = ref((oldVal?.value ?? 0) - startAngle.value)
            gsap.to(currentVal, { duration: oldVal ? 2 : 0, value: newVal })

            newAngleMap.set(node.node.key, computed(() => {
                const angle = startAngle.value + currentVal.value
                // const angle = startAngle.value + currentNr * nodesGapAngle.value
                return angle
            }))
        }
    }

    angleMap.value = newAngleMap

    // angleMap.value.map((v, k) => [k, v.value])
    // console.table(Array.from(angleMap.value.entries()).map(([k, v]) => [k, v.value]))
    // console.log("Finished update angle map")
}, { immediate: true })

const nodesSortedByAngle = computed(() => {
    const nodes = [...graphNodes.value]
    nodes.sort((a, b) => getAngle(a).value - getAngle(b).value)
    return nodes
})

/** Mapping node keys to the assigned position in the circle */
// const positionMap = reactive<Map<string, Point2D>>(new Map())
const positionMap = ref<Map<string, ComputedRef<Point2D>>>(new Map())

watch([() => angleMap.value], () => {

    // console.log("Update position map")
    const newPositions = new Map<string, ComputedRef<Point2D>>()

    for (const [key, angle] of angleMap.value.entries()) {
        newPositions.set(key, getComputedPosForAngleAndRadius(angle, _outerRadius))
    }
    positionMap.value = newPositions

    // console.log("Finished update position map")
}, { immediate: true })

/**
 * The line data to draw between the nodes
 */
const connectionLines = computed(() => {
    // console.log("Update connection lines")
    const lines: ComputedRef<LineData>[] = []
    // console.log("Update connection lines")

    // The lines between the nodes are calculated as follows:
    // Start and end point are the center of the nodes.
    // We take one helping point between the nodes:
    // > The angle of the helping point is the average of the angles of the start and end node.
    // > The distance of the helping point to the center is calculated as follows:

    // If the connection does not bridge any other nodes, we place helping point on the outer circle, thus the distance is the outer radius.
    // If the connection bridges other nodes, we place the helping point inside the circle:
    // The maximum distance is the outer radius * props.maxInnerRadiusFactor.
    // The minimum distance is the outer radius * props.minInnerRadiusFactor.
    // The more nodes are bridged by a connection line, the smaller the distance of the helping point to the minimum distance.
    // The minimum distance is reached when the connection line bridges 180° of the circle.
    // The maximum distance is reached when the connection line bridges a node, thus at nodesGapAngle.value * 2. 

    const angleForMaxDistance = nodesGapAngle.value * 2
    // const angleForMaxDistance = 0
    const angleForMinDistance = restAngle.value - nodesGapAngle.value * 0.5
    const angleRange = angleForMinDistance - angleForMaxDistance

    const minInnerRadius = _outerRadius.value * props.minInnerRadiusFactor
    const maxInnerRadius = _outerRadius.value * props.maxInnerRadiusFactor
    const innerRadiusRange = maxInnerRadius - minInnerRadius

    const minOuterRadius = _outerRadius.value * props.minOuterRadiusFactor
    const maxOuterRadius = _outerRadius.value * props.maxOuterRadiusFactor
    const outerRadiusRange = maxOuterRadius - minOuterRadius

    const distanceBetween2Nodes = _outerRadius.value * 2 * Math.PI * nodesGapAngle.value / 360

    for (const [nodesIndex, nodes] of connectionComponents.value.entries()) {
        for (const [nodeIndex, node] of nodes.entries()) {

            const pubNodes = node.nodesPublishedTo;
            const clientNodes = node.nodesClientsConnectedTo;

            // Get broadcast nodes and filter out the ones that are already in pubNodes or clientNodes
            const broadcastNodes: ROS.Node[] = node.nodesBroadcastedTo.filter(n => !pubNodes.includes(n) && !clientNodes.includes(n));

            const elements: { nodes: ROS.Node[], type: "PubSub" | "Service" | "Broadcast" }[] = [
                // { nodes: pubNodes, type: "PubSub" },
                // { nodes: clientNodes, type: "Service" },
            ]
            if (props.showPubSubConnections) elements.push({ nodes: pubNodes, type: "PubSub" })
            if (props.showServiceClientConnections) elements.push({ nodes: clientNodes, type: "Service" })
            if (props.showBroadcastConnections) elements.push({ nodes: broadcastNodes, type: "Broadcast" })

            elements.forEach(element => {
                element.nodes.forEach(targetNode => {

                    const computedLineData = computed(() => {
                        const startPoint = {
                            x: getPosition(node).value.x,
                            y: getPosition(node).value.y,
                        }

                        const endPoint = {
                            x: getPosition(targetNode.key).value.x,
                            y: getPosition(targetNode.key).value.y,
                        }

                        const startAngle = getAngle(node).value
                        const endAngle = getAngle(targetNode.key).value
                        const deltaAngleRaw = (endAngle - startAngle)

                        //const deltaAngle = deltaAngleRaw <= 180 ? deltaAngleRaw : deltaAngleRaw - 360
                        let deltaAngle = deltaAngleRaw
                        let deltaAngleNormalized = deltaAngleRaw

                        if (deltaAngleRaw <= -180) deltaAngleNormalized = deltaAngleRaw + 360
                        else if (deltaAngleRaw > -180 && deltaAngleRaw <= 180) deltaAngleNormalized = deltaAngleRaw
                        else deltaAngleNormalized = deltaAngleRaw - 360

                        // const cDeltaAngle = getCircularDistance(startAngle, endAngle, 360) // does not return negative values

                        let midAngle = startAngle - deltaAngle / 2

                        const deltaAngleAbs = Math.abs(deltaAngle)

                        let isOuterCircle = deltaAngle < 0



                        let radius = _outerRadius.value
                        let indexNode = nodesSortedByAngle.value.indexOf(node)
                        let indexTargetNode = nodesSortedByAngle.value.indexOf(nodeGraph.value._nodeMap.get(targetNode)!)
                        // let indexDistance = getCircularDistance(indexNode, indexTargetNode, countNodes.value)
                        let indexDistance = Math.abs(indexNode - indexTargetNode)



                        if (indexDistance == 1) {
                            const isDoubleLine = nodeGraph.value._nodeMap.get(targetNode)!.successorNodes.includes(node.node) || (props.showBroadcastConnections && element.type === "Broadcast")
                            let doubleLineDistance = isDoubleLine ? distanceBetween2Nodes / 5 : 0

                            if (deltaAngle >= 0) {
                                radius = _outerRadius.value - doubleLineDistance
                            } else {
                                radius = _outerRadius.value + doubleLineDistance
                            }
                        } else {
                            const angleDistanceFrom180 = Math.abs(180 - deltaAngleAbs)

                            // const angleOverMaxAngle = Math.max(0, deltaAngleAbs - angleForMaxDistance)
                            const angleOverMaxAngle = Math.max(0, Math.abs(deltaAngleNormalized) - angleForMaxDistance)

                            const distanceRangeFactor = (angleRange - angleOverMaxAngle) / angleRange


                            // if (node.node.name == "display_eye_left" && targetNode.name == "i2c_bridge_node") {
                            //     const table = {
                            //         // [console.log("Angles:", startAngle, endAngle, deltaAngleRaw, deltaAngle, deltaAngleAbs, midAngle, isOuterCircle)]
                            //         "start": startAngle,
                            //         "end": endAngle,
                            //         "deltaRaw": deltaAngleRaw,
                            //         "deltaAngleNormalized": deltaAngleNormalized,
                            //         "angleForMaxDistance": angleForMaxDistance,
                            //         "angleForMinDistance": angleForMinDistance,
                            //         "nodesGapAngle": nodesGapAngle.value,
                            //         "restAngle": restAngle.value,
                            //         "delta": deltaAngle,
                            //         "deltaAbs": deltaAngleAbs,
                            //         "mid": midAngle,
                            //         "isOuter": isOuterCircle,
                            //         "angleRange": angleRange,
                            //         "angleDistanceFrom180": angleDistanceFrom180,
                            //         "angleOverMaxAngle": angleOverMaxAngle,
                            //         "distanceRangeFactor": distanceRangeFactor,
                            //     }
                            //     console.table(table)
                            // }

                            if (!isOuterCircle) {
                                // radius = minInnerRadius + innerRadiusRange * distanceRangeFactor
                                radius = maxInnerRadius - innerRadiusRange * (1 - distanceRangeFactor)
                            } else {
                                radius = minOuterRadius + outerRadiusRange * (1 - distanceRangeFactor)
                            }
                        }

                        // const deltaAngle = (startAngle - endAngle) // Math.abs
                        // const radius = props.outerRadius - (props.outerRadius - maxInnerRadius.value) * Math.min(1, Math.abs(deltaAngle) / 90) * negFac
                        const angleMidPosition = getComputedPosForAngleAndRadius(midAngle, _outerRadius.value)
                        const anchorNode = getAnchor(node, angleMidPosition.value).anchor.value
                        const anchorTargetNode = getAnchor(targetNode, angleMidPosition.value).anchor.value

                        const angleNodeAnchor = getAngleForPos(anchorNode.x, anchorNode.y)
                        // const angleNodeAnchor = modPositive(getAngleForPos(anchorNode.x, anchorNode.y), 360)
                        const angleTargetNodeAnchor = getAngleForPos(anchorTargetNode.x, anchorTargetNode.y)
                        // const angleTargetNodeAnchor = modPositive(getAngleForPos(anchorTargetNode.x, anchorTargetNode.y), 360)


                        let midAngleAnchor = (angleNodeAnchor + angleTargetNodeAnchor) / 2
                        if (Math.abs(modPositive(midAngleAnchor, 360) - modPositive(startAngle, 360)) > 90 && Math.abs(modPositive(midAngleAnchor, 360) - modPositive(endAngle, 360)) > 90) {
                            midAngleAnchor = (midAngleAnchor + 180) % 360
                        }

                        // const midPosition = getComputedPosForAngleAndRadius(midAngle, radius)
                        const midPosition = getComputedPosForAngleAndRadius(midAngleAnchor, radius)

                        const controlPointMiddle = {
                            x: midPosition.value.x,
                            y: midPosition.value.y,
                        }

                        const radDif = _outerRadius.value - radius
                        const cpRadHalf = _outerRadius.value - radDif / 2
                        const startControlPoint = getComputedPosForAngleAndRadius(startAngle + (deltaAngle * 1 / 6), cpRadHalf)
                        const endControlPoint = getComputedPosForAngleAndRadius(endAngle - (deltaAngle * 1 / 6), cpRadHalf)

                        const strokeWidth = element.type === "PubSub" ? props.strokeWidthPubSub : props.strokeWidthService

                        const points = []
                        if (true && isOuterCircle && indexDistance != 1) {
                            const startControlPoint = getComputedPosForAngleAndRadius(startAngle, _outerRadius.value + 40)
                            const endControlPoint = getComputedPosForAngleAndRadius(endAngle, _outerRadius.value + 40)
                            const controlPointLen = (radius - _outerRadius.value) * 0.5 // -deltaAngle * 0.5
                            points.push(...[
                                getAnchor(node, startControlPoint.value).anchor.value,
                                getAnchor(node, startControlPoint.value).getDirectionPoint(controlPointLen).value,
                                controlPointMiddle,
                                getAnchor(targetNode, endControlPoint.value).getDirectionPoint(controlPointLen).value,
                                getAnchor(targetNode, endControlPoint.value).anchor.value

                            ])
                            // points.push(...[
                            //     getAnchor(node, startControlPoint.value).anchor.value,
                            //     startControlPoint,
                            //     controlPointMiddle,
                            //     endControlPoint,
                            //     getAnchor(targetNode, endControlPoint.value).anchor.value
                            // ])
                        } else {
                            points.push(...[
                                getAnchor(node, controlPointMiddle).anchor.value,
                                controlPointMiddle,
                                getAnchor(targetNode, controlPointMiddle).anchor.value

                            ])
                        }


                        return {
                            points: points,
                            startNode: node.node,
                            endNode: targetNode,
                            type: element.type as LineType
                        }
                    })
                    lines.push(computedLineData)
                });
            });;
        }

    }
    // console.log("Update connection lines finished")
    return lines
})


////////////////////////////////////////////////////////////////////////////
// Lifecycle hooks
////////////////////////////////////////////////////////////////////////////

onMounted(() => {
    // console.log("Mounted Circular View")

    watch([() => props.circleGap, () => props.startAngleOffset], () => {
        // console.log("Update start angle")
        const duration = 0
        const newVal = props.circleGap / 2 + props.startAngleOffset
        // startAngle.value = newVal
        gsap.to(startAngle, { duration: duration, value: newVal })
    }, { immediate: true })

    watch([() => props.outerRadius], () => {
        const duration = 1
        const newVal = props.outerRadius
        gsap.to(_outerRadius, { duration: duration, value: newVal })
    }, { immediate: true })
})

const updateBboxThrottled = useThrottleFn(() => {
    nextTick(() => {
        updateBBox()
    })
}, 100)

onUpdated(() => {
    updateBboxThrottled();
    // console.log("Updated Circular View")
})


////////////////////////////////////////////////////////////////////////////
// Style classes getters
////////////////////////////////////////////////////////////////////////////

/**
 * Returns the style classes for a node based on the current state of selected and hovered node 
 * @param node The node to get the style class for
 */
function circleClass(node: RGr.RosGraphNode) {
    const classes = ["node"]
    if (node.node.key == props.selectedNode) {
        classes.push("node-selected")
    } else if (node.node.key == props.hoveredNode) {
        classes.push("node-hovered")
    } else if (graphData.value.nodeMap.has(props.hoveredNode ?? "")) {
        const pred = node.predecessorNodes
        const succ = node.successorNodes
        const nodeNames = new Set<string>(pred?.concat(succ ?? []).map(n => n.key) ?? [])

        if (nodeNames.has(props.hoveredNode ?? "")) {
            classes.push("node-hovered-adjacent")
        }
    }
    return classes.join(" ")
}

/**
 * Returns the style classes for a line based on the current state of selected and hovered node 
 * @param line The line to get the style class for
 */
function lineClass(line: LineData) {
    const clases = ["line"]

    if (line.type === "PubSub") {
        clases.push("line-pubsub")
    } else if (line.type === "Service") {
        clases.push("line-service")
    } else if (line.type === "Broadcast") {
        clases.push("line-broadcast")
    }

    let small = true
    if (props.selectedNode === line.startNode.key || props.selectedNode === line.endNode.key) {
        clases.push("line-selected")
        small = false
    }
    if (props.hoveredNode === line.startNode.key || props.hoveredNode === line.endNode.key) {
        clases.push("line-hovered")
        small = false
    }

    if (small && (props.selectedNode || props.hoveredNode)) {
        clases.push("line-smaller")
    }

    // const clases = ["line line-pubsub line-smaller"]

    return clases.join(" ")
}

////////////////////////////////////////////////////////////////////////////
// Expose
////////////////////////////////////////////////////////////////////////////

defineExpose({
    bBox
})

</script>

<style scoped lang="scss">
$line-width: 2;

.test {
    --line-width: 1;
}

.marker::ng-deep path {
    stroke: none;
    fill: var(--q-stroke);
}

.line {
    stroke: white;
    fill: none;
    opacity: 0.8;

    stroke-width: var(--adapted-line-width, var(--line-width));
}

.line-pubsub {
    stroke: var(--q-stroke-pubsub);
    --line-width: v-bind("props.strokeWidthPubSub");
}

.line-service {
    stroke: var(--q-stroke-service);
    --line-width: v-bind("props.strokeWidthService");
}

.line-broadcast {
    stroke: var(--q-stroke-broadcast);
    --line-width: v-bind("props.strokeWidthBroadcast");
}

.line-smaller {
    opacity: 0.2;
    --adapted-line-width: calc(var(--line-width) / 3);
}

.line-selected {
    stroke-opacity: 0.9;
    // --line-width: 4;
    --adapted-line-width: calc(var(--line-width) * 1.5);
}

.line-hovered {
    stroke-opacity: 0.9;
    --adapted-line-width: calc(var(--line-width) * 1.5);
}
</style>