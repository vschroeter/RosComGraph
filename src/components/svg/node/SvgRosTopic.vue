<template>
    <!-- <g ref="refRoot" :transform="outerTransform"> -->
    <g ref="refRoot" >
        <g :transform="innerTransform ?? ''" ref="refInnerTransform">
            <g :transform="anchorTransform" ref="refAnchorTransform">
                <g :transform="centerTransform" :class="styleClass">
                    <!-- <rect :fill="props.bgFill" :x="innerBbox.x" :y="innerBbox.y" :width="width" :height="height"
                        :stroke="props.bgStroke" :stroke-opacity="bgStrokeOpacity" :fill-opacity="props.bgFillOpacity"
                        :rx="props.bgRx" :ry="props.bgRy"
                        :stroke-width="props.bgStrokeWidth" /> -->
                    <rect :x="innerBbox.x" :y="innerBbox.y" :width="width" :height="height" />
                    <g ref="refGContent">
                        <text ref="refText" :text-anchor="textAnchor" :dominant-baseline="textBaseline" :x="textX"
                            :y="textY"
                            :textLength="textLength > 0 ? textLength : undefined"
                            :lengthAdjust="`spacingAndGlyphs`"
                            v-if="textVisible" :font-size="fontSize ?? ''">{{ displayedText }}</text>
                    </g>
                </g>
            </g>
        </g>
        <circle cx="0" cy="0" r="1" fill="orange" opacity="0" />
    </g>
</template>

<script setup lang="ts">
import { scale, rotate, translate, compose, applyToPoint, fromTransformAttribute, fromDefinition, identity, type Matrix } from 'transformation-matrix';

import { ref, reactive, onMounted, onUpdated, computed, watch, toRef, onBeforeUpdate, onUnmounted, onBeforeUnmount, inject, type Ref, ComputedRef, nextTick } from 'vue'
import * as ROS from 'src/ros/rosNode'
import { useRosStore } from 'src/stores/ros'
import { useAnchorStore, TopicAnchor, type Point2D, TransformNode } from 'src/stores/anchors';

import { BBoxAdaption, calculateTransform, transformBoundingBox, useAnchorTransform, useBackgroundRectUpdater, useElementBbox, vBackgroundRect, vCenteredGroup } from 'src/components/svg/scripts/directives'
import { type orientation, Orientation } from 'src/components/svg/scripts/properties';
import { Transformation, useObjectAnchor } from '../composables/anchor';
import { useNodeAnchorStore } from 'src/stores/nodeAnchors';

import fuzzysort from 'fuzzysort'

const rosStore = useRosStore()
const anchorStore = useNodeAnchorStore()

const emit = defineEmits<{
    (e: 'updatedSize'): void,
}>()

const refGContent = ref<SVGGElement | null>(null)
const refRoot = ref<SVGGElement | null>(null)
const refInnerTransform = ref<SVGGElement | null>(null)
const refText = ref<SVGTextElement | null>(null)

const tooltipVisible = ref(true)

const props = withDefaults(defineProps<{
    nodeKey?: string,
    nodeType?: ROS.nodeType,
    topic: ROS.Topic,
    side?: "left" | "right",
    prefix?: string,
    textVisible?: boolean,
    width: number,
    height: number,
    bgFill?: string,
    bgStroke?: string,
    bgStrokeOpacity?: string,
    bgFillOpacity?: number,
    bgRx?: number,
    bgRy?: number,
    bgStrokeWidth?: number,
    mt?: number,
    mb?: number,
    ml?: number,
    mr?: number,
    fontSize?: string | undefined,
    contentOrientation?: orientation,
    anchor?: orientation,
    innerTransform?: string | undefined,
    parentTransformation?: Transformation | undefined,
    anchorMappingPrefix?: string,
}>(), {
    nodeKey: "",
    nodeType: "none",
    side: "left",
    textVisible: true,
    minWidth: 0,
    minHeight: 0,
    bgFill: "var(--q-detailed-node-bg)",
    bgStroke: "var(--q-detailed-node-stroke)",
    bgStrokeOpacity: "var(--q-detailed-node-stroke-opacity)",
    bgFillOpacity: 0.5,
    bgRx: 2,
    bgRy: 2,
    bgStrokeWidth: 0.5,
    mt: 2,
    mb: 2,
    ml: 5,
    mr: 5,
    contentOrientation: "leftcenter",
    anchor: "center",
    prefix: "",
    anchorMappingPrefix: "",
})

const innerBbox = computed(() => {
    return {
        x: -props.width / 2,
        y: -props.height / 2,
        width: props.width,
        height: props.height,
    }
})

const textAnchor = computed(() => {
    if (Orientation.isLeft(props.contentOrientation)) {
        return "start"
    }
    if (Orientation.isRight(props.contentOrientation)) {
        return "end"
    }
    return "middle"
})

const textBaseline = computed(() => {
    if (Orientation.isTop(props.contentOrientation)) {
        return "hanging"
    }
    if (Orientation.isBottom(props.contentOrientation)) {
        return "auto"
    }
    return "central"
})

