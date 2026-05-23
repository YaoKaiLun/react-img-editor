import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventParams, PluginParamName, PluginParamValue } from '../common/type'
import { LocaleKey } from '../common/i18n'
import { uuid } from '../common/utils'

export default class Pen extends Plugin {
  name = 'pen'
  iconfont = 'iconfont icon-pen'
  title = '画笔'
  titleKey = 'pen' as LocaleKey
  params = ['strokeWidth', 'lineType', 'color'] as PluginParamName[]
  defaultParamValue = {
    strokeWidth: 2,
    lineType: 'solid',
    color: '#F5222D',
  } as PluginParamValue

  lastLine: any = null
  isPaint = false
  points: number[] = []

  onDrawStart = (drawEventParams: DrawEventParams) => {
    const { stage, drawLayer, paramValue } = drawEventParams
    const pos = stage.getPointerPosition()

    if (!pos) return

    this.isPaint = true
    this.points = [pos.x, pos.y]

    this.lastLine = new Konva.Line({
      id: uuid(),
      stroke: (paramValue && paramValue.color) ? paramValue.color : this.defaultParamValue.color,
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : this.defaultParamValue.strokeWidth,
      globalCompositeOperation: 'source-over',
      points: [pos.x, pos.y],
      dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
      dash: [8, 8],
      tension: 0.3,
      lineCap: 'round',
      lineJoin: 'round',
    })
    drawLayer.add(this.lastLine)
  }

  onDraw = (drawEventParams: DrawEventParams) => {
    const { stage, drawLayer } = drawEventParams
    const pos = stage.getPointerPosition()

    if (!this.isPaint || !pos) return

    this.points.push(pos.x, pos.y)
    this.lastLine.points(this.points)
    drawLayer.batchDraw()
  }

  onDrawEnd = (drawEventParams: DrawEventParams) => {
    const { pubSub } = drawEventParams
    this.isPaint = false
    this.points = []
    pubSub.pub('PUSH_HISTORY', this.lastLine)
  }

  onLeave = () => {
    this.isPaint = false
    this.points = []
  }
}
