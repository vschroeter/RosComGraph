<template>
    <defs>
        <marker 
            :id="markerName" 
            :refX="refX" :refY="refY"
            :markerWidth="width" :markerHeight="height" 
            :orient="orient" :markerUnits="markerUnits" 
            :viewBox="`0, 0, ${width}, ${height}`">
            <path :d="path" :class="styleClass" :style="style" opacity="1" />
        </marker>
    </defs>
</template>

<script setup lang="ts">

import { computed, ref } from 'vue';
import * as d3 from 'd3'

//++++ Props ++++//
const props = withDefaults(defineProps<{
    markerType?: string,
    markerName?: string,
    align?: "start" | "middle" | "end",
    width?: number,
    height?: number,
    offsetX?: number,
    offsetY?: number,
    orient?: "auto" | "auto-start-reverse" | string,
    markerUnits?: "strokeWidth" | "userSpaceOnUse",
    styleClass?: string,
    style?: string,
}>(), {
    markerType: "arrow",
    markerName: "arrow",
    align: "middle",
    orient: "auto-start-reverse",
    width: 20,
    height: 20,
    offsetX: 0,
    offsetY: 0,
    markerUnits: "strokeWidth",
    styleClass: "default",
})


////////////////////////////////////////////////////////////////////////////
// Size calculations
////////////////////////////////////////////////////////////////////////////



// y coordinate always in the middle
const refY = computed(() => props.height / 2 + props.offsetY);

// x coordinate depends on alignment
const refX = computed(() => {
    let x = 0;
    if (props.align === "start") {
        x = 0;
    }
    else if (props.align === "middle") {
        x = props.width / 2;
    }
    else if (props.align === "end") {
        x = props.width;
    }    
    return x + props.offsetX;
})


////////////////////////////////////////////////////////////////////////////
// Marker path
////////////////////////////////////////////////////////////////////////////

const arrowPoints = computed(() => {
    return [[0, 0], [0, props.height], [props.width, props.height / 2]];
})

const path = computed(() => {
    return d3.line<number[]>()
        .x(d => d[0])
        .y(d => d[1])
        (arrowPoints.value) || ""
    // .curve(d3.curveBasis)(arrowPoints.value) || ""
})

</script>

<style scoped>
.default {
    fill: var(--q-stroke);
    stroke: none;
    stroke-width: 0;
}
</style>