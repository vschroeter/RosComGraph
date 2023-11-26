import { defineStore } from 'pinia'
import * as ROS from 'src/ros/rosNode'
import { RosGraphData, type GraphLayoutNode, type GraphLayoutLink, type GraphLayout, SortingMethod } from 'src/ros/rosGraph'
import * as d3 from 'd3'
import fuzzysort from 'fuzzysort'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { RosSystemInfo } from 'src/ros/rosSystemInfo'

type visMode = "Show live data" | "Show saved data (8)" | "Show saved data (21)" | "Show presentation data"

let topicTimeout: NodeJS.Timeout | null = null;

export const useRosStore = defineStore('ros', {
    state: () => ({
        systemInfoConnection: null as RosSystemInfo | null,
        // visMode: useStorage("visMode", "Show live data") as visMode,
        visMode: useStorage("visMode", "Show live data" as visMode),
        autoUpdates: useStorage("autoUpdates", true as boolean),
        update: 0 as number,
        nodes: Array<ROS.Node>(),
        nodeSorting: useStorage("nodeSorting", "flow" as SortingMethod) as unknown as SortingMethod,
        selectedNode: null as ROS.Node | null,
        selectedSecondaryNode: null as ROS.Node | null,
        hoveredNode: null as ROS.Node | null,
        selectedTopic: undefined as ROS.Topic | undefined,
        topicFilter: null as string | null | undefined,
        topicAnchors: new Map() as Map<string, Map<string, Map<string, { x: number, y: number }>>>,
        topicAnchorsChanged: 0,
        currentZoom: d3.zoomIdentity as d3.ZoomTransform,

        showPubSubConnections: useStorage("showPubSubConnections", true as boolean),
        showBroadcastConnections: useStorage("showBroadcastConnections", false as boolean),
        showServiceClientConnections: useStorage("showServiceClientConnections", true as boolean),

        componentsUsePubSubConnections: useStorage("componentsUsePubSubConnections", true),
        componentsUseServiceClientConnections: useStorage("componentsUseServiceClientConnections", true),
        componentsUseBroadcastConnections: useStorage("componentsUseBroadcastConnections", false),
        nodesRequested: null as number | null,
        nodesResolved: 0 as number,

        visibleSubgroups: new Set() as Set<string>,

        wsUrl: useStorage("wsUrl", "ws://localhost:9090"),

    }),
    getters: {
        nodeMap: (state) => {
            const map = new Map<string, ROS.Node>()
            state.nodes.forEach(node => {
                map.set(node.key, node)
            })
            return map
        },
        getNode() {
            const m = this.nodeMap
            return (key: string) => m.get(key)
        },
        rosGraph: (state) => {
            const graph = new RosGraphData(state.nodes)
            return graph
        },
    },
    actions: {
        setVisMode(mode: visMode) {
            this.visMode = mode
        },
        setTopicAnchor(nodeName: string, topicGroup: string, topicName: string, x: number, y: number) {
            if (!this.topicAnchors.has(nodeName)) {
                this.topicAnchors.set(nodeName, new Map())
            }
            const nodeMap = this.topicAnchors.get(nodeName)!
            if (!nodeMap.has(topicGroup)) {
                nodeMap.set(topicGroup, new Map())
            }
            const topicGroupMap = nodeMap.get(topicGroup)!
            topicGroupMap.set(topicName, { x, y })
            this.topicAnchorsChanged++;
        },
        getTopicAnchor(nodeName: string | undefined, topicGroup: string | undefined, topicName: string | undefined) {
            if (!nodeName || !topicGroup || !topicName) {
                return undefined
            }
            const anchor = this.topicAnchors.get(nodeName)?.get(topicGroup)?.get(topicName)
            if (!anchor) {
                return this.setTopicAnchor(nodeName, topicGroup, topicName, 0, 0)
            }
            return anchor
        },

        isSelectedTopic(topicName: string | undefined, valueIfNoSelection: any = false) {
            // return computed(() => {
            if ((!this.selectedTopic) && (!this.topicFilter || this.topicFilter.length == 0)) {
                return valueIfNoSelection
            }

            if (!topicName) return false

            if (this.selectedTopic) {
                return this.selectedTopic.name === topicName
            }

            if (this.topicFilter && this.topicFilter.length > 0) {
                const result = fuzzysort.single(this.topicFilter, topicName)
                if (result && result?.score > -10000) {
                    return true
                }

                return false
            }

            return false
            // })
        },

        setSelectedTopic(topic: ROS.Topic | undefined, throttleMs = 0) {
            if (topicTimeout) {
                clearTimeout(topicTimeout)
            }

            if (throttleMs == 0) {
                this.selectedTopic = topic
                return
            }
            topicTimeout = setTimeout(() => {
                this.selectedTopic = topic
            }, throttleMs)
        },

        toggleSubgroupVisibility(subgroupPrefix: string) {
            if (this.visibleSubgroups.has(subgroupPrefix)) {
                this.visibleSubgroups.delete(subgroupPrefix)
            } else {
                this.visibleSubgroups.add(subgroupPrefix)
            }        
        }


    },
})

