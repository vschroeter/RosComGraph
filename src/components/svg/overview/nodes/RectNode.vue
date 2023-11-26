<template>
    <g>
        <rect :x="_x" :y="_y" :width="width" :height="height" :class="styleClass" />
        <!-- <circle :cx="_cx" :cy="_cy" :r="radius" :class="styleClass" /> -->
        <text
            ref="refText"
            :transform="`translate(${cx}, ${cy})`"
            :textLength="textLength > 0 ? textLength : undefined"
            :lengthAdjust="`spacingAndGlyphs`"
            :x="0" :y="0"
            fill="var(--q-node-stroke)"
            alignment-baseline="middle"
            :text-anchor="textAnchor">
            {{ displayedText }}
        </text>
    </g>
</template>

<script setup lang="ts">
import gsap from 'gsap';

import { Point2D, Transformation, useObjectAnchor } from "src/components/svg/composables/anchor";
import { useNodeAnchorStore } from "src/stores/nodeAnchors";
import { Ref, computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, onUpdated, ref, toRef, toValue, watch } from "vue";
import * as RGr from 'src/ros/rosGraph'
import { modPositive } from 'src/utils/helper';

////////////////////////////////////////////////////////////////////////////
// Stores
////////////////////////////////////////////////////////////////////////////

const anchorStore = useNodeAnchorStore()

////////////////////////////////////////////////////////////////////////////
// Refs
////////////////////////////////////////////////////////////////////////////

const refText = ref<SVGTextElement | null>(null)

////////////////////////////////////////////////////////////////////////////
// Props
////////////////////////////////////////////////////////////////////////////

const props = withDefaults(defineProps<{
    node: RGr.RosGraphNode,
    anchorMappingPrefix?: string,
    anchorKey?: string,
    type?: "predecessor" | "successor" | "central"
    cx: number,
    cy: number,
    width: number,
    height: number,
    styleClass?: string,
    transformation?: Transformation,
}>(), {
    type: "central",
    cx: 0,
    cy: 0,
    height: 0,
    width: 0,
    styleClass: "",
    anchorMappingPrefix: "",
})

////////////////////////////////////////////////////////////////////////////
// Computed values
////////////////////////////////////////////////////////////////////////////

const mx = ref(2)

//++++ Position and dimensions ++++//

const _cx = ref(props.cx)
const _cy = ref(props.cy)

const _x = computed(() => props.cx - props.width / 2)
const _y = computed(() => props.cy - props.height / 2)

//++++ Text ++++//

const displayedText = computed(() => {
    return props.node.node.name
    // node.node.name + " " + Math.floor(normAngle) + " " + (textOnRightSide ? '(r)' : '(l)')
})

const textAnchor = computed(() => "middle")
const textLength = ref(0)

function updateTextLength() {
    nextTick(() => {
        const text = refText.value
        if (!text) return;

        const len = text.getComputedTextLength()
        if (len > props.width - 2 * mx.value) {
            textLength.value = props.width - 2 * mx.value
        } else {
            textLength.value = 0
        }

    })
}



////////////////////////////////////////////////////////////////////////////
// Anchors
////////////////////////////////////////////////////////////////////////////

const anchorKey = computed(() => {
    return props.anchorKey ?? props.node.key
})

const anchorSelect = (point: Point2D | Ref<Point2D>) => {
    return computed(() => {
        const xDif = toValue(point).x - props.cx
        const yDif = toValue(point).y - props.cy
        const len = Math.sqrt(xDif * xDif + yDif * yDif)
        const rad = 5 // radius.value
        const fac = rad / len
        const x = props.cx + xDif * fac
        const y = props.cy + yDif * fac
        return { x: x, y: y }
    })
}

const centerPoint = computed(() => {
    return { x: props.cx, y: props.cy }
})

const leftAnchorPoint = computed(() => {
    return { x: props.cx - props.width / 2, y: props.cy }
})
const rightAnchorPoint = computed(() => {
    return { x: props.cx + props.width / 2, y: props.cy }
})

const leftDirectionSelection = (point: Point2D | Ref<Point2D>) => {
    return computed(() => {
        return {
            x: leftAnchorPoint.value.x - 1,
            y: leftAnchorPoint.value.y,
        }
    })
}

const rightDirectionSelection = (point: Point2D | Ref<Point2D>) => {
    return computed(() => {
        return {
            x: rightAnchorPoint.value.x + 1,
            y: rightAnchorPoint.value.y,
        }
    })
}

const defaultAnchorPoint = computed(() => {
    return props.type === "predecessor" ? rightAnchorPoint.value : leftAnchorPoint.value
})

const defaultDirectionSelection = (point: Point2D | Ref<Point2D>) => {
    return props.type === "predecessor" ? rightDirectionSelection(point) : leftDirectionSelection(point)
}

const defaultObjectAnchor = useObjectAnchor({
    local: defaultAnchorPoint,
    transformation: undefined,
    anchorSelection: undefined,
    directionSelection: defaultDirectionSelection,
})

const leftObjectAnchor = useObjectAnchor({
    local: leftAnchorPoint,
    transformation: undefined,
    anchorSelection: undefined,
    directionSelection: leftDirectionSelection,
})

const rightObjectAnchor = useObjectAnchor({
    local: rightAnchorPoint,
    transformation: undefined,
    anchorSelection: undefined,
    directionSelection: rightDirectionSelection,
})

function updateAnchors() {
    anchorStore.updateNodeAnchor(anchorKey.value, defaultObjectAnchor, props.anchorMappingPrefix)
    anchorStore.updateNodeAnchor(anchorKey.value + "/left", leftObjectAnchor, props.anchorMappingPrefix)
    anchorStore.updateNodeAnchor(anchorKey.value + "/right", rightObjectAnchor, props.anchorMappingPrefix)
    // console.log(">> CN update anchors for " + anchorKey.value)
}

function removeAnchors() {
    anchorStore.removeNodeAnchor(anchorKey.value, props.anchorMappingPrefix)
    anchorStore.removeNodeAnchor(anchorKey.value + "/left", props.anchorMappingPrefix)
    anchorStore.removeNodeAnchor(anchorKey.value + "/right", props.anchorMappingPrefix)
    // console.log(">> CN remove anchors for " + anchorKey.value)
}

////////////////////////////////////////////////////////////////////////////
// Lifecycle hooks
////////////////////////////////////////////////////////////////////////////

onMounted(() => {
    // console.log(">> CN mounted")
    // console.log(">> CN mounted " + anchorKey.value)
    // anchorStore.updateNodeAnchor(anchorKey.value, objectAnchor, props.anchorMappingPrefix)
    updateAnchors();
    // updateTextLength();

    watch([() => props.width, () => props.height, () => displayedText.value], () => {
        textLength.value = 0
        updateTextLength();
    }, { immediate: true })
})

onUpdated(() => {
    // console.log(">> CN updated " + anchorKey.value)
    updateAnchors();
    // anchorStore.updateNodeAnchor(anchorKey.value, objectAnchor, props.anchorMappingPrefix)
})

onBeforeUnmount(() => {
    // console.log(">> CN unmounted " + anchorKey.value)
    // anchorStore.removeNodeAnchor(anchorKey.value, props.anchorMappingPrefix)
    removeAnchors();
})

////////////////////////////////////////////////////////////////////////////
// Exposes
////////////////////////////////////////////////////////////////////////////
defineExpose({
    objectAnchor: defaultObjectAnchor,
    leftObjectAnchor: leftObjectAnchor,
    rightObjectAnchor: rightObjectAnchor,
})

</script>

<style scoped></style>