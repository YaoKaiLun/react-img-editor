import { PluginProps, PluginParamValue } from '../type'

let lastLine: any = null
let isPaint = false
const defalutParamValue = {
  strokeWidth: 2,
  color: '#df4b26',
}

export default {
  name: 'pen',
  iconfont: 'iconfont icon-pen',
  params: ['strokeWidth', 'lineType', 'color'],
  onDrawStart: (e: Event, Konva: any, stage: any, layer: any, paramValue: PluginParamValue) => {
    isPaint = true

    const pos = stage.getPointerPosition()
    lastLine = new Konva.Line({
      stroke: (paramValue && paramValue.color) ? paramValue.color : defalutParamValue.color,
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : defalutParamValue.strokeWidth,
      globalCompositeOperation: 'source-over',
      points: [pos.x, pos.y],
      dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
      dash: [8],
    })
    layer.add(lastLine)
  },

  onDraw: (e: Event, Konva: any, stage: any, layer: any) => {
    if (!isPaint) return

    const pos = stage.getPointerPosition()
    const newPoints = lastLine.points().concat([pos.x, pos.y])
    lastLine.points(newPoints)
    layer.batchDraw()
  },

  onDrawEnd: () => {
    isPaint = false
  },
}  as PluginProps