
import { defineStore } from 'pinia'
import * as ROS from 'src/ros/rosNode'
import * as RGr from 'src/ros/rosGraph'
import { RosGraphData, type GraphLayoutNode, type GraphLayoutLink, type GraphLayout } from 'src/ros/rosGraph'
import * as d3 from 'd3'
import { ref, type ComputedRef, type Ref, computed } from 'vue'
import { applyToPoint, compose, fromDefinition, fromTransformAttribute, identity, type Matrix } from 'transformation-matrix'
import { ObjectAnchor } from 'src/components/svg/composables/anchor'


function mapKey(...parts: (string|undefined)[]) {
    return parts.filter(p => p && p.length > 0).join("/")
}

export const useNodeAnchorStore = defineStore('nodeAnchors', {
    state: () => ({
        anchors: new Map<string, ObjectAnchor>(),
        // transformNodes: new Map<string, TransformNode>(),
    }),
    getters: {
        getNodeAnchor(state) {
            return (nodeName: string | ROS.Node | RGr.RosGraphNode, prefix = "") => {
                let key = ""
                if (typeof nodeName === 'string') {
                    key = nodeName
                } else if (nodeName instanceof ROS.Node) {
                    key = nodeName.key
                } else if (nodeName instanceof RGr.RosGraphNode) {
                    key = nodeName.node.key
                }

                key = mapKey(prefix, key)

                if (!state.anchors.has(key)) {
                    // console.warn("getNodeAnchor: no anchor for node", key)
                    // return undefined
                    state.anchors.set(key, new ObjectAnchor())
                }
                return state.anchors.get(key)!
            }
        },
        getTopicAnchor(state) {
            return (nodeKey: string, topicName: string, prefix = "", side: "left" | "right" | undefined = undefined) => {
                const key = mapKey(prefix, nodeKey, topicName, side)

                if (!state.anchors.has(key)) {
                    state.anchors.set(key, new ObjectAnchor())
                }
                return state.anchors.get(key)!
            }
        }
    },
    actions: {
        updateTopicAnchor(nodeKey: string, topicName: string, anchor: ObjectAnchor, prefix = "", side: "left" | "right" | undefined = undefined) {
            this.anchors.set(mapKey(prefix, nodeKey, topicName, side), anchor)
            // console.log("updateTopicAnchor", this.anchors)
        },
        updateNodeAnchor(nodeName: string, anchor: ObjectAnchor, prefix = "") {
            this.anchors.set(mapKey(prefix, nodeName), anchor)
            // console.log("updateNodeAnchor", this.anchors)
        },
        removeNodeAnchor(nodeName: string, prefix = "") {
            this.anchors.delete(mapKey(prefix, nodeName))
        },
        removeTopicAnchor(nodeKey: string, topicName: string, prefix = "", side: "left" | "right" | undefined = undefined) {
            this.anchors.delete(mapKey(prefix, nodeKey, topicName, side))
        }


    }
})
