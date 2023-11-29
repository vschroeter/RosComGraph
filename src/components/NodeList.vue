<template>
    <div>
        <q-tree :nodes="componentTree" node-key="key" label-key="label" v-model:ticked="visibleNodes" tick-strategy="leaf"
            @update:ticked="tickChanged" />
    </div>
</template>

<script setup lang="ts">
import { useRosStore } from 'src/stores/ros';
import { computed, ref, watch } from 'vue';

import * as RGr from 'src/ros/rosGraph'
import * as ROS from 'src/ros/rosNode'

const rosStore = useRosStore();

const nodes = computed(() => rosStore.nodes);

const nodeNames = computed(() => new Set(rosStore.nodes.map(n => n.key)));
const hiddenNodes = computed(() => rosStore.hiddenNodes);
// const hiddenNodes = computed(() => Array.from(rosStore.hiddenNodes));

const visibleNodes = ref(new Array<string>())
// const visibleNodes = computed(() => {
//     const visible = new Set<string>()
//     for (const node of nodes.value) {
//         if (!hiddenNodes.value.has(node.key)) {
//             visible.add(node.key)
//         }
//     }
//     return Array.from(visible)
// })

watch([() => nodeNames], () => {
    // console.log("Hidden Nodes", hiddenNodes.value)
    const visible = new Set<string>()
    for (const node of nodes.value) {
        if (!hiddenNodes.value.has(node.key)) {
            visible.add(node.key)
        }
    }
    visibleNodes.value = Array.from(visible)
}, { immediate: true })


function tickChanged(target: any) {
    rosStore.hiddenNodes = new Set<string>(Array.from(nodeNames.value).filter(n => !target.includes(n)))
    // console.log('hiddenNodes', rosStore.hiddenNodes)
}

/** Graph Data from the nodes */
const graphData = computed(() => {
    return new RGr.RosGraphData(nodes.value)
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
const connectionComponents = computed(() => nodeGraph.value.getConnectionComponents(
    rosStore.nodeSorting,
    rosStore.componentsUsePubSubConnections,
    rosStore.componentsUseServiceClientConnections,
    rosStore.componentsUseBroadcastConnections)
)
// const connectionComponents = computed(() => nodeGraph.value.getConnectionComponents(props.graphSorting, true, false, false))

/** The number of nodes in the graph */
const countNodes = computed(() => graphNodes.value.length)
/** The number of connected components */
const countConnectedComponents = computed(() => connectionComponents.value.length)


const componentTree = computed(() => {

    // const tree = {
    //     key: 'root',
    //     label: 'Visible Nodes',
    //     children: [] as any[]
    // }
    const tree = new Array<any>()

    const components = connectionComponents.value
    let i = 1

    for (const component of components) {
        if (component.length === 0) continue

        const componentNode = {
            key: `component-${i}`,
            label: `Component ${i} (${component.length} nodes)`,
            children: [] as any[]
        }

        for (const node of component) {
            const nodeNode = {
                key: node.key,
                label: node.key,
                children: []
            }
            componentNode.children.push(nodeNode)
        }

        // tree.children.push(componentNode)
        tree.push(componentNode)

        i++;
    }

    return tree
})








// function toggleNode(node: string) {
//     rosStore.toggleNodeVisibility(node);
// }
</script>

<style scoped></style>