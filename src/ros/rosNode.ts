import createGraph, { type Graph } from 'ngraph.graph'

export class MessageType {
  name: string
  definition: string | undefined

  constructor(name: string, definition?: string) {
    this.name = name
    this.definition = definition
  }

  toString() {
    return this.name
  }
}

const topicTypes = ['Publishers', 'Subscribers', 'Services', 'Clients', 'Subgroup-Header', 'Group-Header', 'Header'] as const
export type TopicType = typeof topicTypes[number]

export class Topic {
  node: Node | undefined
  name: string
  type: TopicType
  messageType: MessageType

  constructor(name: string, type: TopicType, messageType: string) {
    this.name = name
    this.type = type
    this.messageType = new MessageType(messageType)
  }

  toString() {
    return this.name + ' (' + this.messageType + ')'
  }
}

export class TopicSubGroup {
  prefix: string
  _visible: boolean | null = null
  topics: Topic[]

  constructor(prefix: string, topics: Topic[]) {
    this.prefix = prefix
    this.topics = topics
  }

  get visible() {
    if (this._visible == null) {
      // return this.topics.length <= 5
      return true;
    }
    return this._visible
  }

  set visible(visible: boolean) {
    this._visible = visible
  }

  static fromTopics(topics: Topic[], minLeafNumber: number) {
    const prefixMapper = new TopicPrefixMapper(topics)


    const prefixes = Array.from(prefixMapper.prefixMap.keys()).sort((a, b) => b.length - a.length)

    // console.log("PRE", prefixes)
    let i = 0;
    while (i < prefixes.length) {
      const prefix = prefixes[i++]
      const topics = prefixMapper.prefixMap.get(prefix) || []
      if (topics.length < minLeafNumber) {
        const splits = prefix.split('/')
        if (splits.length <= 1) {
          continue
        }
        const parentPrefix = splits.slice(0, splits.length - 1).join('/')
        if (!prefixMapper.prefixMap.has(parentPrefix)) {
          prefixMapper.prefixMap.set(parentPrefix, [])
        }
        prefixMapper.prefixMap.get(parentPrefix)?.push(...topics)
        prefixMapper.prefixMap.delete(prefix)
        prefixes.push(parentPrefix)
      }
    }
    const subGroups = Array.from(prefixMapper.prefixMap.entries()).map(([prefix, topics]) => new TopicSubGroup(prefix, topics))
    return subGroups
  }

}

export class TopicPrefixMapper {
  topics: Topic[]
  topicMap: Map<string, Topic>
  prefixMap: Map<string, Topic[]>

  constructor(topics: Topic[]) {
    this.topics = []
    this.topicMap = new Map()

    this.prefixMap = new Map()

    topics.forEach(topic => this.addTopic(topic))
    // topics.forEach(topic => this.topicMap.set(topic.name, topic))
  }

  addTopic(topic: Topic) {
    this.topics.push(topic)
    this.topicMap.set(topic.name, topic)

    const parts = topic.name.split('/')
    if (parts.length > 1) {
      const prefix = parts.slice(0, parts.length - 1).join('/')
      if (!this.prefixMap.has(prefix)) {
        this.prefixMap.set(prefix, [])
      }
      this.prefixMap.get(prefix)?.push(topic)
    } else {
      if (!this.prefixMap.has('')) {
        this.prefixMap.set('', [])
      }
      this.prefixMap.get('')?.push(topic)
    }
  }
}

export class TopicGroup {
  groupName: TopicType
  topics: Topic[] = []
  topicMap: Map<string, Topic> = new Map()
  subGroups: Map<string, TopicSubGroup> = new Map()
  visible: boolean = true

  constructor(groupName: TopicType, topics: Topic[]) {
    this.groupName = groupName
    // TODO: improve unnecessary recalculations
    topics.forEach(topic => this.addTopic(topic))
  }

