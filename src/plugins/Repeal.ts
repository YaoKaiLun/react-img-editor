import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventParams } from '../common/type'

export default class Repeal extends Plugin {
  name = 'repeal'
  iconfont = 'iconfont icon-repeal'
  title = '撤销'
  disappearImmediately = true

  onEnter = (drawEventParams: DrawEventParams) => {
    const {drawLayer, historyStack, plugins, pubSub} = drawEventParams
    drawLayer.removeChildren()

    historyStack.pop()
    pubSub.pub('POP_HISTORY', historyStack)

    historyStack.forEach((node, index) => {
      let flag = false
      for (let i = index + 1; i < historyStack.length; i++) {
        if(historyStack[i].attrs.id === node.attrs.id) {
          flag = true
          break
        }
      }
      if (!flag) {
        const recreatedNode = Konva.Node.create(node)
        drawLayer.add(recreatedNode)
        setTimeout(() => {
          for (let i = 0; i < plugins.length; i++) {
            if (plugins[i].shapeName && plugins[i].shapeName === recreatedNode.name()) {
              plugins[i].onNodeRecreate && plugins[i].onNodeRecreate!(drawEventParams, recreatedNode)
              break
            }
          }
        })
      }
    })

    drawLayer.draw()
  }
}