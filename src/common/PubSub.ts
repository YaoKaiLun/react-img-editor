import pubSub from 'pubsub-js'

export default class PubSub {
  id: string
  constructor(id: string) {
    this.id = id
  }

  pub = (name: string, param?: any) => {
    pubSub.publish(`${this.id}_${name}`, param)
  }

  sub = (name: string, callback: any) => {
    pubSub.subscribe(`${this.id}_${name}`, callback)
  }
}