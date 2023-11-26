<template>
    <g>
        <g ref="refNodeParent" @click="updateConnections">
            <SvgRosNode bg-fill="lightblue" v-if="nodeName != ''" :node-name="nodeName" :width="nodeWidth" anchor="center"
                node-type="central">
            </SvgRosNode>
        </g>

        <g ref="refSuccessorParent">
            <g v-for="node in successorNodes" :key="node.name" :ref="el => storeSuccNodeRef(el, node)">
                <SvgRosNode bg-fill="GreenYellow" :nodeName="node.name" :width="nodeWidth" anchor="lefttop"
                    node-type="successor" :inner-transform="getNodeTransform(node, 'successor').value"
                    :ref="el => storeNodeElement(el, node, 'successor')">
                </SvgRosNode>
            </g>
        </g>
        <g ref="refPredecessorParent">
            <g v-for="node in predecessorNodes" :key="node.name" :ref="el => storePredNodeRef(el, node)">
                <SvgRosNode bg-fill="coral" :nodeName="node.name" :width="nodeWidth" anchor="righttop"
                    node-type="predecessor" :inner-transform="getNodeTransform(node, 'predecessor').value"
                    :ref="el => storeNodeElement(el, node, 'predecessor')">
                </SvgRosNode>
            </g>
        </g>
        <g>
            <circle ref="refConnectionCenter" cx="0" cy="0" r="0" opacity="1" />
            <g v-if="true" ref="refConnectionParent">
                <g v-for="con in connections"
                    :key="forceKey.toString() + con.startNodeName + con.startNodeTopicName + con.endNodeName + con.endNodeTopicName">
                    <SvgRosTopicConnection :start-node-name="con.startNodeName" :start-node-type="con.startNodeType"
                        :start-node-topic-group="con.startNodeTopicGroup" :start-node-topic-name="con.startNodeTopicName"
                        :end-node-name="con.endNodeName" :end-node-topic-group="con.endNodeTopicGroup"
                        :end-node-type="con.endNodeType" :end-node-topic-name="con.endNodeTopicName" />

                </g>
            </g>
        </g>
        <circle cx="0" cy="0" r="5" fill="blue" opacity="0" />
    </g>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUpdated, computed, type Ref, onBeforeUpdate, watch, nextTick, shallowRef, type WatchStopHandle } from 'vue'
import * as ROS from '@/ros/rosNode'
import { useRosStore } from '@/stores/ros'

import SvgRosNode from '@/components/svg/node/SvgRosNode.vue'
import SvgRosTopicConnection from '@/components/svg/nodes/SvgRosTopicConnection.vue'

const store = useRosStore()

const refNodeParent = ref<SVGGElement | null>(null)
const refSuccessorParent = ref<SVGGElement | null>(null)
const refPredecessorParent = ref<SVGGElement | null>(null)
const refConnectionParent = ref<SVGGElement | null>(null)
const refConnectionCenter = ref<SVGCircleElement | null>(null)

const refsSuccessorNodesParents = ref<Map<string, SVGGElement | null>>(new Map());
const refsPredecessorNodesParents = ref<Map<string, SVGGElement | null>>(new Map());
const refsSuccessorNodes = ref<Map<string, InstanceType<typeof SvgRosNode>>>(new Map());
const refsPredecessorNodes = ref<Map<string, InstanceType<typeof SvgRosNode>>>(new Map());
function storeSuccNodeRef(el: SVGGElement | null, node: ROS.Node) {
    if (el == null) refsSuccessorNodesParents.value.delete(node.name)
    else refsSuccessorNodesParents.value.set(node.name, el)
}
function storePredNodeRef(el: SVGGElement | null, node: ROS.Node) {
    if (el == null) refsPredecessorNodesParents.value.delete(node.name)
    else refsPredecessorNodesParents.value.set(node.name, el)
}
function storeNodeElement(el: InstanceType<typeof SvgRosNode>, node: ROS.Node, nodeType: ROS.nodeType) {
    // console.log("storeNodeElement", node.name)
    const refs = nodeType == "predecessor" ? refsPredecessorNodes.value : refsSuccessorNodes.value
    if (el == null) refs.delete(node.name)
    else refs.set(node.name, el)
}


