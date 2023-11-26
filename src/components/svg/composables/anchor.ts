
import { defineStore } from 'pinia'
import * as ROS from 'src/ros/rosNode'
import { RosGraphData, type GraphLayoutNode, type GraphLayoutLink, type GraphLayout } from 'src/ros/rosGraph'
import * as d3 from 'd3'
import { ref, type ComputedRef, type Ref, computed, isRef, toRef, toValue } from 'vue'
import { applyToPoint, compose, fromDefinition, fromTransformAttribute, identity, type Matrix } from 'transformation-matrix'

export interface Point2D {
    x: number
    y: number
}


export class Anchor {
    anchor: Ref<Point2D>
    direction: Ref<Point2D>

    constructor(anchor: Ref<Point2D>, direction: Ref<Point2D>) {
        this.anchor = anchor
        this.direction = direction
    }

    get x () {
        return this.anchor.value.x
    }
    get y () {
        return this.anchor.value.y
    }

    get dx () {
        return this.direction.value.x
    }
    get dy () {
        return this.direction.value.y
    }


    getDirectionPoint(length: number): ComputedRef<Point2D> {
        return computed(() => {
            const xLen = this.direction.value.x - this.anchor.value.x
            const yLen = this.direction.value.y - this.anchor.value.y
            const currentLength = Math.sqrt(xLen * xLen + yLen * yLen)
            if (currentLength === 0) return { x: this.anchor.value.x, y: this.anchor.value.y }
            return { x: this.anchor.value.x + xLen / currentLength * length, y: this.anchor.value.y + yLen / currentLength * length }
        })
    }
}

export type PointSelectionFunction = (point: Point2D | Ref<Point2D>) => Ref<Point2D>

export class ObjectAnchor {
    transformation?: Transformation

    localCenter: Ref<Point2D>
    globalCenter: ComputedRef<Point2D>

    anchorSelection: PointSelectionFunction | undefined
    directionSelection: PointSelectionFunction | undefined

    constructor(local?: Ref<Point2D>, transformation?: Transformation, anchorSelection?: PointSelectionFunction, directionSelection?: PointSelectionFunction) {
        this.localCenter = local || ref({ x: 0, y: 0 })
        this.transformation = transformation
        this.globalCenter = computed(() => {
            return this._applyTransformationToPoint(toValue(this.localCenter))
        })

        this.anchorSelection = anchorSelection
        this.directionSelection = directionSelection
    }

    private _applyTransformationToPoint(point: Point2D | Ref<Point2D>): Point2D {
        return this.transformation ? applyToPoint(toValue(this.transformation.globalTransform), toValue(point)) : toValue(point)
    }

    private _defaultAnchorSelection(point: Point2D | Ref<Point2D>): Ref<Point2D> {
        return this.localCenter
    }

    private _defaultDirectionSelection(point: Point2D | Ref<Point2D>): Ref<Point2D> {
        return toRef(point)
    }

    private selectAnchor(point: Point2D | Ref<Point2D>, global = true): Ref<Point2D> {
        return computed(() => {
            const pVal = toValue(point)
            const p = this.anchorSelection ? this.anchorSelection(pVal) : this._defaultAnchorSelection(pVal)
            return global ? this._applyTransformationToPoint(toValue(p)) : toValue(p)
        })
    }

    private selectDirection(point: Point2D | Ref<Point2D>, global = true): Ref<Point2D> {
        // return this.directionSelection ? this.directionSelection(point) : this._defaultDirectionSelection(point)
        return computed(() => {
            const p = this.directionSelection ? this.directionSelection(point) : this._defaultDirectionSelection(point)
            return global ? this._applyTransformationToPoint(toValue(p)) : toValue(p)
        })
    }

    getAnchor(sourcePoint: Point2D | Ref<Point2D>, global = true): Anchor {
        return new Anchor(this.selectAnchor(sourcePoint, global), this.selectDirection(sourcePoint, global))
    }
}

