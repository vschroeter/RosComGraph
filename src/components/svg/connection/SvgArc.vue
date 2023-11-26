```vue
<template>
    <path v-if="visible"
        ref="refPath"
        :d="path"
        :class="(styleClass ?? '') + ' cut-off'"
        :style="style"/>
</template>

<script setup lang="ts">
import { ref, onMounted, onUpdated, computed } from 'vue'
import * as d3 from 'd3'

import { type Point2D } from 'stores/anchors';

//++++ Refs ++++//
const refPath = ref<SVGPathElement | null>(null)

//++++ Props ++++//
const props = withDefaults(defineProps<{
    points: Point2D[],
    visible?: boolean,
    stroke?: string,
    strokeWidthStart?: number,
    strokeWidthEnd?: number,
    opacity?: number,
    curveStyle?: "linear" | "basis" | "natural" | d3.CurveFactory,
    markerEnd?: string,
    markerStart?: string,
    markerMid?: string,
    markerLength?: number,
    styleClass?: string,
    style?: string,
}>(), {
    visible: true,
    stroke: "white",
    strokeWidthStart: 2,
    strokeWidthEnd: 2,
    opacity: 1,
    curveStyle: "linear",
    markerLength: 10,
})

// Create a gradient along the path to vary the stroke width
const gradient = d3.select(refPath.value)
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", props.points[0].x)
    .attr("y1", props.points[0].y)
    .attr("x2", props.points[props.points.length - 1].x)
    .attr("y2", props.points[props.points.length - 1].y);

// Define the gradient start and end to represent the varying stroke width
gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", props.stroke)
    .attr("stop-opacity", 1)
    .attr("stop-width", props.strokeWidthStart);

gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", props.stroke)
    .attr("stop-opacity", 1)
    .attr("stop-width", props.strokeWidthEnd);

// Apply the gradient to the path
d3.select(refPath.value)
    .style("stroke", "url(#gradient)");
</script>

<style scoped>
.cut-off {
    stroke-dasharray: v-bind(strokeDashArray);
    stroke-dashoffset: v-bind(strokeDashOffset);
}
</style>