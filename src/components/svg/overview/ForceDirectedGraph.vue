<template>
    <g ref="refGRoot" v-if="data.layout">
        <g v-if="data.layout.links">
            <line v-for="(link, i) in data.layout.links" :key="i.toString() + ':' + link.source.id + '->' + link.target.id"
                :name="link.source.id + '->' + link.target.id" :x1="link.source.x" :y1="link.source.y" :x2="link.target.x"
                :y2="link.target.y" stroke="var(--q-stroke)" stroke-width="1"></line>
        </g>
        <g v-if="data.layout.nodes">
            <g v-for="node in data.layout.nodes" :key="node.id" @click="selectNode(node)" @mouseenter="hoverNode(node)"
                @mouseleave="hoverNode(null)">
                <!-- stroke="white" stroke-width="1" fill="red"-->
                <circle :cx="node.x" :cy="node.y" :r="nodeRadius" :name="node.id" :class="circleClass(node)">
                </circle>
                <text :x="node.x" :y="node.y - nodeRadius - 2" fill="var(--q-stroke)" :name="node.id" text-anchor="middle"
                    :font-size="fontSize">{{ node.id }}</text>
            </g>
        </g>
    </g>
</template>

<script setup lang="ts">
import * as d3 from "d3"
// import * as d3f from "d3-force"
import { watch } from "vue"
import { computed, ref, reactive } from "vue"

import { GraphLayoutNode, GraphLayoutLink, GraphLayout, RosGraphData } from "src/ros/rosGraph";
import * as ROS from 'src/ros/rosNode'
import { BBox } from "../scripts/directives";

const refGRoot = ref<SVGGElement | null>(null)

const emit = defineEmits<{
    (e: 'selectedNode', node: string): void,
    (e: 'hoveredNode', node: string | null): void,
    (e: 'updated'): void
}>()

const props = withDefaults(defineProps<{
    nodes: ROS.Node[],
    selectedNode?: string,
    hoveredNode?: string,
    nodeRadius?: number,
    fontSize?: string,
}>(), {
    nodeRadius: 12,
    fontSize: "100%",
})

class Data {
    graph?: RosGraphData = undefined
    layout?: GraphLayout = undefined
}

const data = reactive(new Data())

const bBox = ref<BBox | null>(null)

function selectNode(node: GraphLayoutNode) {
    const rosNode = data.graph?.nodeMap.get(node.id)
    // console.log("selectNode", node.id, rosNode?.key)
    if (rosNode) emit('selectedNode', rosNode.key)
}

function hoverNode(node: GraphLayoutNode | null) {
    if (node === null) {
        emit('hoveredNode', null)
        return
    }

    const rosNode = data.graph?.nodeMap.get(node.id)
    if (rosNode) emit('hoveredNode', rosNode.key)
}

const nodeMap = new Map<string, GraphLayoutNode>()

var simulation = d3.forceSimulation(data.layout?.nodes);
simulation.stop();

function ticked() {
    console.log("ticked")
    bBox.value = refGRoot.value?.getBBox() ?? null
    // console.log("BBox", bBox.value, refGRoot.value)
    emit('updated')
}

function circleClass(node: GraphLayoutNode) {
    const classes = ["node"]
    if (node.id == props.selectedNode) {
        classes.push("node-selected")
    } else if (node.id == props.hoveredNode) {
        classes.push("node-hovered")
    } else if (nodeMap.has(props.hoveredNode ?? "")) {
        const pred = data.graph?.getPredecessors(node.id)
        const succ = data.graph?.getSuccessors(node.id)
        const nodeNames = new Set<string>(pred?.concat(succ ?? []).map(n => n.key) ?? [])

        if (nodeNames.has(props.hoveredNode ?? "")) {
            classes.push("node-hovered-adjacent")
        }
    }
    return classes.join(" ")
}

watch([() => props.nodes], () => {
    if (!props.nodes || props.nodes.length == 0) {
        // console.log("No nodes")
        return
    }
    data.graph = new RosGraphData(props.nodes)
    data.layout = data.graph.getGraphLayout()

    console.log("New nodes and links", props.nodes, data.layout.nodes, data.layout.links)

    if (data.layout.links === undefined) {
        console.log("Links undefined")
        return
    }

    if (data.layout.nodes === undefined) {
        console.log("Nodes undefined")
        return
    }

    nodeMap.clear()
    for (const node of data.layout.nodes) {
        nodeMap.set(node.id, node)
    }

    simulation = d3.forceSimulation(data.layout.nodes)
        .force("charge", d3.forceManyBody().strength(100)) // .strength(-50)
        .force("chargeGrav", d3.forceManyBody().strength(250).distanceMin(300))
        .force("chargeElec", d3.forceManyBody().strength(-5).distanceMax(100))
        .force("collide", d3.forceCollide().radius(50).strength(0.2))
        // .force("collide1", d3.forceCollide().radius(200).strength(0.01))
        .force("link", d3.forceLink(data.layout.links))
        // .force("link", d3.forceLink(data.layout.links).distance(150))
        .force("center", d3.forceCenter())
        // .force("link", d3.forceLink(data.layout.links)) //.distance(150)
        // .force("collide", d3.forceCollide().radius(40))
        // .force("charge", d3.forceManyBody().strength(100)) // .strength(-50)
        // .force("center", d3.forceCenter())
        .on("tick", ticked);
}, { immediate: true })

defineExpose({
    bBox
})


</script>

<style scoped lang="scss">
@import "src/css/quasar.variables.scss";
@import "src/css/app.scss";
</style>