const props = withDefaults(defineProps<{
    nodeName: string,
    horizontalSpacing: number,
    verticalSpacing: number,
}>(), {
    nodeName: "",
    horizontalSpacing: 200,
    verticalSpacing: 50,
})

const nodeWidth = ref(600)

const rosGraph = computed(() => {
    return store.rosGraph
})

const successorNodes = computed(() => {
    return rosGraph.value.getSuccessors(props.nodeName)
})
const successorNodeSet = computed(() => {
    return new Set(successorNodes.value.map(el => el.name))
})

const predecessorNodes = computed(() => {
    return rosGraph.value.getPredecessors(props.nodeName)
})
const predecessorNodeSet = computed(() => {
    return new Set(predecessorNodes.value.map(el => el.name))
})

type NodeConnection = {
    startNodeName: string,
    startNodeType: ROS.nodeType,
    startNodeTopicGroup: string,
    startNodeTopicName: string,
    endNodeName: string,
    endNodeType: ROS.nodeType,
    endNodeTopicGroup: string,
    endNodeTopicName: string,
}
const connections = ref<Array<NodeConnection>>([])
const forceKey = ref(0)
onBeforeUpdate(() => {
    nodeWatcher.value?.()

    refsSuccessorNodesParents.value = new Map()
    refsPredecessorNodesParents.value = new Map()
    refsPredecessorNodes.value = new Map()
    refsSuccessorNodes.value = new Map()

    updateConnections();
})



onMounted(() => {
    updateNodeWatcher(true);
})

const nodeWatcher = shallowRef<WatchStopHandle | null>(null);
// const heights = ref<number[]>([]);
const totalLeftHeight = shallowRef(0);
const totalRightHeight = shallowRef(0);

onUpdated(() => {
    console.log(`>>>> TREE updated: ${props.nodeName}`);
    updateNodeWatcher(true);
})

function updateNodeWatcher(immediate = false) {
    nodeWatcher.value?.();

    const nodeRefs = Array.from(refsPredecessorNodes.value.values()).concat(Array.from(refsSuccessorNodes.value.values()))

    nodeWatcher.value = watch(() => nodeRefs.map(el => el?.height), () => {
        const leftHeights = Array.from(refsPredecessorNodes.value.values()).map(el => el?.height ?? 0);
        const rightHeights = Array.from(refsSuccessorNodes.value.values()).map(el => el?.height ?? 0);
        // heights.value = Array.from(refsNodes.value.values()).map(el => el?.height ?? 0);

        const newTotalLeftHeight = leftHeights.reduce((a, b) => a + b, 0) + props.verticalSpacing * (leftHeights.length - 1)
        const newTotalRightHeight = rightHeights.reduce((a, b) => a + b, 0) + props.verticalSpacing * (rightHeights.length - 1)

        if (newTotalLeftHeight != totalLeftHeight.value || newTotalRightHeight != totalRightHeight.value) {
            totalLeftHeight.value = newTotalLeftHeight;
            totalRightHeight.value = newTotalRightHeight;
            console.log(">>>> Some Nodes updates", totalLeftHeight.value, totalRightHeight.value);
            updateNodePositions();
        }
    }, { immediate: immediate })
}



const nodeTransforms = reactive<Map<string, Map<string, Ref<string>>>>(new Map())
function getNodeTransform(node: ROS.Node | string, nodeType: ROS.nodeType) {
    if (typeof node !== 'string') node = node.name

    if (!nodeTransforms.has(nodeType)) nodeTransforms.set(nodeType, new Map())
    const typeTransforms = nodeTransforms.get(nodeType)!

    if (!typeTransforms.has(node)) {
        typeTransforms.set(node, ref(""))
    }
    return typeTransforms.get(node)!
}
function setNodeTransform(node: ROS.Node | string, nodeType: ROS.nodeType, transform: string) {
    if (typeof node !== 'string') node = node.name
    const r = getNodeTransform(node, nodeType)
    if (r && r.value != transform) r.value = transform
}

