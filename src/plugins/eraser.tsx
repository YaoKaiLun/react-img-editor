import { PluginProps, PluginParamValue } from '../type'

let lastLine: any = null
let isPaint = false
const defalutParamValue = {
  strokeWidth: 2,
}

export default {
  name: 'eraser',
  iconfont: 'iconfont icon-eraser',
  params: ['strokeWidth'],
  onDrawStart: (e: Event, Konva: any, stage: any, layer: any, paramValue: PluginParamValue) => {
    isPaint = true

    const pos = stage.getPointerPosition()
    lastLine = new Konva.Line({
      stroke: '#df4b26',
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : defalutParamValue.strokeWidth,
      globalCompositeOperation: 'destination-out',
      points: [pos.x, pos.y],
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