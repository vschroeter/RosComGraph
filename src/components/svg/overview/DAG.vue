<template>
    <g ref="refGRoot">
        <Marker marker-type="arrow" align="end"></Marker>
        <!-- <SvgLine :points="[{ x: 0, y: 300 }, { x: 300, y: 300 }]" curve-style="basis" :stroke-width="2" marker-end="arrow"
            marker-mid="arrow" /> -->

        <g>
            <!-- :stroke-width="line.width" -->
            <SvgLine v-for="line in connectionLines" :points="line.points" curve-style="basis" marker-end="arrow"
                marker-mid="arrow1" :style-class="lineClass(line)" />
        </g>

        <g v-for="(nodes, connectedIndex) in connectedNodes">
            <g v-for="(node, nodeIndex) in nodes" @click="selectNode(node)" @mouseenter="hoverNode(node)"
                @mouseleave="hoverNode(null)">
                <circle :cx="nodeIndex * horizontalSpacing" :cy="connectedIndex * verticalSpacing" r="10"
                    :class="circleClass(node)" />
                <text :x="nodeIndex * horizontalSpacing" :y="(nodeIndex % 2) * 20 + 25 + connectedIndex * verticalSpacing"
                    fill="white" text-anchor="middle">{{ node.node.name }}</text>
            </g>
        </g>

    </g>
</template>

<script setup lang="ts">
import { onMounted, watch, type Ref, toValue, nextTick } from "vue"
import * as d3 from "d3"
import { computed, ref, reactive } from "vue"

import SvgLine from "components/svg/connection/SvgLine.vue"
import Marker from "components/svg/connection/Marker.vue"

// import type { GraphLayoutNode, GraphLayoutLink, GraphLayout, RosGraphData } from "@/ros/rosGraph";
// import { RosGraphNode, RosNodeGraph } from "@/ros/rosGraph";
import * as RGr from 'src/ros/rosGraph'
import * as ROS from 'src/ros/rosNode'
import type { Point2D } from "stores/anchors"
import { BBox } from "../scripts/directives"

const refGRoot = ref<SVGGElement | null>(null)
const bBox = ref<BBox | null>(null)
function updateBBox() {
    if (refGRoot.value) {
        bBox.value = refGRoot.value.getBBox()
        console.log("BBox", bBox.value)
    }
}

const emit = defineEmits<{
    (e: 'selectedNode', node: string): void,
    (e: 'hoveredNode', node: string | null): void,
}>()

const props = defineProps<{
    nodes: ROS.Node[],
    selectedNode?: string,
    hoveredNode?: string,
}>()

const graph = computed(() => {
    return new RGr.RosGraphData(props.nodes)
})

const connectedNodes: Ref<RGr.RosGraphNode[][]> = ref<RGr.RosGraphNode[][]>([])
const nodeMatrix = computed(() => {
    const matrix: Map<string, [number, number]> = new Map()
    for (const [connectedIndex, nodes] of connectedNodes.value.entries()) {
        for (const [nodeIndex, node] of nodes.entries()) {
            matrix.set(node.node.key, [nodeIndex, connectedIndex])
        }
    }
    return matrix
})

const graphNodes = computed(() => {
    return graph.value.nodes.map(n => new RGr.RosGraphNode(n, graph.value))
})

const nodeGraph = computed(() => {
    return new RGr.RosNodeGraph(graphNodes.value)
})

const verticalSpacing = ref(150)
const horizontalSpacing = ref(100)

onMounted(() => {
    console.log("Mounted DAG")
    // return
    watch(() => props.nodes, () => {
        updateDAG()
    }, { immediate: true })
})