function updateNodePositions() {
    const preRefs = refsPredecessorNodes.value
    const sucRefs = refsSuccessorNodes.value;

    [
        { refs: sucRefs, nodes: successorNodes, xPos: props.horizontalSpacing + nodeWidth.value / 2, nodeType: "successor" },
        { refs: preRefs, nodes: predecessorNodes, xPos: -props.horizontalSpacing - nodeWidth.value / 2, nodeType: "predecessor" },
    ].forEach(element => {
        const xPos = element.xPos
        const nodes = element.nodes.value
        const refs = element.refs
        const nodeType = element.nodeType as ROS.nodeType
        const nodeInstances = nodes.map(n => refs.get(n.name)).filter(n => n != null) as Array<InstanceType<typeof SvgRosNode>>
        console.log(nodes, refs, nodeInstances)

        // Get the total height
        const totalHeight = nodeInstances.reduce((a, b) => a + b.height, 0) + props.verticalSpacing * (nodeInstances.length - 1)

        // Vertical start position
        const yPos = -totalHeight / 2
        let currentY = yPos

        // Place the elements
        nodes.forEach((node, i) => {
            const el = refs.get(node.name)
            if (!node || !el) return

            setNodeTransform(node.name, nodeType, `translate(${xPos}, ${currentY})`)
            currentY += el.height + props.verticalSpacing
        })

    })

    // console.log("##### Node transforms", nodeTransforms)
}


function updateConnections() {
    connections.value = []

    const conns = Array<NodeConnection>()
    const successorLinks: Array<[string, string]> = [];

    [
        { graph: rosGraph.value.publisherGraph, startGroup: "Publishers", endGroup: "Subscribers" },
        { graph: rosGraph.value.clientGraph, startGroup: "Clients", endGroup: "Services" }
    ].forEach(element => {
        const graph = element.graph
        const startGroup = element.startGroup
        const endGroup = element.endGroup

        graph.forEachLinkedNode(props.nodeName, (node, link) => {
            if (!successorNodeSet.value.has(node.id as string)) return

            conns.push({
                startNodeName: props.nodeName,
                startNodeType: "central",
                startNodeTopicGroup: startGroup,
                startNodeTopicName: link.data.topic,
                endNodeName: node.id as string,
                endNodeType: "successor",
                endNodeTopicGroup: endGroup,
                endNodeTopicName: link.data.topic,
            })
        }, true)
    });

    [
        { graph: rosGraph.value.subscriberGraph, startGroup: "Publishers", endGroup: "Subscribers" },
        { graph: rosGraph.value.serverGraph, startGroup: "Clients", endGroup: "Services" }
    ].forEach(element => {
        const graph = element.graph
        const startGroup = element.startGroup
        const endGroup = element.endGroup

        graph.forEachLinkedNode(props.nodeName, (node, link) => {
            if (!predecessorNodeSet.value.has(node.id as string)) return

            conns.push({
                startNodeName: node.id as string,
                startNodeType: "predecessor",
                startNodeTopicGroup: startGroup,
                startNodeTopicName: link.data.topic,
                endNodeName: props.nodeName,
                endNodeType: "central",
                endNodeTopicGroup: endGroup,
                endNodeTopicName: link.data.topic,
            })
        }, true)
    })
    // console.log("Connections", conns)
    connections.value = conns
}

watch(() => props.nodeName, () => {
    console.log("SvgRosNodeTree updated")
    const g = store.rosGraph;
    console.log("RosGraphData")
    console.log("Successors", g.getSuccessors(props.nodeName))
    console.log("Predecessors", g.getPredecessors(props.nodeName))
}, { immediate: true })

// watch(() => store.currentZoom.k, () => {
//     if (store.currentZoom.k == zoom.value) {
//         return
//     }
//     zoom.value = store.currentZoom.k
//     // nextTick(() => {

//     //     const bBox = refNodeParent.value?.getBoundingClientRect()
//     //     const orientationBB = refConnectionCenter.value?.getBoundingClientRect()
//     //     if (bBox != null && orientationBB != null && refConnectionParent.value != null) {
//     //         const x = -orientationBB?.x / zoom.value
//     //         const y = -orientationBB?.y / zoom.value
//     //         refConnectionParent.value?.setAttribute("transform", `translate(${x}, ${y})`)
//     //     }
//     // })
// })

</script>

<style scoped></style>