  addTopic(topic: Topic) {
    this.topics.push(topic)
    this.topicMap.set(topic.name, topic)
    const subGroups = TopicSubGroup.fromTopics(this.topics, 3)
    this.subGroups.clear()
    subGroups.forEach(subGroup => {
      if (!this.subGroups.has(subGroup.prefix)) {
        this.subGroups.set(subGroup.prefix, subGroup)
      } else {
        this.subGroups.get(subGroup.prefix)!.topics = subGroup.topics
      }
    })
  }

  getSubGroups() {
    return TopicSubGroup.fromTopics(this.topics, 3)
  }

}

export type nodeType = "predecessor" | "successor" | "central" | "none"

export class Node {
  name: string
  namespace: string

  topics: Topic[] = []
  topicsMap: Map<string, Topic[]> = new Map()
  topicGroups: Map<TopicType, TopicGroup> = new Map()

  constructor({
    name,
    namespace,
    topics = [],
  }: {
    name: string,
    namespace: string,
    topics?: Topic[],
  }) {
    this.name = name
    this.namespace = namespace

    topicTypes.forEach(topicType => {
      this.topicGroups.set(topicType, new TopicGroup(topicType, []))
    })

    topics.forEach(topic => this.addTopic(topic))
  }

  get key(): string {
    // return this._name;
    // return this.namespace + "/" + this.name;
    return this.namespace != "/" ? (this.namespace + "/" + this.name) : this.name;
  }

  addTopic(topic: Topic) {
    topic.node = this
    this.topics.push(topic)
    if (!this.topicsMap.has(topic.type)) {
      this.topicsMap.set(topic.type, [])
    }
    this.topicsMap.get(topic.type)?.push(topic)

    this.topicGroups.get(topic.type)?.addTopic(topic)
  }

  get isHidden() {
    return this.name.startsWith('_')
  }

  toString() {
    const sParts = [""]
    return this.name + ' (' + this.namespace + ')' + sParts.join('\n')
  }
}


