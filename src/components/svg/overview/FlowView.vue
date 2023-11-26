<template>
    <rect :x="bBox?.x ?? 0" :y="bBox?.y ?? 0" :width="bBox?.width ?? 0" :height="bBox?.height ?? 0" fill="white"
        stroke="white" stroke-width="1" opacity="0" />
    <g ref="refGRoot">
        <!-- For mouse event -->

        <Marker marker-type="arrow" :marker-name="markerName" align="end" :height="markerHeight" :width="markerWidth"
            marker-units="strokeWidth" class="marker" :offset-x="0"></Marker>
        <!-- <SvgLine :points="[{ x: 0, y: 200 }, { x: 100, y: 100 }, { x: 200, y: 200 }]" curve-style="basis" marker-end="arrow"
            :marker-length="markerWidth" marker-start="arrow" style-class="line test" /> -->

        <circle x="0" y="0" fill="white" opacity="0.00" :r="outerRadius * 1.00">

        </circle>

        <SvgRosNode :node-key="selectedNode ?? ''" :width="centralNodeWidth"></SvgRosNode>

        <g v-if="true">
            <SvgLine v-for="line in betweenNodeLines" :points="line.value.points" :curve-style="'basis'"
                :marker-end="markerName" :marker-length="markerWidth" :style-class="lineClass(line.value)" />
        </g>


        <g v-if="true">
            <!-- d3.curveNatural -->
            <SvgLine v-for="line in connectionLines" :points="line.value.points" :curve-style="'basis'"
                :marker-end="markerName" :marker-length="markerWidth" :style-class="lineClass(line.value)" />
        </g>

        <g v-for="(node, nodeIndex) in displayedNodes" @click="selectSecondaryNode(node.node)"
            @dblclick="selectNode(node.node)" :key="node.key" @mouseenter="hoverNode(node, node.type)"
            @mouseleave="hoverNode(undefined)">
            <RectNode :node="node.node" :cx="getPosition(node.key).value.x" :cy="getPosition(node.key).value.y"
                :width="sideNodeWidth" :height="sideNodeHeight" :anchor-key="node.key" :anchor-mapping-prefix="name"
                :type="node.type" :style-class="circleClass(node.node)" :angle="0" :adaptive-radius="false" />
        </g>


        <!-- <g v-if="false">
            <SvgLine v-for="line in debugLines" :points="line.value.points" curve-style="natural" :marker-end="markerName"
                :style-class="'line'" />
        </g> -->

        <circle r="10" stroke="red" stroke-width="0.2" fill="none" opacity="0" />
    </g>
</template>

<script setup lang="ts">
import { onMounted, watch, type Ref, nextTick, computed, ref, reactive, onUpdated, ComputedRef, toValue, customRef, triggerRef } from "vue"
import * as d3 from "d3"
import gsap from 'gsap';

import * as RGr from 'src/ros/rosGraph'
import * as ROS from 'src/ros/rosNode'
import type { Point2D } from "stores/anchors"
import { BBox } from "../scripts/directives"
import { useNodeAnchorStore } from "src/stores/nodeAnchors"

import SvgLine from "components/svg/connection/SvgLine.vue"
import Marker from "components/svg/connection/Marker.vue"

import CircleNode from "components/svg/overview/nodes/CircleNode.vue"
import SvgRosNode from "../node/SvgRosNode.vue";
import SvgRosTopic from "../node/SvgRosTopic.vue";
import SvgRosTopicSubGroup from "../node/SvgRosTopicSubGroup.vue";


import RectNode from "./nodes/RectNode.vue";
import { Anchor, ObjectAnchor } from "../composables/anchor"
import { useDebounceFn, useThrottleFn } from "@vueuse/core";
import { modPositive } from "src/utils/helper";
import { useRosStore } from "src/stores/ros";
import { link } from "fs";


////////////////////////////////////////////////////////////////////////////
// Anchor store to get node positions
////////////////////////////////////////////////////////////////////////////
const anchorStore = useNodeAnchorStore()
const rosStore = useRosStore()

