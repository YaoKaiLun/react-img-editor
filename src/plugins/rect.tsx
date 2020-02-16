import Konva from 'konva'
import { DrawEventPramas, PluginProps } from '../type'
import { transformerStyle } from '../constants'
import { uuid } from '../utils'

let lastRect: any = null
let transformer: any = null
let selectedNode: any = null
let isPaint = false // 防止切换插件时，onDraw 没有释放
let started = false // start draw 的标志
let startPoint = [0, 0]
const defalutParamValue = {
  strokeWidth: 2,
  lineType: 'solid',
  color: '#F5222D',
}

function enableTransform(drawEventPramas: DrawEventPramas, node: any) {
  const {stage, layer} = drawEventPramas

  if (!transformer) {
    transformer = new Konva.Transformer({ ...transformerStyle, borderStrokeWidth: 0 })
    layer.add(transformer)
    transformer.attachTo(node)
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

function disableTransform(drawEventPramas: DrawEventPramas, node: any, remove?: boolean) {
  const {stage, layer, historyStack} = drawEventPramas

  if (transformer) {
    transformer.remove()
    transformer = null
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

  selectedNode = null
  layer.draw()
}

export default {
  name: 'rect',
  iconfont: 'iconfont icon-square',
  title: '插入矩形',
  params: ['strokeWidth', 'lineType', 'color'],
  defalutParamValue,
  shapeName: 'rect',
  onEnter: (drawEventPramas) => {
    const {stage, layer} = drawEventPramas
    const container = stage.container()
    container.tabIndex = 1 // make it focusable
    container.focus()
    container.addEventListener('keyup', function(e: any) {
      if (e.key === 'Backspace' && selectedNode) {
        disableTransform(drawEventPramas, selectedNode, true)
        layer.draw()
      }
    })
  },

  onClick: (drawEventPramas) => {
    const {event} = drawEventPramas

    if (event.target.name && event.target.name() === 'rect') {
      // 之前没有选中节点或者在相同节点之间切换点击
      if (!selectedNode || selectedNode._id !== event.target._id) {
        selectedNode && disableTransform(drawEventPramas, selectedNode)
        enableTransform(drawEventPramas, event.target)
        selectedNode = event.target
      }
    } else {
      disableTransform(drawEventPramas, selectedNode)
    }
  },

  onDrawStart: () => {
    isPaint = true
  },

  onDraw: (drawEventPramas) => {
    const {stage, layer, paramValue, historyStack} = drawEventPramas

    if (!isPaint || transformer) return

    if (!started) {
      const pos = stage.getPointerPosition()
      startPoint = [pos.x, pos.y]
      lastRect = new Konva.Rect({
        id: uuid(),
        name: 'rect',
        stroke: (paramValue && paramValue.color) ? paramValue.color : defalutParamValue.color,
        strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : defalutParamValue.strokeWidth,
        globalCompositeOperation: 'source-over',
        x: pos.x,
        y: pos.y,
        dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
        dash: [8],
        strokeScaleEnabled: false,
      })
      lastRect.on('transformend', function() {
        historyStack.push(this.toObject())
      })
      lastRect.on('dragend', function() {
        historyStack.push(this.toObject())
      })
      layer.add(lastRect)
      started = true
    }

    const pos = stage.getPointerPosition()
    lastRect.width(pos.x - startPoint[0])
    lastRect.height(pos.y - startPoint[1])
    layer.batchDraw()
  },

  onDrawEnd: (drawEventPramas) => {
    const {historyStack} = drawEventPramas

    // mouseup event is triggered by move event but click event
    if (started) {
      disableTransform(drawEventPramas, selectedNode)
      if (lastRect) {
        historyStack.push(lastRect.toObject())
      }
    }
    isPaint = false
    started = false
  },

  onLeave: (drawEventPramas) => {
    isPaint = false
    started = false
    disableTransform(drawEventPramas, selectedNode)
  },

  onNodeRecreate: ({historyStack}, node) => {
    node.on('transformend', function() {
      historyStack.push(this.toObject())
    })
    node.on('dragend', function() {
      historyStack.push(this.toObject())
    })
  },
}  as PluginProps