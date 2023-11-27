<template>
  <q-page class="column items-center justify-start">

    <div class="q-my-sm" v-if="selectedView == 'FLOW'" style="min-width: 10px; min-height: 10px;">
      <!-- <q-btn-toggle rounded v-model="selectedView" toggle-color="primary" :options="[
        { label: 'Circular', value: 'CV' },
        { label: 'Flow', value: 'FLOW', disabled: rosStore.selectedNode == null },
        // {label: 'DAG', value: 'DAG'}
      ]" /> -->
      <q-btn rounded outline @click="selectedView = 'CV'" label="Back to Circular View" color="accent" />
      <!-- <q-btn-toggle class="q-mx-lg" rounded v-model="selectedSorting" toggle-color="secondary" :options="[
        { label: 'Topological Sorting', value: 'topological' },
        { label: 'Flow Sorting', value: 'flow' },
      ]" /> -->
    </div>
    <div ref="refDivSvgParent" style="width: 100%; height: 100%; flex: 1">

      <!-- <div ref="refDivSvgParent" style="background-color: orange; min-width: 10px; min-height: 10px; width: 100%; height: 100%;"></div> -->
      <!-- <svg :width="svgWidth - 2" :height="svgHeight - 10"></svg> -->
      <svg v-if="true" ref="refMainSvg" :width="svgWidth - 2" :height="svgHeight - 10" :viewBox="viewBox">
        <g :ref="interactiveRef.ref">
          <CircularView v-if="true && selectedView == 'CV'" ref="refCV" :nodes="rosStore.nodes"
            :graph-sorting="rosStore.nodeSorting" :start-angle-offset="angleOffset"
            :selectedNode="rosStore.selectedNode?.key"
            :hovered-node="rosStore.hoveredNode?.key" @dblclicked-node="(n) => goToDetailedView(n)"
            :outer-radius="50 + rosStore.nodes.length * 15"
            @selectedNode="(n) => selectNode(n)"
            @hoveredNode="(n) => rosStore.hoveredNode = (n ? rosStore.getNode(n)! : null)"
            :show-broadcast-connections="rosStore.showBroadcastConnections"
            :show-pub-sub-connections="rosStore.showPubSubConnections"
            :show-service-client-connections="rosStore.showServiceClientConnections"
            :use-service-connections="rosStore.componentsUseServiceClientConnections"
            :use-pub-sub-connections="rosStore.componentsUsePubSubConnections"
            :use-broadcast-connections="rosStore.componentsUseBroadcastConnections"
            :hidden-nodes="rosStore.hiddenNodes" />
          <DAG v-if="true && selectedView == 'DAG'" ref="refDAG" :nodes="rosStore.nodes"
            :graph-sorting="rosStore.nodeSorting"
            :start-angle-offset="angleOffset" :selectedNode="rosStore.selectedNode?.key"
            :hovered-node="rosStore.hoveredNode?.key" @dblclicked-node="(n) => goToDetailedView(n)"
            @selectedNode="(n) => rosStore.selectedNode = (rosStore.selectedNode?.key != n ? rosStore.getNode(n) : null)!"
            @hoveredNode="(n) => rosStore.hoveredNode = (n ? rosStore.getNode(n)! : null)"
            :show-broadcast-connections="rosStore.showBroadcastConnections"
            :show-pub-sub-connections="rosStore.showPubSubConnections"
            :show-service-client-connections="rosStore.showServiceClientConnections"
            :use-service-connections="rosStore.componentsUseServiceClientConnections"
            :use-pub-sub-connections="rosStore.componentsUsePubSubConnections"
            :use-broadcast-connections="rosStore.componentsUseBroadcastConnections" />
          <FlowView v-if="true && selectedView == 'FLOW'" ref="refFlow" :nodes="rosStore.nodes"
            :graph-sorting="rosStore.nodeSorting" :start-angle-offset="angleOffset"
            :selectedNode="rosStore.selectedNode?.key"
            :hovered-node="rosStore.hoveredNode?.key"
            :secondary-node="rosStore.selectedSecondaryNode?.key"
            :selected-topic="rosStore.selectedTopic"
            @selectedNode="(n) => selectNode(n)"
            @selected-secondary-node="(n) => rosStore.selectedSecondaryNode = (rosStore.selectedSecondaryNode?.key != n ? rosStore.getNode(n) : null)!"
            :show-broadcast-connections="rosStore.showBroadcastConnections"
            :show-pub-sub-connections="rosStore.showPubSubConnections"
            :show-service-client-connections="rosStore.showServiceClientConnections"
            @hoveredNode="(n) => rosStore.hoveredNode = (n ? rosStore.getNode(n)! : null)" />
        </g>
      </svg>
    </div>
    <!-- <div style="background-color: green; min-width: 10px; min-height: 10px;"></div> -->

    <!-- <div class="col-auto q-mt-sm">
      <q-btn-toggle rounded v-model="selectedView" toggle-color="primary" :options="[
        { label: 'Circular', value: 'CV' },
        { label: 'Flow', value: 'FLOW' },
        // {label: 'DAG', value: 'DAG'}
      ]" />
      <q-btn-toggle class="q-mx-lg" rounded v-model="selectedSorting" toggle-color="secondary" :options="[
        { label: 'Topological Sorting', value: 'topological' },
        { label: 'Flow Sorting', value: 'flow' },
      ]" />
    </div>
    <div class="col-grow" style="flex: 1; width: 100%; height: 100%;">
      <svg v-if="true" ref="refMainSvg" width="100%" height="100%" :viewBox="viewBox">
        <g :ref="interactiveRef.ref">
          <CircularView v-if="true && selectedView == 'CV'" ref="refCV" :nodes="rosStore.nodes"
            :graph-sorting="selectedSorting" :start-angle-offset="angleOffset" :selectedNode="rosStore.selectedNode?.key"
            :hovered-node="rosStore.hoveredNode?.key" @dblclicked-node="(n) => goToDetailedView(n)"
            @selectedNode="(n) => rosStore.selectedNode = (rosStore.selectedNode?.key != n ? rosStore.getNode(n) : null)!"
            @hoveredNode="(n) => rosStore.hoveredNode = (n ? rosStore.getNode(n)! : null)"
            :show-broadcast-connections="rosStore.showBroadcastConnections"
            :show-pub-sub-connections="rosStore.showPubSubConnections"
            :show-service-client-connections="rosStore.showServiceClientConnections"
            :use-service-connections="rosStore.componentsUseServiceClientConnections"
            :use-pub-sub-connections="rosStore.componentsUsePubSubConnections"
            :use-broadcast-connections="rosStore.componentsUseBroadcastConnections" />
          <FlowView v-if="true && selectedView == 'FLOW'" ref="refFlow" :nodes="rosStore.nodes"
            :graph-sorting="selectedSorting" :start-angle-offset="angleOffset" :selectedNode="rosStore.selectedNode?.key"
            :hovered-node="rosStore.hoveredNode?.key" :selected-topic="rosStore.selectedTopic"
            @selectedNode="(n) => rosStore.selectedNode = (rosStore.selectedNode?.key != n ? rosStore.getNode(n) : null)!"
            :show-broadcast-connections="rosStore.showBroadcastConnections"
            :show-pub-sub-connections="rosStore.showPubSubConnections"
            :show-service-client-connections="rosStore.showServiceClientConnections"
            @hoveredNode="(n) => rosStore.hoveredNode = (n ? rosStore.getNode(n)! : null)" />
        </g>
      </svg>
    </div>
    <div v-if="false" class="col-auto">
      <q-slider v-model="angleOffset" :min="-360" :max="360" style="width: 200px;" />
    </div> -->

    <div style="position: absolute; bottom: 0; left: 0; padding: 10px;">
      <div v-if="rosStore.showPubSubConnections" style="display: flex; align-items: center; margin-bottom: 5px;">
        <div style="width: 20px; height: 20px; background-color: var(--q-stroke-pubsub); margin-right: 10px;"></div>
        <span>Pub / Sub connection</span>
      </div>
      <div v-if="rosStore.showServiceClientConnections" style="display: flex; align-items: center; margin-bottom: 5px;">
        <div style="width: 20px; height: 20px; background-color: var(--q-stroke-service); margin-right: 10px;"></div>
        <span>Service connection</span>
      </div>
      <div v-if="rosStore.showBroadcastConnections" style="display: flex; align-items: center; margin-bottom: 5px;">
        <div style="width: 20px; height: 20px; background-color: var(--q-stroke-broadcast); margin-right: 10px;"></div>
        <span>Broadcast connection</span>
      </div>
    </div>


  </q-page>
