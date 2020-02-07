import Konva from 'konva'
import { PluginProps } from '../type'

let lastArrow: any = null
let isPaint = false
let startPoints = [0, 0]
const defalutParamValue = {
  strokeWidth: 2,
  lineType: 'solid',
  color: '#F5222D',
}

export default {
  name: 'arrow',
  iconfont: 'iconfont icon-arrow',
  title: '插入箭头',
  params: ['strokeWidth', 'color'],
  defalutParamValue,
  onDrawStart: ({stage, layer, paramValue}) => {
    isPaint = true

    const pos = stage.getPointerPosition()
    startPoints = [pos.x, pos.y]
    const strokeColor = (paramValue && paramValue.color) ? paramValue.color : defalutParamValue.color
    lastArrow = new Konva.Arrow({
      stroke: strokeColor,
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : defalutParamValue.strokeWidth,
      globalCompositeOperation: 'source-over',
      points: startPoints,
      dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
      dash: [8],
      fill: strokeColor,
    })
    layer.add(lastArrow)
  },

  onDraw: ({stage, layer}) => {
    if (!isPaint) return

    const pos = stage.getPointerPosition()
    lastArrow.points([startPoints[0], startPoints[1], pos.x, pos.y])
    layer.batchDraw()
  },

  onDrawEnd: ({historyStack}) => {
    isPaint = false
    historyStack.push(lastArrow)
  },

  onLeave: () => {
    isPaint = false
  },
}  as PluginProps