import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventPramas, PluginParamName, PluginParamValue } from '../type'
import { transformerStyle } from '../constants'
import { uuid } from '../utils'

export default class Circle extends Plugin {
  name = 'circle'
  iconfont = 'iconfont icon-circle'
  title = '插入圆圈'
  params = ['strokeWidth', 'lineType', 'color'] as PluginParamName[]
  defalutParamValue = {
    strokeWidth: 2,
    lineType: 'solid',
    color: '#F5222D',
  } as PluginParamValue
  shapeName = 'circle'

  lastCircle: any = null
  transformer: any = null
  selectedNode: any = null
  isPaint = false // 防止切换插件时，onDraw 没有释放
  started = false // start draw 的标志
  startPoint = [0, 0]

  enableTransform = (drawEventPramas: DrawEventPramas, node: any) => {
    const {stage, layer} = drawEventPramas

    if (!this.transformer) {
      this.transformer = new Konva.Transformer({ ...transformerStyle })
      layer.add(this.transformer)
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
    layer.draw()
  }

  disableTransform = (drawEventPramas: DrawEventPramas, node: any, remove?: boolean) => {
    const {stage, layer, historyStack} = drawEventPramas

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
    layer.draw()
  }

  onEnter = (drawEventPramas: DrawEventPramas) => {
    const {stage, layer} = drawEventPramas
    const container = stage.container()
    container.tabIndex = 1 // make it focusable
    container.focus()
    container.addEventListener('keyup', (e: any) => {
      if (e.key === 'Backspace' && this.selectedNode) {
        this.disableTransform(drawEventPramas, this.selectedNode, true)
        layer.draw()
      }
    })
  }

  onClick = (drawEventPramas: DrawEventPramas) => {
    const {event} = drawEventPramas

    if (event.target.name && event.target.name() === 'circle') {
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
    const {stage, layer, paramValue, historyStack} = drawEventPramas

    if (!this.isPaint || this.transformer) return

    if (!this.started) {
      const pos = stage.getPointerPosition()
      this.startPoint = [pos.x, pos.y]
      this.lastCircle = new Konva.Circle({
        id: uuid(),
        name: 'circle',
        stroke: (paramValue && paramValue.color) ? paramValue.color : this.defalutParamValue.color,
        strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : this.defalutParamValue.strokeWidth,
        globalCompositeOperation: 'source-over',
        radius: 0,
        dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
        dash: [8],
        strokeScaleEnabled: false,
      })
      this.lastCircle.on('transformend', function() {
        historyStack.push(this.toObject())
      })
      this.lastCircle.on('dragend', function() {
        historyStack.push(this.toObject())
      })
      layer.add(this.lastCircle)
      this.started = true
    }

    const pos = stage.getPointerPosition()
    const radius = Math.sqrt(Math.pow(pos.x - this.startPoint[0], 2) + Math.pow(pos.y - this.startPoint[1], 2)) / 2
    this.lastCircle.x((pos.x + this.startPoint[0]) / 2)
    this.lastCircle.y((pos.y + this.startPoint[1]) / 2)
    this.lastCircle.setAttr('radius', radius)
    layer.batchDraw()
  }

  onDrawEnd = (drawEventPramas: DrawEventPramas) => {
    const {historyStack} = drawEventPramas
    // mouseup event is triggered by move event but click event
    if (this.started) {
      this.disableTransform(drawEventPramas, this.selectedNode)
      if (this.lastCircle) {
        historyStack.push(this.lastCircle.toObject())
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