</template>

<script setup lang="ts">
import DAG from 'src/components/svg/overview/DAG.vue';
import CircularView from 'src/components/svg/overview/CircularView.vue';
import FlowView from 'src/components/svg/overview/FlowView.vue';
import { Ref, computed, nextTick, ref, watch } from 'vue';
import { useRosStore } from 'stores/ros'
import { useViewBoxGetter, svgInteractiveRef } from 'src/components/svg/scripts/directives';
import { useResizeObserver, useStorage } from '@vueuse/core'

const rosStore = useRosStore()

const refDivSvgParent = ref<HTMLDivElement | null>(null)

const refMainSvg = ref<SVGSVGElement | null>(null)
const interactiveRef = svgInteractiveRef(refMainSvg, undefined, () => {
  if (selectedView.value === 'CV') {
    rosStore.selectedNode = null
  } else if (selectedView.value === 'FLOW') {
  }
}); //, (zoom) => rosStore.currentZoom = zoom

// const selectedView = useStorage<'DAG' | 'CV' | 'FLOW'>("selectedView", 'CV')
const selectedView = ref<'DAG' | 'CV' | 'FLOW'>('CV')
// const selectedSorting = useStorage<'topological' | 'flow'>('selectedSorting', 'topological')
// const selectedSorting = ref<'topological' | 'flow'>('topological')