export function useObjectAnchor({
    local,
    transformation,
    anchorSelection,
    directionSelection
}: {
    local?: Ref<Point2D>, 
    transformation?: Transformation, 
    anchorSelection?: PointSelectionFunction, 
    directionSelection?: PointSelectionFunction
}) {
    return new ObjectAnchor(local, transformation, anchorSelection, directionSelection)
}




export type StaticTransformInput = string | Matrix | null | undefined
export type RefTransformInput = Ref<StaticTransformInput>
export type TransformInput = StaticTransformInput | RefTransformInput

export class Transformation {
    localTransform: RefTransformInput
    localTransformMatrix: ComputedRef<Matrix>

    parentTransformation: Transformation | undefined

    globalTransform: ComputedRef<Matrix>

    constructor(localTransform: TransformInput, parentTransformation: Transformation | undefined = undefined) {
        this.localTransform = toRef(localTransform)
        this.localTransformMatrix = computed(() => {
            const localTrans = toValue(this.localTransform)

            if (localTrans === null || localTrans === undefined) return identity()


            // if transformation is string, parse it
            if (typeof localTrans === "string") {
                const definition = localTrans ? fromTransformAttribute(localTrans) : undefined
                const newMatrics = definition ? fromDefinition(definition) : []
                return newMatrics.length > 0 ? compose(newMatrics) : identity()
            } else if (typeof localTrans === "object") {
                return localTrans
            }
            return identity()
        })

        this.parentTransformation = parentTransformation
        this.globalTransform = computed(() => {
            const local = this.localTransformMatrix.value
            const transformed = this.parentTransformation ? compose([toValue(this.parentTransformation.globalTransform), toValue(this.localTransformMatrix)]) : toValue(this.localTransformMatrix)
            return this.parentTransformation ? compose([toValue(this.parentTransformation.globalTransform), toValue(this.localTransformMatrix)]) : toValue(this.localTransformMatrix)
        })
    }
}






// export class TopicAnchor {
//     parentNode: TransformNode | null = null

//     nodeName: string = ''
//     nodeType: ROS.nodeType = 'none'
//     topicGroup: string = ''
//     topicName: string = ''

//     localInPoint: Point2D = { x: 0, y: 0 }
//     localOutPoint: Point2D = { x: 0, y: 0 }

//     inPoint: ComputedRef<Point2D>
//     outPoint: ComputedRef<Point2D>

//     // get inPoint(): Point2D {
//     //     console.log(this.parentNode?.cumulatedTransform.value, this.parentNode)
//     //     return applyToPoint(this.parentNode ? this.parentNode.cumulatedTransform.value : identity(), this.localInPoint)
//     // }
//     // get outPoint(): Point2D {
//     //     return applyToPoint(this.parentNode ? this.parentNode.cumulatedTransform.value : identity(), this.localOutPoint)
//     // }

//     constructor({
//         nodeName = '',
//         nodeType = 'none',
//         topicGroup = '',
//         topicName = '',
//         localInPoint = { x: 0, y: 0 },
//         localOutPoint = { x: 0, y: 0 },
//         parentNode = null
//     }: {
//         nodeName?: string,
//         nodeType?: ROS.nodeType,
//         topicGroup?: string,
//         topicName?: string,
//         localInPoint?: Point2D,
//         localOutPoint?: Point2D,
//         parentNode?: TransformNode | null
//     }) {
//         this.nodeName = nodeName
//         this.nodeType = nodeType
//         this.topicGroup = topicGroup
//         this.topicName = topicName
//         this.localInPoint = localInPoint
//         this.localOutPoint = localOutPoint
//         this.parentNode = parentNode
//         this.inPoint = computed(() => { return applyToPoint(this.parentNode ? this.parentNode.cumulatedTransform.value : identity(), this.localInPoint) })
//         this.outPoint = computed(() => { return applyToPoint(this.parentNode ? this.parentNode.cumulatedTransform.value : identity(), this.localOutPoint) })
//     }

// }