export function getSimulatedNodes(data: {
  version: string,
  name: string,
  description: string,
  created_at: string,
  node_count: number,
  nodes: {
    name: string,
    namespace: string,
    localhost_only: boolean,
    publishers: {
      name: string,
      type: string
    }[],
    subscribers: {
      name: string,
      type: string
    }[],
    services: {
      name: string,
      type: string
    }[],
    clients: {
      name: string,
      type: string
    }[]
  }[]
} | undefined = undefined): Node[] {

  if (data) {
    return data.nodes.map(node => {

      let topics: Topic[] = []
      node.publishers.forEach(publisher => {
        topics.push(new Topic(publisher.name, 'Publishers', publisher.type))
      })
      node.subscribers.forEach(subscriber => {
        topics.push(new Topic(subscriber.name, 'Subscribers', subscriber.type))
      })
      node.services.forEach(service => {
        topics.push(new Topic(service.name, 'Services', service.type))
      })
      node.clients.forEach(client => {
        topics.push(new Topic(client.name, 'Clients', client.type))
      })

      return new Node({
        name: node.name,
        namespace: node.namespace,
        topics: topics,
      })
    })
  }

  const simNodes = [
    new Node({
      name: 'reSpeaker_node',
      namespace: '/',
      topics: [
        new Topic(
          '/parameter_events',
          "Publishers",
          'rcl_interfaces/msg/ParameterEvent',
        ),
        new Topic(
          '/rosout',
          "Publishers",
          'rcl_interfaces/msg/Log',
        ),

        new Topic(
          "/respeaker/audio",
          'Publishers',
          "rosass_msgs/msg/AudioBuffer"
        ),
        new Topic(
          "/respeaker/direction",
          'Publishers',
          "std_msgs/msg/Int16"
        ),
        new Topic(
          "/respeaker/direction_continuous",
          'Publishers',
          "std_msgs/msg/Int16"
        ),
        new Topic(
          "/respeaker/direction_raw",
          'Publishers',
          "std_msgs/msg/Int16"
        ),
        new Topic(
          "/respeaker/is_speeching",
          'Publishers',
          "rosass_msgs/msg/AudioMarker"
        ),
        new Topic(
          "/respeaker/is_speeching_raw",
          'Publishers',
          "rosass_msgs/msg/AudioMarker"
        ),
        new Topic(
          "/respeaker/speech_audio",
          'Publishers',
          "rosass_msgs/msg/AudioBuffer"
        ),
        new Topic(
          "/respeaker/speech_audio_stream",
          'Publishers',
          "rosass_msgs/msg/AudioBuffer"
        ),
        new Topic(
          "/respeaker/speech_audio_stream_finish",
          'Publishers',
          "std_msgs/msg/Bool"
        ),

        new Topic(
          "/parameter_events",
          'Subscribers',
          "rcl_interfaces/msg/ParameterEvent"
        ),

        new Topic(
          "/reSpeaker_node/describe_parameters",
          'Services',
          "rcl_interfaces/srv/DescribeParameters"
        ),
        new Topic(
          "/reSpeaker_node/get_parameter_types",
          'Services',
          "rcl_interfaces/srv/GetParameterTypes"
        ),
        new Topic(
          "/reSpeaker_node/get_parameters",
          'Services',
          "rcl_interfaces/srv/GetParameters"
        ),
        new Topic(
          "/reSpeaker_node/list_parameters",
          'Services',
          "rcl_interfaces/srv/ListParameters"
        ),
        new Topic(
          "/reSpeaker_node/set_parameters",
          'Services',
          "rcl_interfaces/srv/SetParameters"
        ),
        new Topic(
          "/reSpeaker_node/set_parameters_atomically",
          'Services',
          "rcl_interfaces/srv/SetParametersAtomically"
        ),


      ]
    }),
    new Node({
      name: 'doa_listener',
      namespace: '/',
      topics: [
        new Topic('/parameter_events', "Publishers", 'rcl_interfaces/msg/ParameterEvent',),
        new Topic('/rosout', "Publishers", 'rcl_interfaces/msg/Log',),

        new Topic("/parameter_events", 'Subscribers', "rcl_interfaces/msg/ParameterEvent"),
        new Topic("/respeaker/direction", 'Subscribers', "std_msgs/msg/Int16"),
        new Topic("/respeaker/direction_raw", 'Subscribers', "std_msgs/msg/Int16"),

        new Topic("/listener/describe_parameters", 'Services', "rcl_interfaces/srv/DescribeParameters"),
        new Topic("/listener/get_parameter_types", 'Services', "rcl_interfaces/srv/GetParameterTypes"),
        new Topic("/listener/get_parameters", 'Services', "rcl_interfaces/srv/GetParameters"),
        new Topic("/listener/list_parameters", 'Services', "rcl_interfaces/srv/ListParameters"),
        new Topic("/listener/set_parameters", 'Services', "rcl_interfaces/srv/SetParameters"),
        new Topic("/listener/set_parameters_atomically", 'Services', "rcl_interfaces/srv/SetParametersAtomically"),
      ]
    }),
    new Node({
      name: 'wav_writer',
      namespace: '/',
      topics: [
        new Topic('/parameter_events', "Publishers", 'rcl_interfaces/msg/ParameterEvent',),
        new Topic('/rosout', "Publishers", 'rcl_interfaces/msg/Log',),
        new Topic("/parameter_events", 'Subscribers', "rcl_interfaces/msg/ParameterEvent"),

        new Topic("/respeaker/is_speeching", 'Subscribers', "rosass_msgs/msg/AudioMarker"),
        new Topic("/respeaker/speech_audio", 'Subscribers', "rosass_msgs/msg/AudioBuffer"),

        new Topic("/wav_writer/describe_parameters", 'Services', "rcl_interfaces/srv/DescribeParameters"),
        new Topic("/wav_writer/get_parameter_types", 'Services', "rcl_interfaces/srv/GetParameterTypes"),
        new Topic("/wav_writer/get_parameters", 'Services', "rcl_interfaces/srv/GetParameters"),
        new Topic("/wav_writer/list_parameters", 'Services', "rcl_interfaces/srv/ListParameters"),
        new Topic("/wav_writer/set_parameters", 'Services', "rcl_interfaces/srv/SetParameters"),
        new Topic("/wav_writer/set_parameters_atomically", 'Services', "rcl_interfaces/srv/SetParametersAtomically"),
      ]
    }),

    new Node({
      name: 'i2c_bridge_node',
      namespace: '/',
      topics: [
        new Topic('/parameter_events', "Publishers", 'rcl_interfaces/msg/ParameterEvent',),
        new Topic('/rosout', "Publishers", 'rcl_interfaces/msg/Log',),
        new Topic("/parameter_events", 'Subscribers', "rcl_interfaces/msg/ParameterEvent"),


        new Topic("/resources/manager/newResourcesAvailable", "Subscribers", ""),
        new Topic("/system/i2c/write16", "Subscribers", ""),
        new Topic("/system/i2c/write8", "Subscribers", ""),
        new Topic("/system/i2c/writeArray", "Subscribers", ""),


        new Topic("/i2c_bridge_node/describe_parameters", 'Services', "rcl_interfaces/srv/DescribeParameters"),
        new Topic("/i2c_bridge_node/get_parameter_types", 'Services', "rcl_interfaces/srv/GetParameterTypes"),
        new Topic("/i2c_bridge_node/get_parameters", 'Services', "rcl_interfaces/srv/GetParameters"),
        new Topic("/i2c_bridge_node/list_parameters", 'Services', "rcl_interfaces/srv/ListParameters"),
        new Topic("/i2c_bridge_node/set_parameters", 'Services', "rcl_interfaces/srv/SetParameters"),
        new Topic("/i2c_bridge_node/set_parameters_atomically", 'Services', "rcl_interfaces/srv/SetParametersAtomically"),
      ]
    }),

    new Node({
      name: 'display_eye_left',
      namespace: '/',
      topics: [
        new Topic('/parameter_events', "Publishers", 'rcl_interfaces/msg/ParameterEvent',),
        new Topic('/rosout', "Publishers", 'rcl_interfaces/msg/Log',),
        new Topic("/parameter_events", 'Subscribers', "rcl_interfaces/msg/ParameterEvent"),

        new Topic("/system/i2c/writeArray", "Publishers", ""),

        new Topic("/eye/left/animatedText", "Subscribers", ""),
        new Topic("/eye/left/clear", "Subscribers", ""),
        new Topic("/eye/left/equalizer/setup", "Subscribers", ""),
        new Topic("/eye/left/equalizer/value", "Subscribers", ""),
        new Topic("/eye/left/polygon/set/animationDuration", "Subscribers", ""),
        new Topic("/eye/left/polygon/set/compound", "Subscribers", ""),
        new Topic("/eye/left/polygon/set/count", "Subscribers", ""),
        new Topic("/eye/left/polygon/set/polygon", "Subscribers", ""),
        new Topic("/eye/left/polygon/set/style", "Subscribers", ""),
        new Topic("/eye/left/polygon/set/viewDirection", "Subscribers", ""),
        new Topic("/eye/left/text", "Subscribers", ""),
        new Topic("/resources/manager/newResourcesAvailable", "Subscribers", ""),

        new Topic("/display_eye_left/describe_parameters", 'Services', "rcl_interfaces/srv/DescribeParameters"),
        new Topic("/display_eye_left/get_parameter_types", 'Services', "rcl_interfaces/srv/GetParameterTypes"),
        new Topic("/display_eye_left/get_parameters", 'Services', "rcl_interfaces/srv/GetParameters"),
        new Topic("/display_eye_left/list_parameters", 'Services', "rcl_interfaces/srv/ListParameters"),
        new Topic("/display_eye_left/set_parameters", 'Services', "rcl_interfaces/srv/SetParameters"),
        new Topic("/display_eye_left/set_parameters_atomically", 'Services', "rcl_interfaces/srv/SetParametersAtomically"),

        new Topic("/resources/manager/acquire", "Clients", ""),
        new Topic("/resources/manager/create", "Clients", ""),
        new Topic("/resources/manager/delete", "Clients", ""),
        new Topic("/resources/manager/giveaway", "Clients", ""),
        new Topic("/resources/manager/ownerList", "Clients", ""),
        new Topic("/resources/manager/release", "Clients", ""),
        new Topic("/resources/manager/resourceList", "Clients", ""),
      ]
    }),
    new Node({
      name: 'display_eye_right',
      namespace: '/',
      topics: [
        new Topic('/parameter_events', "Publishers", 'rcl_interfaces/msg/ParameterEvent',),
        new Topic('/rosout', "Publishers", 'rcl_interfaces/msg/Log',),
        new Topic("/parameter_events", 'Subscribers', "rcl_interfaces/msg/ParameterEvent"),

        new Topic("/system/i2c/writeArray", "Publishers", ""),

        new Topic("/eye/right/animatedText", "Subscribers", ""),
        new Topic("/eye/right/clear", "Subscribers", ""),
        new Topic("/eye/right/equalizer/setup", "Subscribers", ""),
        new Topic("/eye/right/equalizer/value", "Subscribers", ""),
        new Topic("/eye/right/polygon/set/animationDuration", "Subscribers", ""),
        new Topic("/eye/right/polygon/set/compound", "Subscribers", ""),
        new Topic("/eye/right/polygon/set/count", "Subscribers", ""),
        new Topic("/eye/right/polygon/set/polygon", "Subscribers", ""),
        new Topic("/eye/right/polygon/set/style", "Subscribers", ""),
        new Topic("/eye/right/polygon/set/viewDirection", "Subscribers", ""),
        new Topic("/eye/right/text", "Subscribers", ""),
        new Topic("/resources/manager/newResourcesAvailable", "Subscribers", ""),

        new Topic("/display_eye_right/describe_parameters", 'Services', "rcl_interfaces/srv/DescribeParameters"),
        new Topic("/display_eye_right/get_parameter_types", 'Services', "rcl_interfaces/srv/GetParameterTypes"),
        new Topic("/display_eye_right/get_parameters", 'Services', "rcl_interfaces/srv/GetParameters"),
        new Topic("/display_eye_right/list_parameters", 'Services', "rcl_interfaces/srv/ListParameters"),
        new Topic("/display_eye_right/set_parameters", 'Services', "rcl_interfaces/srv/SetParameters"),
        new Topic("/display_eye_right/set_parameters_atomically", 'Services', "rcl_interfaces/srv/SetParametersAtomically"),

        new Topic("/resources/manager/acquire", "Clients", ""),
        new Topic("/resources/manager/create", "Clients", ""),
        new Topic("/resources/manager/delete", "Clients", ""),
        new Topic("/resources/manager/giveaway", "Clients", ""),
        new Topic("/resources/manager/ownerList", "Clients", ""),
        new Topic("/resources/manager/release", "Clients", ""),
        new Topic("/resources/manager/resourceList", "Clients", ""),
      ]
    }),
    new Node({
      name: 'display_mouth',
      namespace: '/',
      topics: [
        new Topic('/parameter_events', "Publishers", 'rcl_interfaces/msg/ParameterEvent',),
        new Topic('/rosout', "Publishers", 'rcl_interfaces/msg/Log',),
        new Topic("/parameter_events", 'Subscribers', "rcl_interfaces/msg/ParameterEvent"),

        new Topic("/system/i2c/writeArray", "Publishers", ""),
        // new Topic("/system/i2c/writeArray/1", "Publishers", ""),
        // new Topic("/system/i2c/writeArray/2", "Publishers", ""),
        // new Topic("/system/i2c/writeArray/3", "Publishers", ""),
        // new Topic("/system/i2c/writeArray/4", "Publishers", ""),

        new Topic("/mouth/animatedText", "Subscribers", ""),
        new Topic("/mouth/clear", "Subscribers", ""),
        new Topic("/mouth/equalizer/setup", "Subscribers", ""),
        new Topic("/mouth/equalizer/value", "Subscribers", ""),
        new Topic("/mouth/polygon/set/animationDuration", "Subscribers", ""),
        new Topic("/mouth/polygon/set/compound", "Subscribers", ""),
        new Topic("/mouth/polygon/set/count", "Subscribers", ""),
        new Topic("/mouth/polygon/set/polygon", "Subscribers", ""),
        new Topic("/mouth/polygon/set/style", "Subscribers", ""),
        new Topic("/mouth/polygon/set/viewDirection", "Subscribers", ""),
        new Topic("/mouth/text", "Subscribers", ""),
        new Topic("/resources/manager/newResourcesAvailable", "Subscribers", ""),

        new Topic("/display_mouth/describe_parameters", 'Services', "rcl_interfaces/srv/DescribeParameters"),
        new Topic("/display_mouth/get_parameter_types", 'Services', "rcl_interfaces/srv/GetParameterTypes"),
        new Topic("/display_mouth/get_parameters", 'Services', "rcl_interfaces/srv/GetParameters"),
        new Topic("/display_mouth/list_parameters", 'Services', "rcl_interfaces/srv/ListParameters"),
        new Topic("/display_mouth/set_parameters", 'Services', "rcl_interfaces/srv/SetParameters"),
        new Topic("/display_mouth/set_parameters_atomically", 'Services', "rcl_interfaces/srv/SetParametersAtomically"),

        new Topic("/resources/manager/acquire", "Clients", ""),
        new Topic("/resources/manager/create", "Clients", ""),
        new Topic("/resources/manager/delete", "Clients", ""),
        new Topic("/resources/manager/giveaway", "Clients", ""),
        new Topic("/resources/manager/ownerList", "Clients", ""),
        new Topic("/resources/manager/release", "Clients", ""),
        new Topic("/resources/manager/resourceList", "Clients", ""),
      ]
    }),

    new Node({
      name: 'resource_manager_master',
      namespace: '/',
      topics: [
        new Topic('/parameter_events', "Publishers", 'rcl_interfaces/msg/ParameterEvent',),
        new Topic('/rosout', "Publishers", 'rcl_interfaces/msg/Log',),
        new Topic("/parameter_events", 'Subscribers', "rcl_interfaces/msg/ParameterEvent"),

        new Topic('/resources/manager/newResourcesAvailable', "Publishers", 'Empty',),

        new Topic("/resource_manager_master/describe_parameters", 'Services', "rcl_interfaces/srv/DescribeParameters"),
        new Topic("/resource_manager_master/get_parameter_types", 'Services', "rcl_interfaces/srv/GetParameterTypes"),
        new Topic("/resource_manager_master/get_parameters", 'Services', "rcl_interfaces/srv/GetParameters"),
        new Topic("/resource_manager_master/list_parameters", 'Services', "rcl_interfaces/srv/ListParameters"),
        new Topic("/resource_manager_master/set_parameters", 'Services', "rcl_interfaces/srv/SetParameters"),
        new Topic("/resource_manager_master/set_parameters_atomically", 'Services', "rcl_interfaces/srv/SetParametersAtomically"),

        new Topic("/resources/manager/acquire", "Services", ""),
        new Topic("/resources/manager/create", "Services", ""),
        new Topic("/resources/manager/delete", "Services", ""),
        new Topic("/resources/manager/giveaway", "Services", ""),
        new Topic("/resources/manager/ownerList", "Services", ""),
        new Topic("/resources/manager/release", "Services", ""),
        new Topic("/resources/manager/resourceList", "Services", ""),
      ]
    }),


  ]

  return simNodes
}