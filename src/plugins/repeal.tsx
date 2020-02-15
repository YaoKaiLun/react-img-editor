import Konva from 'konva'
import { PluginProps } from '../type'

export default {
  name: 'repeal',
  iconfont: 'iconfont icon-repeal',
  title: '撤销',
  onEnter: (drawEventPramas) => {
    const {layer, historyStack, plugins} = drawEventPramas
    layer.removeChildren()
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
        layer.add(recreatedNode)
        setTimeout(() => {
          for (let i = 0; i < plugins.length; i++) {
            if (plugins[i].shapeName && plugins[i].shapeName === recreatedNode.name()) {
              plugins[i].onNodeRecreate && plugins[i].onNodeRecreate(drawEventPramas, recreatedNode)
              break
            }
          }
        })
      }
    })
    layer.draw()
  },
}  as PluginProps