// import * as ROSLIB from 'roslib'
import { RosConnection } from 'src/bridge/connection';
import { Configuration } from 'src/bridge/connection/types';
import * as ROSCON from 'src/bridge';
import * as ROS from 'src/ros/rosNode'

const simulateNodes = false;

interface RosInfoRequest {
  ns?: string
  node?: string
  topic?: string
}

interface RosInfoResponse {
  message: string
  results: { name: string, types: string[] }[]
  nodes: { name: string, ns: string }[]
  error_flag: number
}

interface JsonSrvRequest {
  type?: string
  topic?: string
  data?: string
}

interface JsonSrvResponse {
  data: string
  error_flag: number
}


export enum RosInfoTopics {
  GET_TOPIC_NAMES_AND_TYPES = '/system_info/ros/get_all_topic_names_and_types',
  GET_NODE_NAMES_AND_NAMESPACES = '/system_info/ros/get_all_node_names_and_namespaces',
  GET_PUBLISHER_NAMES_AND_TYPES_BY_NODE = '/system_info/ros/get_publisher_names_and_types_by_node_name',
  GET_SUBSCRIBER_NAMES_AND_TYPES_BY_NODE = '/system_info/ros/get_subscriber_names_and_types_by_node_name',
  GET_CLIENT_NAMES_AND_TYPES_BY_NODE = '/system_info/ros/get_client_names_and_types_by_node_name',
  GET_SERVICE_NAMES_AND_TYPES_BY_NODE = '/system_info/ros/get_service_names_and_types_by_node_name',
}
export enum RosInfoTypes {
  ROS_INFO = 'system_info_msgs/RosInfo',
}

export enum JsonBridgeTopics {
  GET_TOPIC_TYPE_INFO = '/bridge/json/msgTypeDescription'
}

export enum JsonBridgeTypes {
  JSON_SRV = 'message_bridge_msgs/JsonSrv'
}

export class RosSystemInfo {
  configuration: Configuration
  rosConnection: RosConnection
  services: Map<string, ROSCON.Service<RosInfoRequest, RosInfoResponse>>
  jsonBridgeService: ROSCON.Service<JsonSrvRequest, JsonSrvResponse>

  constructor(configuration: Configuration) {
    this.configuration = configuration
    const that = this
    this.rosConnection = new RosConnection(this.configuration)

    this.services = new Map()
    for (const topic in RosInfoTopics) {
      console.log('Creating service for topic: ' + topic, RosInfoTopics[topic])
      const service = this.rosConnection.Service({
        name: RosInfoTopics[topic],
        type: RosInfoTypes.ROS_INFO
      })
      this.services.set(topic, service)
      this.services.set(RosInfoTopics[topic], service)
    }

    this.jsonBridgeService = this.rosConnection.Service({name: JsonBridgeTopics.GET_TOPIC_TYPE_INFO, type: JsonBridgeTypes.JSON_SRV})
  }

  getService(name: string, connection: RosConnection | undefined = undefined): ROSCON.Service<RosInfoRequest, RosInfoResponse> | undefined {
    connection = connection || this.rosConnection
    return this.services.get(name)
  }

  // getTopicNamesAndTypes(): Promise<ROS.Topic[]> {
  //   const emptyRequest = {}

  //   const service = this.getService(RosInfoTopics.GET_TOPIC_NAMES_AND_TYPES)
  //   if (!service) return Promise.reject('Service not found: ' + RosInfoTopics.GET_TOPIC_NAMES_AND_TYPES)

  //   return service.call(emptyRequest).then((result) => {
  //     const topics: ROS.Topic[] = []
  //     result.results.forEach((topic) => {
  //       topics.push(new ROS.Topic(topic.name, topic.types[0]))
  //     })
  //     return topics
  //   })
  // }

  getNodeNamesAndNamespaces(connection: RosConnection | undefined = undefined): Promise<ROS.Node[]> {
    const emptyRequest = {}

    const service = this.getService(RosInfoTopics.GET_NODE_NAMES_AND_NAMESPACES, connection)
    if (!service) return Promise.reject('Service not found: ' + RosInfoTopics.GET_NODE_NAMES_AND_NAMESPACES)

    return service.call(emptyRequest).then((result) => {
      return result.nodes.map((node) => {
        return new ROS.Node({
          name: node.name,
          namespace: node.ns
        })
      })
    })
  }

  getPublisherNamesAndTypesByNode(node: ROS.Node, connection: RosConnection | undefined = undefined): Promise<ROS.Topic[]> {
    const nodeRequest = {
      node: node.name,
      ns: node.namespace,
    }

    const service = this.getService(RosInfoTopics.GET_PUBLISHER_NAMES_AND_TYPES_BY_NODE, connection)
    if (!service) return Promise.reject('Service not found: ' + RosInfoTopics.GET_PUBLISHER_NAMES_AND_TYPES_BY_NODE)

    return service.call(nodeRequest).then((result) => {
      return result.results.map((topic) => {
        return new ROS.Topic(topic.name, "Publishers", topic.types[0])
      })
    })
  }

  getSubscriberNamesAndTypesByNode(node: ROS.Node, connection: RosConnection | undefined = undefined): Promise<ROS.Topic[]> {
    const nodeRequest = {
      node: node.name,
      ns: node.namespace,
    }

    const service = this.getService(RosInfoTopics.GET_SUBSCRIBER_NAMES_AND_TYPES_BY_NODE, connection)
    if (!service) return Promise.reject('Service not found: ' + RosInfoTopics.GET_SUBSCRIBER_NAMES_AND_TYPES_BY_NODE)

    return service.call(nodeRequest).then((result) => {
      return result.results.map((topic) => {
        return new ROS.Topic(topic.name, "Subscribers", topic.types[0])
      })
    })
  }

