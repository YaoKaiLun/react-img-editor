import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventPramas, PluginParamName, PluginParamValue } from '../common/type'
import { transformerStyle } from '../common/constants'
import { uuid } from '../common/utils'

export default class Rect extends Plugin {
  name = 'rect'
  iconfont = 'iconfont icon-square'
  title = '插入矩形'
  params = ['strokeWidth', 'lineType', 'color'] as PluginParamName[]
  defalutParamValue = {
    strokeWidth: 2,
    lineType: 'solid',
    color: '#F5222D',
  } as PluginParamValue
  shapeName = 'rect'

  lastRect: any = null
  transformer: any = null
  selectedNode: any = null
  isPaint = false // 防止切换插件时，onDraw 没有释放
  started = false // start draw 的标志
  startPoint = [0, 0]

  enableTransform = (drawEventPramas: DrawEventPramas, node: any) => {
    const {stage, drawLayer} = drawEventPramas

    if (!this.transformer) {
      this.transformer = new Konva.Transformer({ ...transformerStyle, borderStrokeWidth: 0 })
      drawLayer.add(this.transformer)
      this.transformer.attachTo(node)
      node.on('mouseenter', function() {
        stage.container().style.cursor = 'move'
      })
      node.on('mouseleave', function() {
        stage.container().style.cursor = 'default'
      })
      stage.container().style.cursor = 'move'
    }

    node && node.draggable(true)
    drawLayer.draw()
  }

  disableTransform = (drawEventPramas: DrawEventPramas, node: any, remove?: boolean) => {
    const {stage, drawLayer, historyStack} = drawEventPramas

    if (this.transformer) {
      this.transformer.remove()
      this.transformer = null
    }

    if (node) {
      node.draggable(false)
      node.off('mouseenter')
      node.off('mouseleave')
      stage.container().style.cursor = 'default'

      if (remove) {
        node.hide()
        // 使用隐藏节点占位并覆盖堆栈中已有节点
        historyStack.push(node.toObject())
        node.remove()
      }
    }

    this.selectedNode = null
    drawLayer.draw()
  }

  onEnter = (drawEventPramas: DrawEventPramas) => {
    const {stage, drawLayer} = drawEventPramas
    const container = stage.container()
    container.tabIndex = 1 // make it focusable
    container.focus()
    container.addEventListener('keyup', (e: any) => {
      if (e.key === 'Backspace' && this.selectedNode) {
        this.disableTransform(drawEventPramas, this.selectedNode, true)
        drawLayer.draw()
      }
    })
  }

  onClick = (drawEventPramas: DrawEventPramas) => {
    const {event} = drawEventPramas

    if (event.target.name && event.target.name() === 'rect') {
      // 之前没有选中节点或者在相同节点之间切换点击
      if (!this.selectedNode || this.selectedNode._id !== event.target._id) {
        this.selectedNode && this.disableTransform(drawEventPramas, this.selectedNode)
        this.enableTransform(drawEventPramas, event.target)
        this.selectedNode = event.target
      }
    } else {
      this.disableTransform(drawEventPramas, this.selectedNode)
    }
  }

  onDrawStart = () => {
    this.isPaint = true
  }

  onDraw = (drawEventPramas: DrawEventPramas) => {
    const {stage, drawLayer, paramValue, historyStack} = drawEventPramas
    const pos = stage.getPointerPosition()

    if (!this.isPaint || this.transformer || !pos) return

    if (!this.started) {
      this.startPoint = [pos.x, pos.y]
      this.lastRect = new Konva.Rect({
        id: uuid(),
        name: 'rect',
        stroke: (paramValue && paramValue.color) ? paramValue.color : this.defalutParamValue.color,
        strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : this.defalutParamValue.strokeWidth,
        globalCompositeOperation: 'source-over',
        x: pos.x,
        y: pos.y,
        dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
        dash: [8],
        strokeScaleEnabled: false,
      })
      this.lastRect.on('transformend', function() {
        historyStack.push(this.toObject())
      })
      this.lastRect.on('dragend', function() {
        historyStack.push(this.toObject())
      })
      drawLayer.add(this.lastRect)
      this.started = true
    }

    this.lastRect.width(pos.x - this.startPoint[0])
    this.lastRect.height(pos.y - this.startPoint[1])
    drawLayer.batchDraw()
  }

  onDrawEnd = (drawEventPramas: DrawEventPramas) => {
    const {historyStack} = drawEventPramas

    // mouseup event is triggered by move event but click event
    if (this.started) {
      this.disableTransform(drawEventPramas, this.selectedNode)
      if (this.lastRect) {
        historyStack.push(this.lastRect.toObject())
      }
    }
    this.isPaint = false
    this.started = false
  }

  onLeave = (drawEventPramas: DrawEventPramas) => {
    this.isPaint = false
    this.started = false
    this.disableTransform(drawEventPramas, this.selectedNode)
  }

  onNodeRecreate = (drawEventPramas: DrawEventPramas, node: any) => {
    const {historyStack} = drawEventPramas
    node.on('transformend', function() {
      historyStack.push(this.toObject())
    })
    node.on('dragend', function() {
      historyStack.push(this.toObject())
    })
  }
}