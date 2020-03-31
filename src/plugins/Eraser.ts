import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventParams, PluginParamName, PluginParamValue } from '../common/type'
import { uuid } from '../common/utils'

export default class Eraser extends Plugin {
  name = 'eraser'
  iconfont = 'iconfont icon-eraser'
  title = '擦除'
  params = ['strokeWidth'] as PluginParamName[]
  defaultParamValue = {
    strokeWidth: 2,
  } as PluginParamValue

  lastLine: any = null
  isPaint = false

  onDrawStart = (drawEventParams: DrawEventParams) => {
    const {stage, drawLayer, paramValue} = drawEventParams
    const pos = stage.getPointerPosition()

    if (!pos) return

    this.isPaint = true
    this.lastLine = new Konva.Line({
      id: uuid(),
      stroke: '#df4b26',
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : this.defaultParamValue.strokeWidth,
      globalCompositeOperation: 'destination-out',
      points: [pos.x, pos.y],
    })
    drawLayer.add(this.lastLine)
  }

  onDraw = (drawEventParams: DrawEventParams) => {
    const {stage, drawLayer} = drawEventParams
    const pos = stage.getPointerPosition()

    if (!this.isPaint || !pos) return

    const newPoints = this.lastLine.points().concat([pos.x, pos.y])
    this.lastLine.points(newPoints)
    drawLayer.batchDraw()
  }

  onDrawEnd = (drawEventParams: DrawEventParams) => {
    const {pubSub} = drawEventParams
    this.isPaint = false
    pubSub.pub('PUSH_HISTORY', this.lastLine)
  }

  onLeave = () => {
    this.isPaint = false
  }
}