import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventPramas } from '../common/type'

export default class Repeal extends Plugin {
  name = 'repeal'
  iconfont = 'iconfont icon-repeal'
  title = '撤销'

  onEnter = (drawEventPramas: DrawEventPramas) => {
    const {drawLayer, historyStack, plugins} = drawEventPramas
    drawLayer.removeChildren()
    historyStack.pop()

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
              plugins[i].onNodeRecreate && plugins[i].onNodeRecreate!(drawEventPramas, recreatedNode)
              break
            }
          }
        })
      }
    })

    drawLayer.draw()
  }
}