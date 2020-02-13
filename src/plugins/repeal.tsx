import { PluginProps } from '../type'

export default {
  name: 'repeal',
  iconfont: 'iconfont icon-repeal',
  title: '撤销',
  onEnter: ({layer, historyStack}) => {
    const shape = historyStack.pop()
    if (shape && shape.remove) {
      shape.remove()
      layer.draw()
    }
  },
}  as PluginProps