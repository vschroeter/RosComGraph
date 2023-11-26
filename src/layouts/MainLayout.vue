<template>
  <q-layout view="hHh Lpr fFf">

    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <div class="row items-center justify-center">
            <div class="col-auto q-mx-sm">
              <q-avatar>
                <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
              </q-avatar>
              <!-- ROS Graph Visualization -->
            </div>
            <div class="col-auto q-mx-sm">ROS Graph Visualization</div>
            <div class="col-auto q-mx-lg q-my-sm">
              <q-input clearable color="white" v-model="rosStore.topicFilter" label="Topic Filter" rounded outlined />
            </div>
          </div>
        </q-toolbar-title>

        <!-- <div class="col-auto q-mx-xl q-mt-md"> -->

        <!-- </div> -->

        <q-toggle v-model="darkMode" checked-icon="light_mode" color="black" unchecked-icon="dark_mode" />

        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer :width="leftDrawerWidth" :show-if-above="leftDrawerOpen" v-model="leftDrawerOpen" side="left" bordered>
      <!-- drawer content -->
      <q-layout view="hHh Lpr fFf" container style="height: 100%;">
        <q-page-container>
          <router-view name="LeftSidebarContent" />

          <!-- <q-page> -->

          <!-- <div style="height: 100%;" id="testDiv" class="column">
              <div class="col-auto">Hallo</div>
              <div class="col-auto col-grow">Test</div>
            </div> -->
          <!-- <div class="col-auto col-grow">
      <q-page-container>
        <router-view name="LeftSidebarContent" />
      </q-page-container>
    </div> -->
          <!-- </q-page> -->

        </q-page-container>
      </q-layout>


      <div v-touch-pan.preserveCursor.prevent.mouse.horizontal="resizeLeftDrawer" class="q-drawer__resizerl"></div>
    </q-drawer>

    <q-drawer :width="rightDrawerWidth" :show-if-above="rightDrawerOpen" v-model="rightDrawerOpen" side="right" bordered>
      <!-- drawer content -->
      <q-layout view="hHh Lpr fFf" container style="height: 100%;">
        <q-page-container>
          <router-view name="RightSidebarContent" />

        </q-page-container>
      </q-layout>
      <div v-touch-pan.preserveCursor.prevent.mouse.horizontal="resizeRightDrawer" class="q-drawer__resizerr"></div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="rosStore.nodesRequested != null" bordered class="bg-grey-8 text-white">
      <q-toolbar>
        <!-- <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          <div>Title</div>
        </q-toolbar-title> -->
        <q-inner-loading :showing="rosStore.nodesRequested != null">
          <!-- <q-spinner-grid size="150px" color="primary" /> -->
          <q-linear-progress stripe size="30px" :value="rosStore.nodesResolved" :buffer="rosStore.nodesRequested ?? 0">
            <div class="absolute-full flex flex-center">
              <q-badge color="white" text-color="accent" :label="`${rosStore.nodesResolved} / ${rosStore.nodesRequested} nodes resolved`" />
            </div>
          </q-linear-progress>
        </q-inner-loading>
      </q-toolbar>
    </q-footer>


  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { useRosStore } from 'stores/ros'

const rosStore = useRosStore()

const $q = useQuasar()
const darkMode = useStorage("darkMode", false)

watch(darkMode, (val) => {
  $q.dark.set(val)
}, { immediate: true })


const rightDrawerWidth = useStorage("rightDrawerWidth", 400)
const rightDrawerOpen = useStorage("rightDrawerOpen", false)

const leftDrawerOpen = useStorage("leftDrawerOpen", true)
const leftDrawerWidth = useStorage("leftDrawerWidth", 400)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}

let initRightDrawerWidth = 300
function resizeRightDrawer(ev) {
  if (ev.isFirst === true) {
    initRightDrawerWidth = rightDrawerWidth.value
  }
  rightDrawerWidth.value = initRightDrawerWidth - ev.offset.x
}

let initLeftDrawerWidth = 300
function resizeLeftDrawer(ev) {
  if (ev.isFirst === true) {
    initLeftDrawerWidth = leftDrawerWidth.value
  }
  leftDrawerWidth.value = initLeftDrawerWidth + ev.offset.x
}

</script>

<style>
.q-drawer__resizerl {
  position: absolute;
  top: 0;
  bottom: 0;
  right: -4px;
  width: 8px;
  background-color: transparent;
  cursor: ew-resize;
}

.q-drawer__resizerr {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -4px;
  width: 8px;
  background-color: transparent;
  cursor: ew-resize;
}
</style>