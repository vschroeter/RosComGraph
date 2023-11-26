<template>
    <g>
        <circle :cx="_cx" :cy="_cy" :r="r * 1.5" fill="none" stroke="none" pointer-events="all" />
        <circle :cx="_cx" :cy="_cy" :r="radius" :class="styleClass" />
        <text
            :transform="`translate(${cx}, ${cy}) rotate(${textAngle}) translate(${textXTranslation}, ${0}) `"
            :x="0" :y="0"
            fill="var(--q-stroke)"
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
import { Ref, computed, onBeforeUnmount, onMounted, onUnmounted, onUpdated, ref, toRef, toValue, watch } from "vue";
import * as RGr from 'src/ros/rosGraph'
import { modPositive } from 'src/utils/helper';

////////////////////////////////////////////////////////////////////////////
// Stores
////////////////////////////////////////////////////////////////////////////

const anchorStore = useNodeAnchorStore()

////////////////////////////////////////////////////////////////////////////
// Props
////////////////////////////////////////////////////////////////////////////

const props = withDefaults(defineProps<{
    node: RGr.RosGraphNode,
    anchorMappingPrefix: string,
    cx: number
    cy: number
    r: number
    angle?: number
    styleClass?: string,
    transformation?: Transformation,
    adaptiveRadius?: boolean
}>(), {
    cx: 0,
    cy: 0,
    r: 10,
    styleClass: "",
    angle: 0,
    anchorMappingPrefix: "",
    adaptiveRadius: true
})

////////////////////////////////////////////////////////////////////////////
// Computed values
////////////////////////////////////////////////////////////////////////////

//++++ Position and radius ++++//

const _cx = ref(props.cx)
const _cy = ref(props.cy)
const _r = ref(props.r)

watch([() => props.cx, () => props.cy, () => props.r], () => {
    // const duration = 0.5
    // gsap.to(_cx, { duration: duration, value: props.cx })
    // gsap.to(_cy, { duration: duration, value: props.cy })
    // gsap.to(_r, { duration: duration, value: props.r })

    _cx.value = props.cx
    _cy.value = props.cy
    _r.value = props.r


}, { immediate: true })


//++++ Radius adaption ++++//

const radius = computed(() => {
    if (!props.adaptiveRadius) return props.r

    const out = props.node.predecessorNodes
    const ing = props.node.successorNodes
    const sum = out.length + ing.length
    const fac = Math.min(5, Math.pow(1.2, sum))
    // const fac = Math.min(5, (1 + sum * 1) * Math.pow(0.95, sum))
    return props.r * fac / 2

})


//++++ Text ++++//

const displayedText = computed(() => {
    return props.node.node.name
    // node.node.name + " " + Math.floor(normAngle) + " " + (textOnRightSide ? '(r)' : '(l)')
})

const normAngle = computed(() => modPositive(props.angle, 360))
const textOnRightSide = computed(() => { return (normAngle.value >= 270) || (normAngle.value <= 90) })
const textAnchor = computed(() => textOnRightSide.value ? "start" : "end")

const textAngle = computed(() => {
    const angleFraction = 5
    if (textOnRightSide.value) {
        if (normAngle.value <= 180) return normAngle.value / angleFraction
        else return (normAngle.value - 360) / angleFraction
    } 
    else return (normAngle.value - 180) / angleFraction
})

const textXTranslation = computed(() => {
    const dist = (radius.value + props.r / 5)
    return textOnRightSide.value ? dist : -dist
})

////////////////////////////////////////////////////////////////////////////
// Anchors
////////////////////////////////////////////////////////////////////////////

const anchorSelect = (point: Point2D | Ref<Point2D>) => {
    return computed(() => {
        const xDif = toValue(point).x - props.cx
        const yDif = toValue(point).y - props.cy
        const len = Math.sqrt(xDif * xDif + yDif * yDif)
        const rad = radius.value
        const fac = rad / len
        const x = props.cx + xDif * fac
        const y = props.cy + yDif * fac
        return { x: x, y: y }
    })
}

const centerPoint = computed(() => {
    return { x: props.cx, y: props.cy }
})

const objectAnchor = useObjectAnchor({
    local: centerPoint,
    transformation: undefined,
    anchorSelection: anchorSelect
})

////////////////////////////////////////////////////////////////////////////
// Lifecycle hooks
////////////////////////////////////////////////////////////////////////////

onMounted(() => {
    // console.log(">> CN mounted")
    anchorStore.updateNodeAnchor(props.node.key, objectAnchor, props.anchorMappingPrefix)
})

onUpdated(() => {
    anchorStore.updateNodeAnchor(props.node.key, objectAnchor, props.anchorMappingPrefix)
})

onBeforeUnmount(() => {
    anchorStore.removeNodeAnchor(props.node.key, props.anchorMappingPrefix)
})

////////////////////////////////////////////////////////////////////////////
// Exposes
////////////////////////////////////////////////////////////////////////////
defineExpose({
    objectAnchor: objectAnchor
})

</script>

<style scoped></style>