const textX = computed(() => {
    if (Orientation.isLeft(props.contentOrientation)) {
        return innerBbox.value.x + props.ml
    }
    if (Orientation.isRight(props.contentOrientation)) {
        return innerBbox.value.x + props.width - props.mr
    }
    return innerBbox.value.x + props.width / 2
})

const textY = computed(() => {
    if (Orientation.isTop(props.contentOrientation)) {
        return innerBbox.value.y + props.mt
    }
    if (Orientation.isBottom(props.contentOrientation)) {
        return innerBbox.value.y + props.height - props.mb
    }
    return innerBbox.value.y + props.height / 2
})

// Center the content
const centerTransform = useAnchorTransform(innerBbox, "center")
const centeredBBox = computed(() => {
    return transformBoundingBox(innerBbox.value, [centerTransform.value])
})

// Set the anchor and transform the content to fit the anchor
const anchorTransform = useAnchorTransform(centeredBBox, computed(() => props.anchor))
const outerBBox = computed(() => {
    console.log("### calc outerBBox", props.minWidth)
    return transformBoundingBox(centeredBBox.value, [props.innerTransform])
})

const textLength = ref(0)
function updateTextLength() {
    nextTick(() => {
        const text = refText.value
        if (!text) return;

        const len = text.getComputedTextLength()
        const mx = (props.mr + props.ml)
        if (len >= props.width - mx) {
            textLength.value = props.width - mx
        } else {
            textLength.value = 0
        }

    })
}




// watch(() => props.anchor, () => {
//     console.log("anchor changed", props.anchor)
// })


const transformNodeInner = computed(() => new Transformation(computed(() => props.innerTransform), props.parentTransformation))
const transformNodeAnchor = computed(() => new Transformation(anchorTransform, transformNodeInner.value))
const transformNodeCenter = computed(() => new Transformation(centerTransform, transformNodeAnchor.value))


// const transformNodeInner = new Transformation(computed(() => props.innerTransform), props.parentTransformation)
// const transformNodeAnchor = new Transformation(anchorTransform, transformNodeInner)
// const transformNodeCenter = new Transformation(centerTransform, transformNodeAnchor)


// const transformNodeCenter = computed(() => new TransformNode(elementBbox.centeredTransform, transformNodeInner.value))

const displayedText = computed(() => {
    if (props.prefix.length > 0) {
        return "..." + props.topic.name.slice(props.prefix.length)
    }
    return props.topic.name
})

onMounted(() => {
    anchorStore.updateTopicAnchor(props.nodeKey, props.topic.name, anchor.value, props.anchorMappingPrefix, props.side)
    watch([() => props.width, () => props.topic.name, () => props.textVisible], () => {
        updateTextLength();
    }, { immediate: true })
})

onUpdated(() => {
    // console.log("UPDATE TOPIC", props.topic.KeynodeKey, props.topic)
    anchorStore.updateTopicAnchor(props.nodeKey, props.topic.name, anchor.value, props.anchorMappingPrefix, props.side)
})

onBeforeUnmount(() => {
    anchorStore.removeTopicAnchor(props.nodeKey, props.topic.name, props.anchorMappingPrefix, props.side)
})

const topicAnchorKey = computed(() => {
    return "topic/" + props.nodeKey + "/" + props.topic.name
})

const leftAnchorPoint = computed(() => {
    return {
        x: innerBbox.value.x,
        y: innerBbox.value.y + innerBbox.value.height / 2,
    }
})

const rightAnchorPoint = computed(() => {
    return {
        x: innerBbox.value.x + innerBbox.value.width,
        y: innerBbox.value.y + innerBbox.value.height / 2,
    }
})

function leftDirection(point: Point2D | Ref<Point2D>) {
    return computed(() => {
        return {
            x: leftAnchorPoint.value.x - 1,
            y: leftAnchorPoint.value.y,
        }
    })
}

function rightDirection(point: Point2D | Ref<Point2D>) {
    return computed(() => {
        return {
            x: rightAnchorPoint.value.x + 1,
            y: rightAnchorPoint.value.y,
        }
    })
}

const leftAnchor = computed(() => useObjectAnchor({
    local: leftAnchorPoint,
    transformation: transformNodeCenter.value,
    directionSelection: leftDirection,
}))

const rightAnchor = computed(() => useObjectAnchor({
    local: rightAnchorPoint,
    transformation: transformNodeCenter.value,
    directionSelection: rightDirection,
}))

const anchor = computed(() => {
    if (props.side === "left") {
        return leftAnchor.value
    }
    return rightAnchor.value
})

// const topicSelected = rosStore.isSelectedTopic(props.topic.name)

const styleClass = computed(() => {
    const defaultClass = "topic-" + props.topic.type.toLowerCase()

    const selected = rosStore.isSelectedTopic(props.topic.name, null)
    if (selected !== null) {
        if (selected) {
            return defaultClass + " selected"
        } else {
            return defaultClass + " deselected"
        }
        
    }

    return defaultClass
})

defineExpose({
    bBox: outerBBox,
})

</script>

<style scoped></style>