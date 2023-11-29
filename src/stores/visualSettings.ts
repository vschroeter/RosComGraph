import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useVisualSettingsStore = defineStore('visualSettings', {
    state: () => ({
        strokeWidthPubSub: useStorage("vs_strokeWidthPubSub", 3.0),
        strokeWidthService: useStorage("vs_strokeWidthService", 2.0),
        strokeWidthBroadcast: useStorage("vs_strokeWidthBroadcast", 0.5),
        outerRadius: useStorage("vs_outerRadius", 300),
        maxInnerRadiusFactor: useStorage("vs_maxInnerRadiusFactor", 0.8),
        minInnerRadiusFactor: useStorage("vs_minInnerRadiusFactor", -0.5),
        maxOuterRadiusFactor: useStorage("vs_maxOuterRadiusFactor", 2.9),
        minOuterRadiusFactor: useStorage("vs_minOuterRadiusFactor", 1.4),
        startAngleOffset: useStorage("vs_startAngleOffset", -180),
        circleGap: useStorage("vs_circleGap", 0),
        connectedGapFactor: useStorage("vs_connectedGapFactor", 1.5),
    }),
    getters: {
    },
    actions: {
        resetToDefault() {
            this.strokeWidthPubSub = 3.0
            this.strokeWidthService = 2.0
            this.strokeWidthBroadcast = 0.5
            this.maxInnerRadiusFactor = 0.8
            this.minInnerRadiusFactor = -0.5
            this.maxOuterRadiusFactor = 2.9
            this.minOuterRadiusFactor = 1.4
            this.startAngleOffset = -180
            this.circleGap = 0
            this.connectedGapFactor = 1.5
        },

    },
})

