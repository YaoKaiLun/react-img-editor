import Konva from 'konva'
import { PluginProps } from '../type'

let lastCircle: any = null
let isPaint = false
let startPoint = [0, 0]
const defalutParamValue = {
  strokeWidth: 2,
  color: '#df4b26',
}

export default {
  name: 'circle',
  iconfont: 'iconfont icon-circle',
  params: ['strokeWidth', 'lineType', 'color'],
  onDrawStart: ({stage, layer, paramValue}) => {
    isPaint = true

    const pos = stage.getPointerPosition()
    startPoint = [pos.x, pos.y]
    lastCircle = new Konva.Circle({
      stroke: (paramValue && paramValue.color) ? paramValue.color : defalutParamValue.color,
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : defalutParamValue.strokeWidth,
      globalCompositeOperation: 'source-over',
      x: pos.x,
      y: pos.y,
      radius: 0,
      dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
      dash: [8],
    })
    layer.add(lastCircle)
  },

  onDraw: ({stage, layer}) => {
    if (!isPaint) return

    const pos = stage.getPointerPosition()
    const radius = Math.sqrt(Math.pow(pos.x - startPoint[0], 2) + Math.pow(pos.y - startPoint[1], 2))
    lastCircle.width(radius * 2)
    lastCircle.height(radius * 2)
    layer.batchDraw()
  },

  onDrawEnd: ({historyStack}) => {
    isPaint = false
    historyStack.push(lastCircle)
  },
}  as PluginProps