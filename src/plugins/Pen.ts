import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventPramas, PluginParamName, PluginParamValue } from '../common/type'
import { uuid } from '../common/utils'

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
    const {stage, drawLayer, paramValue} = drawEventPramas
    const pos = stage.getPointerPosition()

    if (!pos) return

    this.isPaint = true
    this.lastLine = new Konva.Line({
      id: uuid(),
      stroke: (paramValue && paramValue.color) ? paramValue.color : this.defalutParamValue.color,
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : this.defalutParamValue.strokeWidth,
      globalCompositeOperation: 'source-over',
      points: [pos.x, pos.y],
      dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
      dash: [8],
      tension: 1,
      lineCap: 'round',
      lineJoin: 'round',
    })
    drawLayer.add(this.lastLine)
  }

  onDraw = (drawEventPramas: DrawEventPramas) => {
    const {stage, drawLayer} = drawEventPramas
    const pos = stage.getPointerPosition()

    if (!this.isPaint || !pos) return

    const newPoints = this.lastLine.points().concat([pos.x, pos.y])
    this.lastLine.points(newPoints)
    drawLayer.batchDraw()
  }

  onDrawEnd = (drawEventPramas: DrawEventPramas) => {
    const {pubSub} = drawEventPramas
    this.isPaint = false
    pubSub.pub('PUSH_HISTORY', this.lastLine)
  }

  onLeave = () => {
    this.isPaint = false
  }
}