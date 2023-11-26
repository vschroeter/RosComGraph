<template>
    <q-page class="column items-stretch justify-start">
        <div v-if="displayedTopic">
            <q-card class="q-ma-md">
                <q-card-section>
                    <div class="text-h6">{{ displayedTopic.name }}</div>
                    <div class="text-subtitle2">{{ displayedTopic.messageType.name }}</div>
                </q-card-section>
                <q-separator dark inset />
                <q-card-section>
                    Message Type Definition:
                    <q-tree ref="refTree" :nodes="definitionTree" node-key="label" :default-expand-all="true" />
                </q-card-section>
                <!-- <q-card-section>
                    {{ displayedTopic.messageType.definition || "Definition of the message" }}
                </q-card-section> -->
                
            </q-card>
        </div>

    </q-page>
</template>

<script setup lang="ts">
import * as ROS from 'src/ros/rosNode'

import { computed, nextTick, ref, toRef, watch } from 'vue';
import { useResizeObserver } from '@vueuse/core'

import SvgRosNode from 'src/components/svg/node/SvgRosNode.vue';
import { useRosStore } from 'stores/ros'
import { useViewBoxGetter } from 'src/components/svg/scripts/directives';
import { QTree } from 'quasar';

const refDivNode = ref<HTMLDivElement | null>(null)
const refTree = ref<InstanceType<typeof QTree> | null>(null)	

const rosStore = useRosStore()

const refNode = ref<InstanceType<typeof SvgRosNode> | null>(null)
const viewBox = useViewBoxGetter(() => refNode.value?.bBox, 10, 0, 0)

const nodeWidth = ref(200)

useResizeObserver(refDivNode, (entries) => {
    const entry = entries[0]
    const { width, height } = entry.contentRect
    // text.value = `width: ${width}, height: ${height}`
    // console.log(`width: ${width}, height: ${height}`)
    nodeWidth.value = width
})


const displayedTopic = ref<ROS.Topic | null>(null)

watch(() => rosStore.selectedTopic, () => {
    if (rosStore.selectedTopic) {
        // console.log("TOPIC:", rosStore.selectedTopic)
        displayedTopic.value = rosStore.selectedTopic
        const topic = rosStore.selectedTopic
        if (topic.messageType.definition) {
            return
        }

        rosStore.systemInfoConnection?.getTopicTypeInfo(topic).then((res) => {
            // console.log("TOPIC TYPE INFO:", res)
            topic.messageType.definition = res.definition
        }).catch((err) => {
            console.error("TOPIC TYPE INFO ERROR:", err)
        })
    }
})


const definitionTree = computed(() => {
    const def = displayedTopic.value?.messageType.definition
    if (!def) {
        return [{ label: "No definition available"}]
    }

    // Iter over each field in parsed
    // If field is an object, add a children field
    // If field is an array, add a children field
    // If field is a primitive, add its field name concatenated with the value as label

    const tree = []

    function parseField(field: any, name: string): any {
        if (typeof field === 'object') {
            if (Array.isArray(field)) {
                return {
                    label: `${name} (Array)`,
                    children: field.map((f, i) => parseField(f, `${name}[${i}]`))
                }
            } else {
                return {
                    label: `${name}`,
                    children: Object.entries(field).map(([key, value]) => parseField(value, key))
                }
            }
        } else {
            return {
                label: `${name} (${field})`
            }
        }
    }

    Object.entries(def).forEach(([key, value]) => {
        tree.push(parseField(value, key))
    })

    nextTick(() => {
        refTree.value?.expandAll()
    })

    if (tree.length == 0) {
        return [{ label: "–"}]
    }

    return tree
})


</script>
