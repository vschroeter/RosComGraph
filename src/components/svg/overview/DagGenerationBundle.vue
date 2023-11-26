<template>
    <g>
        <g>
            <SvgLine v-for="line in connectionLines" :points="line.points" curve-style="basis" :stroke-width="line.width">
            </SvgLine>
        </g>
        <g v-for="(nodes, connectedIndex) in connectedNodes">
            <g v-for="(node, nodeIndex) in nodes">
                
                <!-- <circle :cx="nodeIndex * horizontalSpacing" :cy="connectedIndex * verticalSpacing" r="10" fill="red" /> -->
                <circle :cx="nodePositions.get(node.node.key).x" :cy="nodePositions.get(node.node.key).y" r="10" fill="red" />
                <text :x="nodePositions.get(node.node.key).x" :y="nodePositions.get(node.node.key).y"
                    fill="white" text-anchor="middle">{{ node.node.name }}</text>
            </g>
        </g>

    </g>
</template>

<script setup lang="ts">
import { onMounted, watch, type Ref, toValue } from "vue"
import * as d3 from "d3"
import { computed, ref, reactive } from "vue"

import SvgLine from "@/components/svg/connection/SvgLine.vue"

// import type { GraphLayoutNode, GraphLayoutLink, GraphLayout, RosGraphData } from "@/ros/rosGraph";
// import { RosGraphNode, RosNodeGraph } from "@/ros/rosGraph";
import * as RGr from '@/ros/rosGraph'
import * as ROS from '@/ros/rosNode'
import type { Point2D } from "@/stores/anchors"


const props = defineProps<{
    graph: RGr.RosGraphData,
}>()

const connectedNodes: Ref<RGr.RosGraphNode[][]> = ref<RGr.RosGraphNode[][]>([])
const generations: Ref<RGr.RosNodeGraphGeneration[][]> = ref<RGr.RosNodeGraphGeneration[][]>([])

const nodeMatrix = computed(() => {
    const matrix: Map<string, [number, number]> = new Map()
    for (const [connectedIndex, nodes] of connectedNodes.value.entries()) {
        for (const [nodeIndex, node] of nodes.entries()) {
            matrix.set(node.node.key, [nodeIndex, connectedIndex])
        }
    }
    return matrix
})

const nodeGenerationMapping = computed(() => {
    const mapping: Map<string, [number, number]> = new Map()
    for (const [componentIndex, component] of generations.value.entries()) {
        for (const [generationIndex, generation] of component.entries()) {
            for (const [nodeIndex, node] of generation.nodes.entries()) {
                mapping.set(node.node.key, [generation.generation, componentIndex])
            }
        }
    }
    return mapping
})

const graphNodes = computed(() => {
    return props.graph.nodes.map(n => new RGr.RosGraphNode(n, props.graph))
})

const nodeGraph = computed(() => {
    return new RGr.RosNodeGraph(graphNodes.value)
})

const verticalSpacing = ref(150)
const horizontalSpacing = ref(100)

onMounted(() => {
    console.log("Mounted DAG")
    // return

    if (graphNodes.value.length === 0) {
        console.log("No nodes")
        return
    }

    const scoredNodes = graphNodes.value.map(n => {
        const score = n.sourceScore
        return { node: n, name: n.node.key, score: score, scorePubSub: n.sourceScorePubSub }
    })

    let sortedNodes = scoredNodes.sort((a, b) => b.scorePubSub - a.scorePubSub)

    console.log("Sorted nodes", sortedNodes)

    console.log("Topological sorting", nodeGraph.value.getTopologicalGenerations(sortedNodes[1].node))

    const newConnectedNodes: RGr.RosGraphNode[][] = []
    const newGenerationNodes: RGr.RosNodeGraphGeneration[][] = []

    let i = 5
    while (sortedNodes.length > 0 && i-- > 0) {
        const startNode = sortedNodes[0].node
        const nodes = nodeGraph.value.getTopologicalSorting(startNode)
        const generation = nodeGraph.value.getTopologicalGenerations(startNode)
        newConnectedNodes.push(nodes)
        newGenerationNodes.push(generation)

        // Remove all nodes from sortedNodes
        sortedNodes = sortedNodes.filter(n => !nodes.includes(n.node))
        console.log("NEW Nodes", nodes, sortedNodes)
    }

    console.log("Connected nodes", newConnectedNodes)
    connectedNodes.value = newConnectedNodes
    generations.value = newGenerationNodes
    console.log("Generations", generations.value, nodeGenerationMapping.value)

    console.log("Node positions", nodePositions.value)

})


