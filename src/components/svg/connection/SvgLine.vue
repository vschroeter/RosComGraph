<template>
    <path v-if="visible"
        ref="refPath"
        :d="path"
        :class="(styleClass ?? '') + ' cut-off'"
        :style="style"
        :marker-start="markerStart ? `url(#${markerStart}` : ''"
        :marker-mid="markerMid ? `url(#${markerMid}` : ''"
        :marker-end="markerEnd ? `url(#${markerEnd}` : ''"/>
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
    strokeWidth?: number,
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
    strokeWidth: 2,
    opacity: 1,
    curveStyle: "linear",
    markerLength: 10,
})

////////////////////////////////////////////////////////////////////////////
// Vue Hooks
////////////////////////////////////////////////////////////////////////////

onMounted(() => {
    updatePathCutoff();
})

onUpdated(() => {
    updatePathCutoff()
})

////////////////////////////////////////////////////////////////////////////
// Path generation stuff 
////////////////////////////////////////////////////////////////////////////


/** The curve factory to use for the line */
const curveFactory = computed(() => {
    switch (props.curveStyle) {
        case "linear":
            return d3.curveLinear
        case "basis":
            return d3.curveBasis
        case "natural":
            return d3.curveNatural
        default:
            return props.curveStyle
    }
})

/** The path generator to use for the line */
const pathGenerator = computed(() => {
    return d3.line<Point2D>()
        .x(d => d.x)
        .y(d => d.y)
        .curve(curveFactory.value)
})

/** The path of the line, based on the given points */
const path = computed(() => {
    return pathGenerator.value(props.points) || undefined
})



////////////////////////////////////////////////////////////////////////////
// Path cutoff stuff with Dasharray and Dashoffset
////////////////////////////////////////////////////////////////////////////


const strokeDashArray = ref(0)
const strokeDashOffset = ref(0)

/**
 * Update the style of the line to get a clean cut-off at the marker
 */
function updatePathCutoff() {
    // Here we want to adapt the stroke-dasharray and stroke-dashoffset to get a clean cut-off of the line at the marker
    const pathLen = refPath.value?.getTotalLength() ?? 0

    let dashArray = pathLen
    let dashoffset = 0

    const strokeWidthStr = getStyle(refPath.value!, "stroke-width")
    const strokeWidth = getStrokeWidthFromString(strokeWidthStr)

    // If there is a start marker, reduce the dasharray by the marker length and offset the dashoffset by the marker length
    if (props.markerStart) {
        dashArray -= props.markerLength * strokeWidth
        dashoffset -= props.markerLength * strokeWidth
    }

    // If there is an end marker, reduce the dasharray by the marker length
    if (props.markerEnd) {
        const diff = props.markerLength * strokeWidth
        if (diff * 2 > dashArray) {
            dashoffset += diff
        } else {
            dashArray -= diff
        }
    }

    // Set the dasharray and dashoffset
    strokeDashArray.value = dashArray
    strokeDashOffset.value = dashoffset
}



/**
 * Get a style property of an element
 * Adapted from: https://gist.github.com/guilhermejcgois/e014b2afac753325326691b4be28993c
 * @param el The element to get the style from
 * @param styleProp The style property to get
 */
function getStyle(el: Element, styleProp: string): string {
    let value;
    const defaultView = el.ownerDocument.defaultView;
    // W3C standard way:
    if (defaultView && defaultView.getComputedStyle) {
        // sanitize property name to css notation (hypen separated words eg. font-Size)
        styleProp = styleProp.replace(/([A-Z])/g, '-$1').toLowerCase();
        return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    } else if (el['currentStyle']) { // IE
        // sanitize property name to camelCase
        styleProp = styleProp.replace(/\-(\w)/g, function (str, letter) {
            return letter.toUpperCase();
        });
        value = el['currentStyle'][styleProp];
        return value;
    }
    return '';
}


/**
 * Parse a stroke width string like '4.5px' and return the number in svg units
 * @param strokeWidthString The stroke width string
 */
function getStrokeWidthFromString(strokeWidthString: string): number {
    const match = strokeWidthString.match(/((\d+)(\.\d+)?)(\w+)/)

    // TODO: This completely ignores expressions like 'calc(0% + 4.5px)' and just take the first occurence of a number with a unit behind it, like '4.5px'
    // TODO: add support for other units (if needed?)
    if (match) {
        const value = parseFloat(match[1])
        const unit = match[4]
        switch (unit) {
            case "px":
                return value
            // case "em":
            //     return value * 16
            // case "rem":
            //     return value * 16
            // case "pt":
            //     return value * 1.33
            // case "pc":
            //     return value * 16
            // case "mm":
            //     return value * 3.78
            // case "cm":
            //     return value * 37.8
            // case "in":
            //     return value * 96
            default:
                return value
        }
    } else {
        console.warn(">>> Could not parse stroke width", strokeWidthString)
    }
    return 0
}

</script>

<style scoped>
.cut-off {
    stroke-dasharray: v-bind(strokeDashArray);
    stroke-dashoffset: v-bind(strokeDashOffset);
}
</style>
