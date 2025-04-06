<template>
    <q-page class="column items-stretch justify-start">
        <!-- <q-card flat bordered style="width: 100%;">
            Test
        </q-card> -->
        <div class="col-auto q-ma-md self-center">
            <p class="text-center">Displayed data</p>
            <div class="row justify-center">
                <div class="col-auto q-ma-sm">
                    <q-btn-group rounded>
                        <q-btn icon="refresh" color="secondary" outline @click="rosStore.update++" />
                        <q-btn-dropdown color="secondary" :label="rosStore.visMode" rounded>
                            <q-list>
                                <q-item clickable v-close-popup @click="setVisMode('Show live data', true)">
                                    <q-item-section>
                                        <q-item-label>Show live data</q-item-label>
                                    </q-item-section>
                                </q-item>

                                <q-item clickable v-close-popup
                                    @click="setVisMode('Uploaded Data', false)">
                                    <q-item-section>
                                        <q-item-label>Uploaded Data</q-item-label>
                                    </q-item-section>
                                </q-item>

                                <q-item clickable v-close-popup
                                    @click="setVisMode('Saved data (Self-driving car | 7 nodes)', false)">
                                    <q-item-section>
                                        <q-item-label>Saved data (Self-driving car | 7 nodes)</q-item-label>
                                    </q-item-section>
                                </q-item>

                                <q-item clickable v-close-popup
                                    @click="setVisMode('Saved data (Table Robot | 8 nodes)', false)">
                                    <q-item-section>
                                        <q-item-label>Saved data (Table Robot | 8 nodes)</q-item-label>
                                    </q-item-section>
                                </q-item>

                                <q-item clickable v-close-popup
                                    @click="setVisMode('Example data (Broadcast Characteristic | 12 nodes)', false)">
                                    <q-item-section>
                                        <q-item-label>Example data (Broadcast Characteristic | 12 nodes)</q-item-label>
                                    </q-item-section>
                                </q-item>

                                <q-item clickable v-close-popup
                                    @click="setVisMode('Example data (Autonomous Driving derived from Autoware | 13 nodes)', false)">
                                    <q-item-section>
                                        <q-item-label>Example data (Autonomous Driving derived from Autoware | 13
                                            nodes)</q-item-label>
                                    </q-item-section>
                                </q-item>

                                <q-item clickable v-close-popup
                                    @click="setVisMode('Saved data (Table Robot | 21 nodes)', false)">
                                    <q-item-section>
                                        <q-item-label>Saved data (Table Robot | 21 nodes)</q-item-label>
                                    </q-item-section>
                                </q-item>

                                <q-item clickable v-close-popup
                                    @click="setVisMode('Saved data (Table Robot | 26 nodes)', false)">
                                    <q-item-section>
                                        <q-item-label>Saved data (Table Robot | 26 nodes)</q-item-label>
                                    </q-item-section>
                                </q-item>



                                <q-item v-if="false" clickable v-close-popup
                                    @click="setVisMode('Test', false)">
                                    <q-item-section>
                                        <q-item-label>Test</q-item-label>
                                    </q-item-section>
                                </q-item>

                                <!-- <q-item clickable v-close-popup @click="setVisMode('Show presentation data', false)">
                                    <q-item-section>
                                        <q-item-label>Show presentation nodes</q-item-label>
                                    </q-item-section>
                                </q-item> -->

                            </q-list>
                        </q-btn-dropdown>
                    </q-btn-group>

                    <div class="row justify-center">
                        <!-- QFile to upload a json file -->
                        <div class="col-auto q-ma-sm self-center">
                            <q-file v-model="uploadedFile" label="Upload JSON file" color="primary" accept=".json" />
                        </div>
                        <div v-if="false" class="col-auto q-ma-sm self-center">
                            <q-btn color="primary" label="Download as JSON" rounded @click="downloadJson()" />
                        </div>

                        <div class="col-auto q-ma-sm self-center">
                            <!-- q-button linked to https://github.com/vschroeter/rosmetasys-datasets in a new window -->
                            <q-btn color="primary" rounded
                                href="https://github.com/vschroeter/rosmetasys-datasets" target="_blank">
                                Share your dataset <q-icon class="superscript-icon" name="open_in_new" />
                            </q-btn>

                        </div>



                    </div>
                </div>
            </div>
        </div>
        <div class=" col-auto self-center" v-if="showWsInput">
            <div class="col-auto q-mt-sm self-center">
                <q-input filled error-message="Enter valid websocket URL" :error="!checkWsUrl()"
                    v-model="wsUrl"
                    label="Websocket URL" @blur="updateUrl()" @keyup.enter="updateUrl()" />
            </div>
        </div>
        <div v-if="rosStore.visMode == 'Show live data'" class="col-auto self-center">
            <q-toggle v-model="rosStore.autoUpdates" label="Enable Auto Updates" />
        </div>

        <!-- <div class="col-auto q-ma-sm self-center">
        </div> -->
        <q-separator inset />
        <div class="col-auto">
            <p class="text-center">Overview</p>
            <!-- :height="(refFDG?.bBox?.height ?? 200)" -->
            <svg ref="refMainSvg" width="100%" height="40vh" :viewBox="viewBox">
                <g :ref="interactiveRef.ref">
                    <force-directed-graph v-if="false" ref="refFDG" :nodes="rosStore.nodes"
                        :selectedNode="rosStore.selectedNode?.key"
                        :hovered-node="rosStore.hoveredNode?.key"
                        @selectedNode="(n) => rosStore.selectedNode = rosStore.getNode(n)!"
                        @hoveredNode="(n) => rosStore.hoveredNode = (n ? rosStore.getNode(n)! : null)" />

                    <CircularView v-if="true" ref="refCV" :nodes="rosStore.nodes" name="LeftCV"
                        :outer-radius="150"
                        :graph-sorting="'flow'" :start-angle-offset="-90" :strokeWidthPubSub="4"
                        :stroke-width-service="3"
                        :marker-width="2" :marker-height="2" :selectedNode="rosStore.selectedNode?.key"
                        :hovered-node="rosStore.hoveredNode?.key"
                        @selectedNode="(n) => rosStore.selectedNode = (rosStore.selectedNode?.key != n ? rosStore.getNode(n) : null)!"
                        @hoveredNode="(n) => rosStore.hoveredNode = (n ? rosStore.getNode(n)! : null)"
                        :use-service-connections="rosStore.componentsUseServiceClientConnections"
                        :use-pub-sub-connections="rosStore.componentsUsePubSubConnections"
                        :use-broadcast-connections="rosStore.componentsUseBroadcastConnections" />
                </g>
            </svg>
        </div>
        <q-separator inset />
        <div class="col-auto q-mx-lg q-my-sm">
            <p class="text-center">Node Sorting Method</p>
            <div class="col-auto q-mx-lg">
                <q-radio v-for="option in sortingOptions" :key="option.value"
                    v-model="rosStore.nodeSorting"
                    :val="option.value" :label="option.label">
                    <q-tooltip :delay="500">{{ option.tooltip }}</q-tooltip>
                </q-radio>
            </div>
        </div>

        <!-- <q-btn-toggle class="q-mx-lg" rounded v-model="selectedSorting" toggle-color="secondary" :options="[
            { label: 'Topological Sorting', value: 'topological' },
            { label: 'Flow Sorting', value: 'flow' },
        ]" /> -->

        <q-separator inset />

        <!-- <div class="col-auto q-mx-xl q-mt-md">
            <q-input clearable filled color="primary" v-model="rosStore.topicFilter" label="Topic Filter" />

        </div> -->

        <div class="col-auto q-mx-lg q-my-sm">
            <p class="text-center">Visible connections</p>

            <q-item tag="label" v-ripple>
                <q-item-section avatar>
                    <q-toggle v-model="rosStore.showPubSubConnections"
                        color="var(---q-stroke-pubsub)" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>Show publisher / subscriber connections</q-item-label>
                </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
                <q-item-section avatar>
                    <q-toggle v-model="rosStore.showBroadcastConnections"
                        color="var(---q-stroke-service)" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>Show broadcast connections</q-item-label>
                    <q-item-label caption>'Broadcast connections' are topics that a node both publishes
                        and subscribes
                        to
                        simultaneously.</q-item-label>
                </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
                <q-item-section avatar>
                    <q-toggle v-model="rosStore.showServiceClientConnections" color="$test"
                        keep-color />
                </q-item-section>
                <q-item-section>
                    <q-item-label>Show service / client connections</q-item-label>
                </q-item-section>
            </q-item>
        </div>

        <q-separator inset />

        <div class="col-auto q-mx-lg q-my-sm">

            <p class="text-center">Connections used for the algorithms</p>

            <q-item tag="label" v-ripple>
                <q-item-section avatar>
                    <q-toggle v-model="rosStore.componentsUsePubSubConnections" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>Use publisher / subscriber connections for connected
                        components</q-item-label>
                </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
                <q-item-section avatar>
                    <q-toggle v-model="rosStore.componentsUseBroadcastConnections" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>Use broadcast connections for connected components</q-item-label>
                    <q-item-label caption>'Broadcast connections' are topics that a node both publishes
                        and subscribes
                        to
                        simultaneously.</q-item-label>
                </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
                <q-item-section avatar>
                    <q-toggle v-model="rosStore.componentsUseServiceClientConnections" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>Use service / client connections for connected
                        components</q-item-label>
                </q-item-section>
            </q-item>

        </div>

        <q-separator inset />

        <div class="col-auto q-mx-lg q-my-sm">
            <p class="text-center">Visible Nodes</p>
            <!-- Toggle for selecting local_host nodes or node -->
            <q-item tag="label" v-ripple>
                <q-item-section avatar>
                    <q-toggle v-model="rosStore.showLocalHostNodes" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>Show nodes that are started with ROS_LOCALHOST_ONLY</q-item-label>
                </q-item-section>
            </q-item>
            <NodeList />
        </div>

        <q-separator inset />

        <div class="col-auto q-mx-lg q-my-sm">
            <p class="text-center">Circular View Settings</p>
            <CircleViewSettings />
        </div>

    </q-page>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue';

