<template>
  <router-view />
</template>

<script setup lang="ts">

import { RosConnection } from 'src/bridge/connection'

import { RosSystemInfo } from 'src/ros/rosSystemInfo'
import * as ROS from 'src/ros/rosNode'
import { useRosStore } from 'stores/ros'

import jsonNodes8 from 'src/data/rosVizData_8_nodes.json'
import jsonNodes21 from 'src/data/rosVizData_21_nodes.json'
import jsonNodes26 from 'src/data/0026nodes_2023-09-01_12_00_00_roseRobot.json'
import jsonNodesMany from 'src/data/rosVizData_many_nodes.json'
import rosVizData_presentation from 'src/data/rosVizData_presentation.json'
import rosVizData_motors from 'src/data/rosVizData_motors.json'
import rosVizData_selfDrivingGitHub from 'src/data/rosVizData_selfDrivingGitHub.json'

import handcraftetMotorExample from 'src/data/0013nodes_2023-09-01_12_00_00_handcraftetMotorExample.json'
import handcraftedBroadcastExample from 'src/data/handcraftedBroadcastExample.json'




import test from 'src/data/0122nodes_2024-08-06_11-15-18_singulate.json'

import { computed, ref, watch } from 'vue'


const rosStore = useRosStore()

rosStore.visMode = 'Saved data (Table Robot | 8 nodes)'
rosStore.visJsonData = jsonNodes8;

// const rosConnection = new RosConnection({
//   websocketUrl: 'ws://192.168.0.216:9091'
// });


// interface RosInfoRequest {
//   ns?: string
//   node?: string
//   topic?: string
// }

// interface RosInfoResponse {
//   message: string
//   results: {name: string, types: string[]}[]
//   nodes: {name: string, ns: string}[]
//   error_flag: number
// }

// const service = rosConnection.Service<RosInfoRequest, RosInfoResponse>({
//   name: '/system_info/ros/get_all_node_names_and_namespaces',
//   type: 'system_info_msgs/RosInfo'
// })

// console.log("Calling service")
// // service.call({}).then((res) => {
// //   console.log("RosInfo", res)
// // })

// const nodeResolvingPromises = []
// for (let i = 0; i < 20; i++) {
//   console.log("Pushed node promise", i)
//   nodeResolvingPromises.push(service.call({}, 0).then((nodes) => {
//   // nodeResolvingPromises.push(service.call({}, 5000).then((nodes) => {
//     console.log("Resolved node", i)
//   }))
// }

// Promise.all(nodeResolvingPromises).then((nodes) => {
//   console.log("All nodes", nodes)
// })



// const rosInfo = new RosSystemInfo({
//   websocketUrl: 'ws://192.168.0.216:9091'
//   // websocketUrl: 'ws://192.168.0.155:9091'
// });

const rosInfo = ref<RosSystemInfo | null>(null);
// computed(() => {
//   return new RosSystemInfo({
//     websocketUrl: rosStore.wsUrl
//   });
// })

watch([() => rosStore.wsUrl], () => {
  console.log("WS URL CHANGED", rosStore.wsUrl)
  rosInfo.value?.rosConnection.close();
  rosInfo.value = new RosSystemInfo({
    websocketUrl: rosStore.wsUrl
  });
  rosStore.systemInfoConnection = rosInfo.value;
  rosStore.visMode = 'Show live data'
}, { immediate: false })

// rosStore.visMode = 'Saved data (Table Robot | 8 nodes)'

function fetchLiveData(): Promise<ROS.Node[]> {
  return new Promise((resolve, reject) => {

    if (rosStore.visMode === 'Show live data') {
      rosStore.nodesRequested = verboseUpdate ? 0 : null;
      rosStore.nodesResolved = 0;
      if (rosInfo.value == null) {
        reject("No rosInfo")
      }

      rosInfo.value.getNodeNamesAndNamespaces().then((nodes) => {
        console.log("Nodes", nodes)

        const nodeResolvingPromises: Promise<void | ROS.Node>[] = []

        let i = 0;
        for (const node of nodes) {
          if (node.isHidden) {
            continue
          }

          if (verboseUpdate) {
            rosStore.nodesRequested == (rosStore.nodesRequested ?? 0) + 1;
          }

          nodeResolvingPromises.push(rosInfo.value.retrieveNodeInfos(node).then((node) => {
            console.log("Resolved node", node.toString())
            rosStore.nodesResolved++;
          }))

          i++;
        }

        Promise.all(nodeResolvingPromises).then(() => {
          console.log("All nodes resolved")
          // rosStore.nodes = nodes;
          console.log("NODES:", nodes)
          rosStore.nodesRequested = null;
          resolve(nodes);
          // console.log("LOADED JSON", jsonNodes8)
        })

      }).catch((err) => {
        reject("No connection")
      })
    } else {
      reject("Not live data")
    }
  })
}