const refDAG = ref<InstanceType<typeof DAG> | null>(null)
const refCV = ref<InstanceType<typeof CircularView> | null>(null)
const refFlow = ref<InstanceType<typeof FlowView> | null>(null)

watch([() => selectedView.value], () => {
  // nextTick(() => {
  interactiveRef.resetZoom(0);
  // })
}, { immediate: true })

const bBox = computed(() => {
  if (selectedView.value === 'DAG') {
    return refDAG.value?.bBox
  } else if (selectedView.value === 'CV') {
    return refCV.value?.bBox
  } else if (selectedView.value === 'FLOW') {
    return refFlow.value?.bBox
  }
  return null
})
const viewBox = useViewBoxGetter(() => bBox.value, 30, 0.5, 20, true)


const angleOffset = ref(-180)


function goToDetailedView(nodeKey: string) {
  rosStore.selectedNode = rosStore.getNode(nodeKey)!
  rosStore.hoveredNode = null
  selectedView.value = 'FLOW'
}


const svgWidth = ref(0)
const svgHeight = ref(0)
useResizeObserver(refDivSvgParent, () => {
  // console.log('resize', refDivSvgParent.value?.clientWidth, refDivSvgParent.value?.clientHeight)
  svgWidth.value = refDivSvgParent.value?.offsetWidth ?? 10
  svgHeight.value = refDivSvgParent.value?.offsetHeight ?? 10
})


function selectNode(nodeKey: string) {
  rosStore.selectedNode = (rosStore.selectedNode?.key != nodeKey ? rosStore.getNode(nodeKey) : null)!
  rosStore.hoveredNode = null
  rosStore.selectedSecondaryNode = null
  rosStore.visibleSubgroups.clear()
}

</script>
