import Konva from 'konva'
import { PluginProps } from '../type'

let lastCircle: any = null
let isPaint = false
let startPoint = [0, 0]
const defalutParamValue = {
  strokeWidth: 2,
  lineType: 'solid',
  color: '#F5222D',
}

export default {
  name: 'circle',
  iconfont: 'iconfont icon-circle',
  title: '插入圆圈',
  params: ['strokeWidth', 'lineType', 'color'],
  defalutParamValue,
  shapeName: 'circle',
  onDrawStart: ({stage, layer, paramValue}) => {
    isPaint = true

    const pos = stage.getPointerPosition()
    startPoint = [pos.x, pos.y]
    lastCircle = new Konva.Circle({
      name: 'circle',
      stroke: (paramValue && paramValue.color) ? paramValue.color : defalutParamValue.color,
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : defalutParamValue.strokeWidth,
      globalCompositeOperation: 'source-over',
      radius: 0,
      dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
      dash: [8],
    })
    layer.add(lastCircle)
  },

  onDraw: ({stage, layer}) => {
    if (!isPaint) return

    const pos = stage.getPointerPosition()
    const radius = Math.sqrt(Math.pow(pos.x - startPoint[0], 2) + Math.pow(pos.y - startPoint[1], 2)) / 2
    lastCircle.x((pos.x + startPoint[0]) / 2)
    lastCircle.y((pos.y + startPoint[1]) / 2)
    lastCircle.setAttr('radius', radius)
    layer.batchDraw()
  },

  onDrawEnd: ({historyStack}) => {
    isPaint = false
    historyStack.push(lastCircle)
  },

  onLeave: () => {
    isPaint = false
  },
}  as PluginProps