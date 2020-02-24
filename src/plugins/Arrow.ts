import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventPramas, PluginParamName, PluginParamValue } from '../common/type'
import { transformerStyle } from '../common/constants'
import { uuid } from '../common/utils'

export default class Arrow extends Plugin {
  name = 'arrow'
  iconfont = 'iconfont icon-arrow'
  title = '插入箭头'
  params = ['strokeWidth', 'color'] as PluginParamName[]
  defalutParamValue = {
    strokeWidth: 2,
    lineType: 'solid',
    color: '#F5222D',
  } as PluginParamValue
  shapeName = 'arrow'

  lastArrow: any = null
  transformer: any = null
  selectedNode: any = null
  isPaint = false
  started = false
  startPoints = [0, 0]

  enableTransform = (drawEventPramas: DrawEventPramas, node: any) => {
    const {stage, drawLayer} = drawEventPramas

    if (!this.transformer) {
      this.transformer = new Konva.Transformer({ ...transformerStyle, rotateEnabled: true })
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
    const {stage, drawLayer, pubSub} = drawEventPramas

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
        pubSub.pub('PUSH_HISTORY', node)
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

    if (event.target.name && event.target.name() === 'arrow') {
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
    const {stage, drawLayer, paramValue, pubSub} = drawEventPramas
    const pos = stage.getPointerPosition()

    if (!this.isPaint || this.transformer || !pos) return

    if (!this.started && pos) {
      this.startPoints = [pos.x, pos.y]
      const strokeColor = (paramValue && paramValue.color) ? paramValue.color : this.defalutParamValue.color
      this.lastArrow = new Konva.Arrow({
        id: uuid(),
        name: 'arrow',
        stroke: strokeColor,
        strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : this.defalutParamValue.strokeWidth,
        globalCompositeOperation: 'source-over',
        points: this.startPoints,
        dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
        dash: [8],
        fill: strokeColor,
        strokeScaleEnabled: false,
      })
      this.lastArrow.on('transformend', function() {
        pubSub.pub('PUSH_HISTORY', this)
      })
      this.lastArrow.on('dragend', function() {
        pubSub.pub('PUSH_HISTORY', this)
      })
      drawLayer.add(this.lastArrow)
      this.started = true
    }

    this.lastArrow.points([this.startPoints[0], this.startPoints[1], pos.x, pos.y])
    drawLayer.batchDraw()
  }

  onDrawEnd = (drawEventPramas: DrawEventPramas) => {
    const {pubSub} = drawEventPramas
    // mouseup event is triggered by move event but click event
    if (this.started) {
      this.disableTransform(drawEventPramas, this.selectedNode)
      if (this.lastArrow) {
        pubSub.pub('PUSH_HISTORY', this.lastArrow)
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
    const {pubSub} = drawEventPramas
    node.on('transformend', function() {
      pubSub.pub('PUSH_HISTORY', this)
    })
    node.on('dragend', function() {
      pubSub.pub('PUSH_HISTORY', this)
    })
  }
}