const timeoutRef = ref<NodeJS.Timeout | null>(null)
let verboseUpdate = false;

watch(() => rosStore.autoUpdates, () => {
  if (!rosStore.autoUpdates) {
    if (timeoutRef.value != null) {
      clearTimeout(timeoutRef.value);
    }
  } else {
    verboseUpdate = true;
    updateLiveData();
  }
})

function updateLiveData() {
  fetchLiveData().then((nodes) => {
    rosStore.nodes = nodes;
    verboseUpdate = false;
    if (rosStore.autoUpdates) {
      timeoutRef.value = setTimeout(updateLiveData, 2000);
    }
  }).catch((err) => {
    console.warn("INITIATE SIMULATED NODES", err)
    if (rosStore.visMode != "Saved data (Table Robot | 8 nodes)") {
      rosStore.visMode = "Saved data (Table Robot | 8 nodes)"
      const simNodes = ROS.getSimulatedNodes(jsonNodes8); // jsonNodes21

      rosStore.nodes = simNodes;
    }
  })
}

watch([() => rosStore.visMode, () => rosStore.update, () => rosInfo], () => {
  console.log("VIS MODE CHANGED", rosStore.visMode)


  if (timeoutRef.value != null) {
    clearTimeout(timeoutRef.value);
  }

  if (rosStore.visMode === 'Show live data') {

    verboseUpdate = true;
    updateLiveData();

  } else if (rosStore.visMode === 'Saved data (Table Robot | 8 nodes)') {
    // rosStore.nodes = ROS.getSimulatedNodes(jsonNodes8);
    rosStore.visJsonData = jsonNodes8;
  } else if (rosStore.visMode === 'Saved data (Table Robot | 21 nodes)') {
    // rosStore.nodes = ROS.getSimulatedNodes(jsonNodes21);
    rosStore.visJsonData = jsonNodes21;
  } else if (rosStore.visMode === 'Saved data (Table Robot | 26 nodes)') {
    // rosStore.nodes = ROS.getSimulatedNodes(jsonNodes26);
    rosStore.visJsonData = jsonNodes26;
  } else if (rosStore.visMode === 'Saved data (Motor Controller | 13 nodes)') {
    // rosStore.nodes = ROS.getSimulatedNodes(jsonNodes21);
    rosStore.visJsonData = handcraftetMotorExample
  } else if (rosStore.visMode === 'Show presentation data') {
    // rosStore.nodes = ROS.getSimulatedNodes(rosVizData_presentation);
    rosStore.visJsonData = rosVizData_presentation;
  }
  // else if (rosStore.visMode === 'Saved data (Table Robot | 26 nodes)') {
  //   // rosStore.nodes = ROS.getSimulatedNodes(jsonNodesMany);
  //   rosStore.visJsonData = jsonNodesMany;
  // }
  else if (rosStore.visMode === 'Example data (Autonomous Driving derived from Autoware | 13 nodes)') {
    // rosStore.nodes = ROS.getSimulatedNodes(rosVizData_motors);
    rosStore.visJsonData = rosVizData_motors;
  } else if (rosStore.visMode === 'Saved data (Self-driving car | 7 nodes)') {
    // rosStore.nodes = ROS.getSimulatedNodes(rosVizData_selfDrivingGitHub);
    rosStore.visJsonData = rosVizData_selfDrivingGitHub;
    console.log("Self-driving car data", rosStore.visJsonData)
  } else if (rosStore.visMode === 'Test') {
    rosStore.visJsonData = test;
  } else if (rosStore.visMode === 'Example data (Broadcast Characteristic | 12 nodes)') {
    // rosStore.nodes = ROS.getSimulatedNodes(jsonNodes21);
    rosStore.visJsonData = handcraftedBroadcastExample;
  }
}, { immediate: true })

watch([() => rosStore.visJsonData, () => rosStore.showLocalHostNodes], () => {
  if (rosStore.visJsonData) {
    rosStore.nodes = ROS.getSimulatedNodes(rosStore.visJsonData, rosStore.showLocalHostNodes);
  }
}, { immediate: true })




</script>