import ForceDirectedGraph from 'src/components/svg/overview/ForceDirectedGraph.vue';
import CircularView from 'src/components/svg/overview/CircularView.vue';
import NodeList from 'src/components/NodeList.vue';
import CircleViewSettings from 'src/components/CircleViewSettings.vue';
import { useRosStore, type visMode } from 'stores/ros'
import { svgInteractiveRef, useViewBoxGetter } from 'src/components/svg/scripts/directives';
import { useStorage } from '@vueuse/core';

const rosStore = useRosStore()

const refFDG = ref<InstanceType<typeof ForceDirectedGraph> | null>(null)

const refMainSvg = ref<SVGSVGElement | null>(null)
const interactiveRef = svgInteractiveRef(refMainSvg);

const refCV = ref<InstanceType<typeof CircularView> | null>(null)
const viewBox = useViewBoxGetter(() => refCV.value?.bBox)
// const viewBox = useViewBoxGetter(() => refFDG.value?.bBox)


function downloadJson() {

    // create simplified data from nodes
    const data = rosStore.nodes.map(n => {
        return {
            name: n.name,
            namespace: n.namespace,
            topics: n.topics.map(t => {
                return {
                    name: t.name,
                    type: t.type,
                    messageType: t.messageType.name,
                }
            }), //{ let {node: _, ...rest} = t; return rest}
        }
    })

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `rosVizData_${rosStore.nodes.length}_nodes.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

////////////////////////////////////////////////////////////////////////////
// Upload JSON file
////////////////////////////////////////////////////////////////////////////

const uploadedFile = ref<File | null>(null)
const uploadedData = ref<any>(null)

watch(uploadedFile, (file) => {
    if (file) {
        // console.log("Uploaded file", file)
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target?.result as string)
            // console.log("Uploaded data", data)
            rosStore.visMode = "Uploaded data"
            rosStore.visJsonData = data
            uploadedData.value = data
        }
        reader.readAsText(file)
    }
})


const topicFilter = ref<string>("")

//////////////////////////
// IP Address
//////////////////////////

// const wsUrl = useStorage<string>("wsUrl", "ws://192.168.0.216:9091")
const wsUrl = ref(rosStore.wsUrl)

function checkWsUrl() {
    return wsUrl.value.match(/^(ws:\/\/|wss:\/\/)[a-zA-Z0-9\.\-_]+(:[0-9]+)?(\/[a-zA-Z0-9\.\-_]+)*$/)
}

function updateUrl() {
    console.log("Updating url")
    if (checkWsUrl()) {
        rosStore.wsUrl = wsUrl.value
    }
}

// const flowSortingEnabled = ref(rosStore.nodeSorting == "flow")
// watch(flowSortingEnabled, () => {
//     rosStore.nodeSorting = flowSortingEnabled.value ? "flow" : "topological"
// })

// <q-btn-toggle rounded v-model="rosStore.nodeSorting" toggle-color="primary" :options="[
//                 { label: 'Flow Sorting', value: 'flow' },
//                 { label: 'Topological Sorting', value: 'topological' },
//                 { label: 'Breadth First Sorting', value: 'breadth-first' },
//                 { label: 'Depth First Sorting', value: 'depth-first' },
//             ]" />

const sortingOptions = [
    { label: 'Flow Sorting', value: 'flow', tooltip: 'Our proposed sorting approach to optimize visualization of global dataflow and minimize edge distances.' },
    { label: 'Topological Sorting', value: 'topological', tooltip: 'Topological sorting based on our approach to calculate topological generations.' },
    { label: 'Breadth First Sorting', value: 'breadth-first', tooltip: 'Breadth first sorting of the communication graph.' },
    { label: 'Breadth First Sorting (forward edges)', value: 'breadth-first-forward', tooltip: 'Breadth first sorting of the communication graph (considering forward edges before backward edges).' },
    { label: 'Depth First Sorting', value: 'depth-first', tooltip: 'Depth first sorting of the communication graph.' },
    { label: 'Depth First Sorting (forward edges)', value: 'depth-first-forward', tooltip: 'Depth first sorting of the communication graph (considering forward edges before backward edges).' },

]

const showWsInput = ref(false);

function setVisMode(mode: visMode, showWs: boolean = false) {
    rosStore.visMode = mode;
    showWsInput.value = showWs;

    if (mode == "Uploaded Data") {
        if (uploadedData.value) rosStore.visJsonData = uploadedData.value;
    }
}

</script>


<style scoped>
.bg-test {
    background: var(--q-stroke-service)
}

.text-test {
    color: var(--q-stroke-service)
}

.superscript-icon {
    font-size: 0.9em;
    transform: translateY(-0.5em);
    margin-left: 0.2em;
}
</style>