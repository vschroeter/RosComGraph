// DEPRECATED

import { defineStore } from 'pinia'
import * as ROS from 'src/ros/rosNode'
import { RosGraphData, type GraphLayoutNode, type GraphLayoutLink, type GraphLayout } from 'src/ros/rosGraph'
import * as d3 from 'd3'
import { ref, type ComputedRef, type Ref, computed } from 'vue'
import { applyToPoint, compose, fromDefinition, fromTransformAttribute, identity, type Matrix } from 'transformation-matrix'


export interface Point2D {
    x: number
    y: number
}

export class TopicAnchor {
    parentNode: TransformNode | null = null

    nodeName: string = ''
    nodeType: ROS.nodeType = 'none'
    topicGroup: string = ''
    topicName: string = ''

    localInPoint: Point2D = { x: 0, y: 0 }
    localOutPoint: Point2D = { x: 0, y: 0 }

    inPoint: ComputedRef<Point2D>
    outPoint: ComputedRef<Point2D>

    // get inPoint(): Point2D {
    //     console.log(this.parentNode?.cumulatedTransform.value, this.parentNode)
    //     return applyToPoint(this.parentNode ? this.parentNode.cumulatedTransform.value : identity(), this.localInPoint)
    // }
    // get outPoint(): Point2D {
    //     return applyToPoint(this.parentNode ? this.parentNode.cumulatedTransform.value : identity(), this.localOutPoint)
    // }

    constructor({
        nodeName = '',
        nodeType = 'none',
        topicGroup = '',
        topicName = '',
        localInPoint = { x: 0, y: 0 },
        localOutPoint = { x: 0, y: 0 },
        parentNode = null
    }: {
        nodeName?: string,
        nodeType?: ROS.nodeType,
        topicGroup?: string,
        topicName?: string,
        localInPoint?: Point2D,
        localOutPoint?: Point2D,
        parentNode?: TransformNode | null
    }) {
        this.nodeName = nodeName
        this.nodeType = nodeType
        this.topicGroup = topicGroup
        this.topicName = topicName
        this.localInPoint = localInPoint
        this.localOutPoint = localOutPoint
        this.parentNode = parentNode
        this.inPoint = computed(() => { return applyToPoint(this.parentNode ? this.parentNode.cumulatedTransform.value : identity(), this.localInPoint) })
        this.outPoint = computed(() => { return applyToPoint(this.parentNode ? this.parentNode.cumulatedTransform.value : identity(), this.localOutPoint) })
    }

}

export class TransformNode {
    transform: Ref<string | Matrix | null | undefined>
    transformMatrix: ComputedRef<Matrix>
    parent: TransformNode | undefined
    cumulatedTransform: ComputedRef<Matrix>
    // children: TransformNode[] = []

    constructor(transform: Ref<string | Matrix | null | undefined>, parent: TransformNode | undefined = undefined) {
        this.transform = transform
        this.transformMatrix = computed(() => {
            if (this.transform.value === undefined || this.transform.value === null) return identity()

            // if transformation is string, parse it
            if (typeof this.transform.value === "string") {
                const definition = this.transform.value ? fromTransformAttribute(this.transform.value) : undefined
                const newMatrics = definition ? fromDefinition(definition) : []
                return newMatrics.length > 0 ? compose(newMatrics) : identity()
            } else if (typeof this.transform.value === "object") {
                return this.transform.value
            }
            return identity()
        })
        this.parent = parent
        this.cumulatedTransform = computed(() => {
            return this.parent ? compose([this.parent.cumulatedTransform.value, this.transformMatrix.value]) : this.transformMatrix.value
        })
    }
}

export const useAnchorStore = defineStore('anchors', {
    state: () => ({
        topicAnchors: new Map<string, Map<string, Map<string, Map<string, TopicAnchor>>>>(),
        transformNodes: new Map<string, TransformNode>(),
    }),
    getters: {
        getTopicAnchor(state) {
            return (nodeName: string | undefined, nodeType: ROS.nodeType, topicGroup: string | undefined, topicName: string | undefined) => {
                if (!nodeName || !topicGroup || !topicName || !nodeType) {
                    return undefined
                }
                const anchor = this.topicAnchors.get(nodeName)?.get(nodeType)?.get(topicGroup)?.get(topicName)
                return anchor
            }
        }
    },
    actions: {
        updateTopicAnchor(nodeName: string, nodeType: ROS.nodeType, topicGroup: string, topicName: string, topicAnchor: TopicAnchor) {
            if (!this.topicAnchors.has(nodeName)) {
                this.topicAnchors.set(nodeName, new Map())
            }

            const typeMap = this.topicAnchors.get(nodeName)!
            if (!typeMap.has(nodeType)) {
                typeMap.set(nodeType, new Map())
            }

            const nodeMap = typeMap.get(nodeType)!
            if (!nodeMap.has(topicGroup)) {
                nodeMap.set(topicGroup, new Map())
            }
            const topicGroupMap = nodeMap.get(topicGroup)!
            topicGroupMap.set(topicName, topicAnchor)
        },
        removeTopicAnchor(nodeName: string, topicGroup: string, topicName: string) {
            if (!this.topicAnchors.has(nodeName)) {
                return
            }
            const nodeMap = this.topicAnchors.get(nodeName)!
            if (!nodeMap.has(topicGroup)) {
                return
            }
            const topicGroupMap = nodeMap.get(topicGroup)!
            topicGroupMap.delete(topicName)
        },
        // getTopicAnchor(nodeName: string | undefined, topicGroup: string | undefined, topicName: string | undefined) {
        //     if (!nodeName || !topicGroup || !topicName) {
        //         return undefined
        //     }
        //     const anchor = this.topicAnchors.get(nodeName)?.get(topicGroup)?.get(topicName)
        //     if (!anchor) {
        //         return this.setTopicAnchor(nodeName, topicGroup, topicName, 0, 0)
        //     }
        //     return anchor
        // }
    }
})






