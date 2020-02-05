import { PluginProps } from '../type'

let repealCount = 0
let timer: any = null

export default {
  name: 'repeal',
  iconfont: 'iconfont icon-repeal',
  title: '撤销',
  onClick: ({layer, historyStack}) => {
    repealCount++

    clearTimeout(timer)
    timer = setTimeout(() => {
      layer.removeChildren()

      for(let i = repealCount; i > 0; i--) {
        if (historyStack.length <= 0) {
          repealCount = 0
          break
        }

        repealCount--
        historyStack.pop()
      }

      historyStack.forEach(history => {
        layer.add(history)
      })
    }, 500)
  },
}  as PluginProps