  getClientNamesAndTypesByNode(node: ROS.Node, connection: RosConnection | undefined = undefined): Promise<ROS.Topic[]> {
    const nodeRequest = {
      node: node.name,
      ns: node.namespace,
    }

    const service = this.getService(RosInfoTopics.GET_CLIENT_NAMES_AND_TYPES_BY_NODE, connection)
    if (!service) return Promise.reject('Service not found: ' + RosInfoTopics.GET_CLIENT_NAMES_AND_TYPES_BY_NODE)

    return service.call(nodeRequest).then((result) => {
      return result.results.map((topic) => {
        return new ROS.Topic(topic.name, "Clients", topic.types[0])
      })
    })
  }

  getServiceNamesAndTypesByNode(node: ROS.Node, connection: RosConnection | undefined = undefined): Promise<ROS.Topic[]> {
    const nodeRequest = {
      node: node.name,
      ns: node.namespace,
    }

    const service = this.getService(RosInfoTopics.GET_SERVICE_NAMES_AND_TYPES_BY_NODE, connection)
    if (!service) return Promise.reject('Service not found: ' + RosInfoTopics.GET_SERVICE_NAMES_AND_TYPES_BY_NODE)

    return service.call(nodeRequest).then((result) => {
      return result.results.map((topic) => {
        return new ROS.Topic(topic.name, "Services", topic.types[0])
      })
    })
  }

  getTopicTypeInfo(topic: ROS.Topic, connection: RosConnection | undefined = undefined): Promise<ROS.MessageType> {

    const request = {
      type: topic.messageType.name
    }

    const service = this.jsonBridgeService

    if (!service) return Promise.reject('Service not found: ' + JsonBridgeTopics.GET_TOPIC_TYPE_INFO)

    return service.call(request).then((result) => {
      // console.log('Topic type info result: ', topic.messageType.name, result)
      const data = JSON.parse(result.data)
      const type = data.type
      const definition = data.description
      
      return new ROS.MessageType(type, definition)
    })
  }

  retrieveNodeInfos(node: ROS.Node): Promise<ROS.Node> {
    const nodeConnection = this.rosConnection
    return new Promise((resolve, reject) => {
      const promises = [
        this.getPublisherNamesAndTypesByNode(node, nodeConnection),
        this.getSubscriberNamesAndTypesByNode(node, nodeConnection),
        this.getClientNamesAndTypesByNode(node, nodeConnection),
        this.getServiceNamesAndTypesByNode(node, nodeConnection)
      ]

      Promise.all(promises)
        .then((results) => {
          results.forEach((result) => {
            for (const topic of result) {
              node.addTopic(topic)
            }
          })
          resolve(node)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  
}

// // Connecting to ROS
// // -----------------

// const enum // Calling a service
// // -----------------

// /**
//  * Service names of the system_info/ros_info node to get meta information of the current ROS system.
//  */
// var get_topic_names = new ROSLIB.Service({
//   ros: ros,
//   name: '/system_info/ros/get_topic_names_and_types',
//   serviceType: 'system_info_msgs/RosInfo'
// })

// var get_node_names = new ROSLIB.Service({
//   ros: ros,
//   name: '/system_info/ros/get_node_names_and_namespaces',
//   serviceType: 'system_info_msgs/RosInfo'
// })

// var get_pubs_from_node = new ROSLIB.Service({
//   ros: ros,
//   name: '/system_info/ros/get_publisher_names_and_types_by_node',
//   serviceType: 'system_info_msgs/RosInfo'
// })

// var get_subs_from_node = new ROSLIB.Service({
//   ros: ros,
//   name: '/system_info/ros/get_subscriber_names_and_types_by_node',
//   serviceType: 'system_info_msgs/RosInfo'
// })

// var get_clients_from_node = new ROSLIB.Service({
//   ros: ros,
//   name: '/system_info/ros/get_client_names_and_types_by_node',
//   serviceType: 'system_info_msgs/RosInfo'
// })

// var get_services_from_node = new ROSLIB.Service({
//   ros: ros,
//   name: '/system_info/ros/get_service_names_and_types_by_node',
//   serviceType: 'system_info_msgs/RosInfo'
// })

// /**
//  * Request data
//  */
// var empty_request = new ROSLIB.ServiceRequest({})

// // For requesting data from a specific node, e.g. the reSpeaker node
// var node_request = new ROSLIB.ServiceRequest({
//   node: 'reSpeaker_node'
// })

// /**
//  * Execute service calls
//  */
// get_topic_names.callService(empty_request, function (result) {
//   console.log('Result for service call on ' + get_topic_names.name)
//   console.log(result)
// })

// get_node_names.callService(empty_request, function (result) {
//   console.log('Result for service call on ' + get_node_names.name)
//   console.log(result)
// })

// get_pubs_from_node.callService(node_request, function (result) {
//   console.log('Result for service call on ' + get_pubs_from_node.name)
//   console.log(result)
// })

// get_subs_from_node.callService(node_request, function (result) {
//   console.log('Result for service call on ' + get_subs_from_node.name)
//   console.log(result)
// })

// get_clients_from_node.callService(node_request, function (result) {
//   console.log('Result for service call on ' + get_clients_from_node.name)
//   console.log(result)
// })

// get_services_from_node.callService(node_request, function (result) {
//   console.log('Result for service call on ' + get_services_from_node.name)
//   console.log(result)
// })
