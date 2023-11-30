
<template>
    <div>

        <!-- Button to reset -->
        <q-btn
            @click="visStore.resetToDefault()"
            dense
            label="Reset to defaults"
            color="primary"
            class="q-mb-md" />
        <q-list dense>
            <q-item v-for="slider in sliders" :key="slider.label">
                <q-item-section side>
                    <q-item-label>{{ slider.label }}: {{ slider.value }}</q-item-label>
                </q-item-section>
                <q-item-section>
                    <q-slider
                        v-model="slider.value"
                        :min="slider.min"
                        :max="slider.max"
                        :step="slider.step"
                        label
                        color="secondary" />
                </q-item-section>
            </q-item>
        </q-list>

    </div>
</template>

<script setup lang="ts">

import { useRosStore } from 'src/stores/ros';
import { useVisualSettingsStore } from 'src/stores/visualSettings';
import { Ref, computed, ref, toRef, watch } from 'vue';

import * as RGr from 'src/ros/rosGraph'
import * as ROS from 'src/ros/rosNode'
import { StoreDefinition } from 'pinia';

// const rosStore = useRosStore();
const visStore = useVisualSettingsStore()

interface Slider {
    min: number,
    max: number,
    step: number,
    value: Ref<number>,
    label: string,
    tickFormatter: (value: number) => string,
}

// strokeWidthPubSub: 3.0,
// strokeWidthService: 2.0,
// strokeWidthBroadcast: 0.5,
// outerRadius: 300,
// maxInnerRadiusFactor: 0.8,
// minInnerRadiusFactor: -0.5,//-0.5,
// maxOuterRadiusFactor: 2.9,
// minOuterRadiusFactor: 1.4,
// startAngleOffset: -90,
// circleGap: 0,
// connectedGapFactor: 1.5,

const sliders = ref<Slider[]>([
    {
        min: 1,
        max: 10,
        step: 1,
        // value: new StoreRefValue(visStore, "strokeWidthPubSub").value,
        value: toRef(visStore, "strokeWidthPubSub"),
        label: "Stroke Width Pub/Sub",
        tickFormatter: (value: number) => `${value}`,
    },
    {
        min: 1,
        max: 10,
        step: 1,
        value: toRef(visStore, "strokeWidthService"),
        label: "Stroke Width Service",
        tickFormatter: (value: number) => `${value}`,
    },
    {
        min: 1,
        max: 10,
        step: 1,
        value: toRef(visStore, "strokeWidthBroadcast"),
        label: "Stroke Width Broadcast",
        tickFormatter: (value: number) => `${value}`,
    },
    {
        min: -2,
        max: 2,
        step: 0.01,
        value: toRef(visStore, "maxInnerRadiusFactor"),
        label: "Max Inner Radius Factor",
        tickFormatter: (value: number) => `${value}`,
    },
    {
        min: -2,
        max: 2,
        step: 0.01,
        value: toRef(visStore, "minInnerRadiusFactor"),
        label: "Min Inner Radius Factor",
        tickFormatter: (value: number) => `${value}`,
    },
    {
        min: -1,
        max: 10,
        step: 0.01,
        value: toRef(visStore, "maxOuterRadiusFactor"),
        label: "Max Outer Radius Factor",
        tickFormatter: (value: number) => `${value}`,
    },
    {
        min: -1,
        max: 10,
        step: 0.01,
        value: toRef(visStore, "minOuterRadiusFactor"),
        label: "Min Outer Radius Factor",
        tickFormatter: (value: number) => `${value}`,
    },

    {
        min: 0,
        max: 359,
        step: 1,
        value: toRef(visStore, "circleGap"),
        label: "Circle Gap",
        tickFormatter: (value: number) => `${value}`,
    }
])



</script>

<style scoped></style>

