import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventPramas, PluginParamName, PluginParamValue } from '../type'
import { uuid } from '../utils'

export default class Pen extends Plugin {
  name = 'pen'
  iconfont = 'iconfont icon-pen'
  title = '画笔'
  params = ['strokeWidth', 'lineType', 'color'] as PluginParamName[]
  defalutParamValue = {
    strokeWidth: 2,
    lineType: 'solid',
    color: '#F5222D',
  } as PluginParamValue

  lastLine: any = null
  isPaint = false

  onDrawStart = (drawEventPramas: DrawEventPramas) => {
    const {stage, layer, paramValue} = drawEventPramas
    const pos = stage.getPointerPosition()
    this.isPaint = true
    this.lastLine = new Konva.Line({
      id: uuid(),
      stroke: (paramValue && paramValue.color) ? paramValue.color : this.defalutParamValue.color,
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : this.defalutParamValue.strokeWidth,
      globalCompositeOperation: 'source-over',
      points: [pos.x, pos.y],
      dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
      dash: [8],
    })
    layer.add(this.lastLine)
  }

  onDraw = (drawEventPramas: DrawEventPramas) => {
    if (!this.isPaint) return

    const {stage, layer} = drawEventPramas
    const pos = stage.getPointerPosition()
    const newPoints = this.lastLine.points().concat([pos.x, pos.y])
    this.lastLine.points(newPoints)
    layer.batchDraw()
  }

  onDrawEnd = (drawEventPramas: DrawEventPramas) => {
    const {historyStack} = drawEventPramas
    this.isPaint = false
    historyStack.push(this.lastLine.toObject())
  }

  onLeave = () => {
    this.isPaint = false
  }
}