////////////////////////////////////////////////////////////////////////////
// Emit events
////////////////////////////////////////////////////////////////////////////
const emit = defineEmits<{
    (e: 'selectedNode', node: string): void,
    (e: 'selectedSecondaryNode', node: string): void,
    (e: 'hoveredNode', node: string | null): void,
}>()

function selectNode(node: RGr.RosGraphNode | null) {
    if (node === null) return
    emit('selectedNode', node.node.key)
}

function selectSecondaryNode(node: RGr.RosGraphNode | null) {
    if (node === null) return
    emit('selectedSecondaryNode', node.node.key)
}

const activeType = ref<string | null>(null)



const lastHoveredNode = ref<RGr.RosGraphNode | undefined>(undefined)
const debouncedNodeHover = useDebounceFn(() => {
    if (!lastHoveredNode.value) {
        // emit('hoveredNode', node.node.key)
        emit('hoveredNode', null)
    }
}, 300)

function hoverNode(node: RGr.RosGraphNode | undefined, type: typeOfNode) {
    if (node !== undefined) {
        emit('hoveredNode', node.node.key)
        // debouncedNodeHover();
        // emit('hoveredNode', null)
        // return
    }
    activeType.value = type
    lastHoveredNode.value = node
    debouncedNodeHover();
}

////////////////////////////////////////////////////////////////////////////
// Props
////////////////////////////////////////////////////////////////////////////
const props = withDefaults(defineProps<{
    /** Name to distinguish between multiple circular views */
    name?: string,

    /** List of nodes to visualize */
    nodes: ROS.Node[],

    /** Selected node displayed in the circular view */
    selectedNode?: string,
    /** Hovered node displayed in the circular view */
    hoveredNode?: string,
    secondaryNode?: string,

    /** The topic that is selected */
    selectedTopic?: ROS.Topic,

    graphSorting?: "topological" | "flow",

    // Visual parameters
    markerWidth?: number,
    markerHeight?: number,
    strokeWidthPubSub?: number,
    strokeWidthService?: number,
    strokeWidthNode?: number,

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


    centralNodeWidth?: number,
    sideNodeWidth?: number,
    sideNodeHeight?: number,
    nodesVerticalGap?: number,
    nodesHorizontalGap?: number,

    centralNodeHorizontalGap?: number,

    /** Flag to show or hide PubSub connections */
    showPubSubConnections?: boolean,

    /** Flag to show or hide Broadcast connections */
    showBroadcastConnections?: boolean,

    /** Flag to show or hide ServiceClient connections */
    showServiceClientConnections?: boolean,

}>(), {
    name: "FlowView",
    graphSorting: "flow",
    markerWidth: 5,
    markerHeight: 5,
    strokeWidthPubSub: 1.5,
    strokeWidthService: 1.5,
    strokeWidthNode: 1,
    outerRadius: 300,
    maxInnerRadiusFactor: 0.8,
    minInnerRadiusFactor: 0.1,
    maxOuterRadiusFactor: 1.9,
    minOuterRadiusFactor: 1.2,
    startAngleOffset: -90,
    circleGap: 0,
    connectedGapFactor: 1.5,
    centralNodeWidth: 600,
    sideNodeWidth: 130,
    sideNodeHeight: 30,
    nodesVerticalGap: 30,
    nodesHorizontalGap: 50,
    centralNodeHorizontalGap: 100,

    showPubSubConnections: true,
    showBroadcastConnections: false,
    showServiceClientConnections: true,
})

const markerName = computed(() => "marker-" + props.name)
const updateLines = ref(0)


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

type LineType = "PubSub" | "Service" | "Node"