function selectNode(node: RGr.RosGraphNode | null) {
    // if (node === null) {
    //     emit('selectedNode', null)
    //     return
    // }
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

function circleClass(node: RGr.RosGraphNode) {

    const classes = ["node"]
    if (node.node.key == props.selectedNode) {
        classes.push("node-selected")
    } else if (node.node.key == props.hoveredNode) {
        classes.push("node-hovered")
    } else if (graph.value.nodeMap.has(props.hoveredNode ?? "")) {
        const pred = node.predecessorNodes
        const succ = node.successorNodes
        const nodeNames = new Set<string>(pred?.concat(succ ?? []).map(n => n.key) ?? [])

        if (nodeNames.has(props.hoveredNode ?? "")) {
            classes.push("node-hovered-adjacent")
        }
    }
    return classes.join(" ")
}

function updateDAG() {
    if (graphNodes.value.length === 0) {
        console.log("No nodes")
        return
    }

    const scoredNodes = graphNodes.value.map(n => {
        const score = n.sourceScorePubSub
        return { node: n, name: n.node.key, score: score, scorePubSub: n.sourceScorePubSub }
    })

    let sortedNodes = scoredNodes.sort((a, b) => b.scorePubSub - a.scorePubSub)

    console.log("DAG: Sorted nodes", sortedNodes)

    console.log("DAG: Topological gens", nodeGraph.value.getTopologicalGenerations(sortedNodes[1].node))

    const newConnectedNodes: RGr.RosGraphNode[][] = []

    while (sortedNodes.length > 0) {
        const startNode = sortedNodes[0].node
        const nodes = nodeGraph.value.getTopologicalSorting(startNode)
        newConnectedNodes.push(nodes)

        // Remove all nodes from sortedNodes
        sortedNodes = sortedNodes.filter(n => !nodes.includes(n.node))
        console.log("NEW Nodes", nodes, sortedNodes)
    }

    console.log("Connected nodes", newConnectedNodes)
    connectedNodes.value = newConnectedNodes

    nextTick(() => {
        updateBBox()
    })


}

interface LineData {
    points: Point2D[],
    width: number,
    startNode: ROS.Node,
    endNode: ROS.Node,
    type: "PubSub" | "Service"
}

const connectionLines = computed(() => {
    const lines: LineData[] = []

    for (const [nodesIndex, nodes] of connectedNodes.value.entries()) {
        for (const [nodeIndex, node] of nodes.entries()) {

            const pubNodes = node.nodesPublishedTo
            const clientNodes = node.nodesClientsConnectedTo

            pubNodes.forEach(pubNode => {
                const startPoint = {
                    x: nodeIndex * horizontalSpacing.value,
                    y: nodesIndex * verticalSpacing.value,
                }

                const endPoint = {
                    x: nodeMatrix.value.get(pubNode.key)![0] * horizontalSpacing.value,
                    y: nodeMatrix.value.get(pubNode.key)![1] * verticalSpacing.value,
                }

                const cPHeight = -Math.abs(startPoint.x - endPoint.x) / 3

                const controlPoint1 = {
                    x: startPoint.x,
                    y: startPoint.y + cPHeight,
                }

                const controlPoint2 = {
                    x: endPoint.x,
                    y: endPoint.y + cPHeight,
                }

                const controlPoint = {
                    x: (startPoint.x + endPoint.x) / 2,
                    y: startPoint.y + cPHeight,
                }

                lines.push({
                    // points: [startPoint, controlPoint1, controlPoint2, endPoint]
                    points: [startPoint, controlPoint, endPoint],
                    width: 2,
                    startNode: node.node,
                    endNode: pubNode,
                    type: "PubSub"
                })
            });

            clientNodes.forEach(pubNode => {
                const startPoint = {
                    x: nodeIndex * horizontalSpacing.value,
                    y: nodesIndex * verticalSpacing.value,
                }

                const endPoint = {
                    x: nodeMatrix.value.get(pubNode.key)![0] * horizontalSpacing.value,
                    y: nodeMatrix.value.get(pubNode.key)![1] * verticalSpacing.value,
                }

                const cPHeight = Math.abs(startPoint.x - endPoint.x) / 2

                const controlPoint1 = {
                    x: startPoint.x,
                    y: startPoint.y + cPHeight,
                }

                const controlPoint2 = {
                    x: endPoint.x,
                    y: endPoint.y + cPHeight,
                }

                const controlPoint = {
                    x: (startPoint.x + endPoint.x) / 2,
                    y: startPoint.y + cPHeight,
                }

                lines.push({
                    // points: [startPoint, controlPoint1, controlPoint2, endPoint]
                    points: [startPoint, controlPoint, endPoint],
                    width: 0.5,
                    startNode: node.node,
                    endNode: pubNode,
                    type: "Service"
                })
            });
        }

    }
    console.log("Lines", lines)
    return lines
})

function lineClass(line: LineData) {
    const clases = ["line"]

    if (line.type === "PubSub") {
        clases.push("line-pubsub")
    } else {
        clases.push("line-service")
    }

    let small = props.selectedNode !== undefined || props.hoveredNode !== undefined
    if (props.selectedNode === line.startNode.key || props.selectedNode === line.endNode.key) {
        clases.push("line-selected")
        small = false
    }
    if (props.hoveredNode === line.startNode.key || props.hoveredNode === line.endNode.key) {
        clases.push("line-hovered")
        small = false
    }

    if (small) {
        clases.push("line-smaller")
    }

    // const clases = ["line line-pubsub line-smaller"]

    return clases.join(" ")
}

defineExpose({
    bBox
})

</script>

<style scoped lang="scss">
$line-width: 2;

.line {
    stroke: white;
    fill: none;

    stroke-width: var(--adapted-line-width, var(--line-width));
}

.line-pubsub {
    --line-width: 2;
}

.line-service {
    --line-width: 0.5;
}

.line-smaller {
    opacity: 0.3;
    --adapted-line-width: calc(var(--line-width) / 2);
}

.line-selected {
    stroke-opacity: 1;
    // --line-width: 4;
    --adapted-line-width: calc(var(--line-width) * 2);
}

.line-hovered {
    stroke-opacity: 1;
    --adapted-line-width: calc(var(--line-width) * 2);
}
</style>