const nodePositions = computed(() => {

    const positions: Map<string, Point2D> = new Map()

    let currentX = 0
    let currentY = 0

    for (const [componentIndex, gens] of generations.value.entries()) {
        currentX = 0
        for (const [genIndex, generation] of gens.entries())  {
            // Check if nodes only have connections to adjacent generations
            const adjacentGenerations = new Set<number>()
            for (const node of generation.nodes) {
                for (const pubNode of node.nodesPublishedTo) {
                    adjacentGenerations.add(nodeGenerationMapping.value.get(pubNode.key)![0])
                }
                for (const pubNode of node.nodesClientsConnectedTo) {
                    adjacentGenerations.add(nodeGenerationMapping.value.get(pubNode.key)![0])
                }
            }

            const possibleGenerations = new Set<number>([genIndex - 1, genIndex + 1])
            const allowVerticalPositioning = [...adjacentGenerations].every((x) => possibleGenerations.has(x))

            console.log("Adjacent generations", genIndex, adjacentGenerations, allowVerticalPositioning)

            if (allowVerticalPositioning) {
                const innerVerticalSpacing = 50
                let startY = currentY - ((generation.nodes.length - 1) * innerVerticalSpacing) / 2 
                for (const node of generation.nodes) {
                    positions.set(node.node.key, {
                        x: currentX,
                        y: startY,
                    })
                    startY += innerVerticalSpacing
                }
                currentX += horizontalSpacing.value
            } else {
                for (const node of generation.nodes) {
                    positions.set(node.node.key, {
                        x: currentX,
                        y: currentY,
                    })
                }
                currentX += horizontalSpacing.value
            }
        }

        currentY += verticalSpacing.value
    }

    return positions


})


const connectionLines = computed(() => {
    const lines: { points: Point2D[], width: number }[] = []
    for (const [nodesIndex, nodes] of connectedNodes.value.entries()) {
        for (const [nodeIndex, node] of nodes.entries()) {

            const pubNodes = node.nodesPublishedTo
            const clientNodes = node.nodesClientsConnectedTo

            pubNodes.forEach(pubNode => {
                const startPoint = {
                    x: nodePositions.value.get(node.node.key)?.x ?? 0, // nodeIndex * horizontalSpacing.value,
                    y: nodePositions.value.get(node.node.key)?.y ?? 0,
                }

                const endPoint = {
                    x: nodePositions.value.get(pubNode.key)?.x ?? 0,
                    y: nodePositions.value.get(pubNode.key)?.y ?? 0,
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
                    width: 2
                })
            });

            clientNodes.forEach(pubNode => {
                const startPoint = {
                    x: nodePositions.value.get(node.node.key)?.x ?? 0,
                    y: nodePositions.value.get(node.node.key)?.y ?? 0,
                }

                const endPoint = {
                    x: nodePositions.value.get(pubNode.key)?.x ?? 0,
                    y: nodePositions.value.get(pubNode.key)?.y ?? 0,
                }

                const cPHeight = Math.abs(startPoint.x - endPoint.x) / 3

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
                    width: 0.5
                })
            });
        }

    }
    console.log("Lines", lines)
    return lines
})

</script>

<style scoped></style>