interface LineData {
    points: Point2D[],
    startNode: ROS.Node,
    endNode: ROS.Node,
    type: LineType,
    topic?: string,
    side?: "predecessor" | "successor",
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

/** Graph Data from the nodes */
const graphData = computed(() => {
    return new RGr.RosGraphData(props.nodes)
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
const connectionComponents = computed(() => nodeGraph.value.getConnectionComponents(props.graphSorting, props.showPubSubConnections, props.showServiceClientConnections, props.showBroadcastConnections))

/** The number of nodes in the graph */
const countNodes = computed(() => graphNodes.value.length)
/** The number of connected components */
const countConnectedComponents = computed(() => connectionComponents.value.length)

//++++ NEW ++++//

/** The selected GraphNode as center of the flow view */
const selectedGraphNode = computed(() => {
    if (props.selectedNode === undefined) return undefined
    return nodeGraph.value.getGraphNode(props.selectedNode)
})

const successorNodes = computed(() => {
    if (selectedGraphNode.value === undefined) return []
    return nodeGraph.value.getSuccessorNodes(selectedGraphNode.value, props.showPubSubConnections, props.showServiceClientConnections, props.showBroadcastConnections);
})

const predecessorNodes = computed(() => {
    if (selectedGraphNode.value === undefined) return []
    return nodeGraph.value.getPredecessorNodes(selectedGraphNode.value, props.showPubSubConnections, props.showServiceClientConnections, props.showBroadcastConnections);
})

type typeOfNode = "successor" | "predecessor" | "central"
function getKey(node: RGr.RosGraphNode | ROS.Node, type: typeOfNode) {
    let key = ""
    if (node instanceof RGr.RosGraphNode) {
        key = node.node.key
    } else if (node instanceof ROS.Node) {
        key = node.key
    }
    return type + key
}

const displayedNodes = computed(() => {
    if (selectedGraphNode.value === undefined) return []

    const nodes = []
    // nodes.push({ key: getKey(selectedGraphNode.value, "selected"), node: selectedGraphNode.value })
    nodes.push(...predecessorNodes.value.map(n => { return { key: getKey(n, "predecessor"), node: n, type: "predecessor" as typeOfNode } }).filter(n => n.node.key !== selectedGraphNode.value!.node.key))
    nodes.push(...successorNodes.value.map(n => { return { key: getKey(n, "successor"), node: n, type: "successor" as typeOfNode } }).filter(n => n.node.key !== selectedGraphNode.value!.node.key))
    console.log("New displayed nodes")
    return nodes
})

const successorGenerations = computed(() => {
    if (selectedGraphNode.value === undefined) return []
    const successorNodesWithoutSelected = successorNodes.value.filter(n => n.node.key !== selectedGraphNode.value!.node.key)
    return nodeGraph.value.getTopologicalGenerations(undefined, props.showPubSubConnections, props.showServiceClientConnections, props.showBroadcastConnections, successorNodesWithoutSelected);
})

const predecessorGenerations = computed(() => {
    if (selectedGraphNode.value === undefined) return []
    const predecessorNodesWithoutSelected = predecessorNodes.value.filter(n => n.node.key !== selectedGraphNode.value!.node.key)
    const gens = nodeGraph.value.getTopologicalGenerations(undefined, props.showPubSubConnections, props.showServiceClientConnections, props.showBroadcastConnections, predecessorNodesWithoutSelected);
    // console.log("predecessorGenerations", gens)
    return gens.reverse()
})

// watch([successorGenerations, predecessorGenerations], () => {
//     console.log("Update real generations", successorGenerations.value, predecessorGenerations.value)
// })

/** The component of the selected node, including service connections */
const component = computed(() => {
    if (props.selectedNode === undefined) return []
    return nodeGraph.value.getConnectedComponent(selectedGraphNode.value, true, true, true);
})

const componentNodeSet = computed(() => {
    if (props.selectedNode === undefined) return new Set<string>()
    return new Set(component.value.map(n => n.node.key))
})

const generations = computed(() => {
    if (selectedGraphNode.value === undefined) return []
    return nodeGraph.value.getTopologicalGenerations(selectedGraphNode.value, true);
    // return nodeGraph.value.getTopologicalGenerations(selectedGraphNode.value, true, true);
})

const generationIndexOfSelectedNode = computed(() => {
    if (selectedGraphNode.value === undefined) return 0
    return generations.value.findIndex(g => g.nodes.includes(selectedGraphNode.value!))
})

// watch([generations, generationIndexOfSelectedNode], () => {
//     console.log("Update generations", generations.value, generationIndexOfSelectedNode.value)
// }, { immediate: true })


////////////////////////////////////////////////////////////////////////////
// Visual calculations
////////////////////////////////////////////////////////////////////////////

//++++ NEW ++++//

const positionMap = ref<Map<string, ComputedRef<Point2D>>>(new Map());

// const vGap = ref(200)
// const hGap = ref(50)

watch([predecessorGenerations, successorGenerations], () => {

    const newPositionMap = new Map<string, ComputedRef<Point2D>>();

    const generationsSides = [
        { gens: predecessorGenerations.value, side: "left", type: "predecessor" },
        { gens: successorGenerations.value, side: "right", type: "successor" }
    ];

    let currentOffset = 0;
    const hOffset = new Map<string, number>();

    generationsSides.forEach(side => {
        const gens = side.gens
        gens.forEach((gen, genIndex) => {
            gen.nodes.forEach((node, nodeIndex) => {
                // const key = getKey(node, side.type as typeOfNode)
                const key = node.node.key
                if (!hOffset.has(key)) {
                    hOffset.set(key, currentOffset)
                    currentOffset += props.nodesVerticalGap + props.sideNodeHeight;
                }
            })
        })
    })

    const yStart = -(currentOffset - props.nodesVerticalGap - props.sideNodeHeight) / 2;


    generationsSides.forEach(obj => {
        const gens = obj.gens
        const side = obj.side
        const sideFac = side === "left" ? -1 : 1

        const nodesInGeneration = gens.length
        // const startPos = -nodesInGeneration / 2 * hGap.value
        const startPos = yStart

        for (let genIndex = 0; genIndex < gens.length; genIndex++) {
            const generation = gens[genIndex];

            for (let nodeIndex = 0; nodeIndex < generation.nodes.length; nodeIndex++) {
                const node = generation.nodes[nodeIndex];
                // const key = node.node.key
                const key = getKey(node, obj.type as typeOfNode)

                const xStart = props.centralNodeWidth / 2 + props.sideNodeWidth / 2 + props.centralNodeHorizontalGap
                const x = (xStart + (genIndex + 0) * (props.nodesHorizontalGap + props.sideNodeWidth)) * sideFac
                // const y = startPos + nodeIndex * hGap.value
                const y = yStart + hOffset.get(node.node.key)!

                newPositionMap.set(key, computed(() => {
                    return { x, y }
                }))
            }
        }
    })

    positionMap.value = newPositionMap

}, { immediate: true })



const connectionLines: Ref<ComputedRef<LineData>[]> = ref([])
watch(updateLines, () => {

    const lines: ComputedRef<LineData>[] = [];


    const generationsSides = [
        { gens: predecessorGenerations.value, side: "left", type: "predecessor" },
        { gens: successorGenerations.value, side: "right", type: "successor" }
    ];

    generationsSides.forEach(side => {
        const gens = side.gens

        gens.forEach((gen, genIndex) => {
            gen.nodes.forEach((node, nodeIndex) => {
                const key = getKey(node, side.type as typeOfNode)
                const nodeAnchor = anchorStore.getNodeAnchor(key, props.name).getAnchor(mousePos)

                const fromNode = side.type === "predecessor" ? node : selectedGraphNode.value!
                const toNode = side.type === "predecessor" ? selectedGraphNode.value! : node
                const links = nodeGraph.value.getLinksBetweenNodes(fromNode, toNode, props.showPubSubConnections, props.showServiceClientConnections, props.showBroadcastConnections)
                // console.log("Links for node", node.node.name, side.side, links) 
                links.forEach(link => {
                    const topicName = link.data.topic;


                    const computedLineData = computed(() => {

                        const startPoint = {
                            x: nodeAnchor.x + 0,
                            y: nodeAnchor.y + 0,
                        }

                        const midPointStart = {
                            x: nodeAnchor.getDirectionPoint(props.nodesHorizontalGap).value.x,
                            y: nodeAnchor.getDirectionPoint(props.nodesHorizontalGap).value.y,
                        }

                        const topicAnchor = anchorStore.getTopicAnchor(selectedGraphNode.value!.node.key, topicName, "", side.side).getAnchor(startPoint)

                        const endPoint = {
                            x: topicAnchor.x,
                            y: topicAnchor.y,
                        }

                        const midPointEnd = {
                            x: topicAnchor.getDirectionPoint(props.centralNodeHorizontalGap / 2).value.x,
                            y: topicAnchor.getDirectionPoint(props.centralNodeHorizontalGap / 2).value.y,
                        }

                        // const midPoint = nodeAnchor.getDirectionPoint(100)

                        const points = []
                        points.push(...[
                            toValue(startPoint),
                            toValue(midPointStart),
                            toValue(midPointEnd),
                            toValue(endPoint),
                            // getAnchor(node, controlPointMiddle).anchor.value,
                            // controlPointMiddle,
                            // getAnchor(targetNode, controlPointMiddle).anchor.value
                        ])

                        // console.log("Update debug line for topic", topic.name, points, topicAnchor)

                        const ordererdPoints = side.type === "predecessor" ? points : points.reverse()

                        return {
                            points: ordererdPoints,
                            startNode: selectedGraphNode.value!.node,
                            endNode: node.node,
                            side: side.type,
                            topic: topicName,
                            type: link.data.type as LineType //   element.type as LineType
                        }
                    })
                    lines.push(computedLineData)
                });

            })
        })
    })
    connectionLines.value = lines
})

const betweenNodeLines: Ref<ComputedRef<LineData>[]> = ref([])
watch([() => selectedGraphNode.value, anchorStore.anchors], () => {

    const lines: ComputedRef<LineData>[] = [];


    const generationsSides = [
        { gens: predecessorGenerations.value, side: "left", type: "predecessor" },
        { gens: successorGenerations.value, side: "right", type: "successor" }
    ];

    generationsSides.forEach(side => {
        const unorderedGens = side.gens
        const gens = side.type === "predecessor" ? unorderedGens.slice().reverse() : unorderedGens
        // const orderedGens = side.type === "predecessor" ? gens : gens

        gens.forEach((gen, genIndex) => {
            const followingGens = gens.slice(genIndex + 1)
            const followingNodes = followingGens.flatMap(g => g.nodes)
            const followingNodesSet = new Set(followingNodes.map(n => n.node))

            gen.nodes.forEach((startNode, nodeIndex) => {
                const startNodeKey = getKey(startNode, side.type as typeOfNode) + "/right"
                const startNodeAnchor = anchorStore.getNodeAnchor(startNodeKey, props.name).getAnchor(mousePos)

                const successorNodes = startNode.successorNodes
                successorNodes.forEach(endNode => {
                    if (!followingNodesSet.has(endNode)) return

                    const endNodeKey = getKey(endNode, side.type as typeOfNode) + "/left"
                    const endNodeAnchor = anchorStore.getNodeAnchor(endNodeKey, props.name).getAnchor(mousePos)

                    const computedLineData = computed(() => {

                        // const startPoint = {
                        //     x: getPosition(key).value.x + 0,
                        //     y: getPosition(key).value.y + 0,
                        // }

                        const startPoint = {
                            x: startNodeAnchor.x + 0,
                            y: startNodeAnchor.y + 0,
                        }

                        const midPointStart = {
                            x: startNodeAnchor.getDirectionPoint(props.nodesHorizontalGap / 2).value.x,
                            y: startNodeAnchor.getDirectionPoint(props.nodesHorizontalGap / 2).value.y,
                        }

                        // const endPoint = {
                        //     x: mousePos.value.x + 15,
                        //     y: mousePos.value.y + 15,
                        // }
                        const endPoint = {
                            x: endNodeAnchor.x,
                            y: endNodeAnchor.y,
                        }

                        const midPointEnd = {
                            x: endNodeAnchor.getDirectionPoint(props.nodesHorizontalGap / 2).value.x,
                            y: endNodeAnchor.getDirectionPoint(props.nodesHorizontalGap / 2).value.y,
                        }

                        // const midPoint = nodeAnchor.getDirectionPoint(100)

                        const points = []
                        points.push(...[
                            toValue(startPoint),
                            toValue(midPointStart),
                            toValue(midPointEnd),
                            toValue(endPoint),
                            // getAnchor(node, controlPointMiddle).anchor.value,
                            // controlPointMiddle,
                            // getAnchor(targetNode, controlPointMiddle).anchor.value
                        ])

                        // console.log("Update debug line for topic", topic.name, points, topicAnchor)

                        // const orderedPoints = side.type === "predecessor" ? points : points.reverse()
                        const orderedPoints = points

                        return {
                            points: orderedPoints,
                            startNode: startNode.node,
                            endNode: endNode,
                            side: side.type,
                            type: "Node" as LineType //   element.type as LineType
                        }
                    })
                    lines.push(computedLineData)

                });


                const fromNode = side.type === "predecessor" ? startNode : selectedGraphNode.value!
                const toNode = side.type === "predecessor" ? selectedGraphNode.value! : startNode
                // const links = nodeGraph.value.getLinksBetweenNodes(fromNode, toNode)
            })
        })
    })
    betweenNodeLines.value = lines
})

const mousePos = ref({ x: 0, y: 0 })



////////////////////////////////////////////////////////////////////////////
// Lifecycle hooks
////////////////////////////////////////////////////////////////////////////

onMounted(() => {
    // console.log("Mounted Circular View")
    const duration = 0.5
    // console.log(rosStore.nodes)



    watch([() => selectedGraphNode.value, anchorStore.anchors, displayedNodes], () => {

        updateLines.value++
        // console.log("Update lines")
    }, { immediate: true })

    watch([() => rosStore.selectedNode, () => rosStore.selectedSecondaryNode], () => {
        updateLines.value++
        // setTimeout(() => {
        // console.log("Update bbox throttled")
        updateBboxThrottled();
        // }, 100);
    })

    d3.select(refGRoot.value)
        .on("mousemove", (event) => {
            const pos = d3.pointer(event)
            mousePos.value = {
                x: pos[0],
                y: pos[1]
            }
            // console.log("Mouse pos", mousePos.value)
        })

    updateBboxThrottled();
})

const updateBboxThrottled = useThrottleFn(() => {
    nextTick(() => {
        updateBBox()
        // console.log("Update BBox", bBox.value)
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
    } else if (node.node.key == props.hoveredNode || node.node.key == props.secondaryNode) {
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
    } else if (line.type === "Node") {
        clases.push("line-node")
    }

    // let small = true
    // if (props.selectedNode === line.startNode.key || props.selectedNode === line.endNode.key) {
    //     clases.push("line-selected")
    //     small = false
    // }

    if (props.hoveredNode === line.startNode.key || props.hoveredNode === line.endNode.key) {
        clases.push("line-selected")
    } else if (props.hoveredNode) {
        clases.push("line-smaller")
    }

    const selected = rosStore.isSelectedTopic(line.topic, null)
    // if (line.topic) {
    if (selected !== null) {
        if (selected) {
            clases.push("line-selected")
        } else {
            clases.push("line-smaller")
        }
    }
    // } 

    // if (props.selectedTopic) {

    // }

    // if (props.hoveredNode === line.startNode.key || props.hoveredNode === line.endNode.key) {
    //     clases.push("line-hovered")
    //     small = false
    // }

    // if (small && (props.selectedNode || props.hoveredNode)) {
    //     clases.push("line-smaller")
    // }

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
    opacity: 0.7;

    stroke-width: var(--adapted-line-width, var(--line-width));
    // transition: stroke-width 0.2s ease-in-out;
}

.line-pubsub {
    stroke: var(--q-stroke-pubsub);
    --line-width: v-bind("props.strokeWidthPubSub");
}

.line-service {
    stroke: var(--q-stroke-service);
    --line-width: v-bind("props.strokeWidthService");
}

.line-node {
    stroke: var(--q-stroke);
    --line-width: v-bind("props.strokeWidthNode");
}

.line-smaller {
    opacity: 0.2;
    --adapted-line-width: calc(var(--line-width) / 3);
}

.line-selected {
    stroke-opacity: 0.8;
    // --line-width: 4;
    --adapted-line-width: calc(var(--line-width) * 1.5);
}

.line-hovered {
    stroke-opacity: 0.8;
    --adapted-line-width: calc(var(--line-width) * 1.5);
}
</style>