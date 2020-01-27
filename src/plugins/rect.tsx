
import { PluginProps, PluginParamValue } from '../type'

let lastReact: any = null
let isPaint = false
let startPoint = [0, 0]
const defalutParamValue = {
  strokeWidth: 2,
  color: '#df4b26',
}

export default {
  name: 'rect',
  iconfont: 'iconfont icon-square',
  params: ['strokeWidth', 'lineType', 'color'],
  onDrawStart: (e: Event, Konva: any, stage: any, layer: any, paramValue: PluginParamValue) => {
    isPaint = true

    const pos = stage.getPointerPosition()
    startPoint = [pos.x, pos.y]
    lastReact = new Konva.Rect({
      stroke: (paramValue && paramValue.color) ? paramValue.color : defalutParamValue.color,
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : defalutParamValue.strokeWidth,
      globalCompositeOperation: 'source-over',
      x: pos.x,
      y: pos.y,
      dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
      dash: [8],
    })
    layer.add(lastReact)
  },

  onDraw: (e: Event, Konva: any, stage: any, layer: any) => {
    if (!isPaint) return

    const pos = stage.getPointerPosition()
    lastReact.width(pos.x - startPoint[0])
    lastReact.height(pos.y - startPoint[1])
    layer.batchDraw()
  },

  onDrawEnd: () => {
    isPaint = false
  },
}  as PluginProps