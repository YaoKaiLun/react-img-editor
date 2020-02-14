import Konva from 'konva'
import { PluginProps } from '../type'
import { transformerStyle } from '../constants'

let lastCircle: any = null
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

function enableTransform(layer: any, node: any) {
  if (!transformer) {
    transformer = new Konva.Transformer({ ...transformerStyle, borderStrokeWidth: 0 })
    layer.add(transformer)
    transformer.attachTo(node)
  }

  node && node.draggable(true)
  layer.draw()
}

function disableTransform(layer: any, node: any) {
  if (transformer) {
    transformer.remove()
    transformer = null
  }

  node && node.draggable(false)
  selectedNode = null
  layer.draw()
}

export default {
  name: 'circle',
  iconfont: 'iconfont icon-circle',
  title: '插入圆圈',
  params: ['strokeWidth', 'lineType', 'color'],
  defalutParamValue,
  shapeName: 'circle',
  onClick: ({event, layer}) => {
    if (event.target.name && event.target.name() === 'circle') {
      // 之前没有选中节点或者在相同节点之间切换点击
      if (!selectedNode || selectedNode._id !== event.target._id) {
        selectedNode && disableTransform(layer, selectedNode)
        enableTransform(layer, event.target)
        selectedNode = event.target
      }
    } else {
      disableTransform(layer, selectedNode)
    }
  },

  onDrawStart: () => {
    isPaint = true
  },

  onDraw: ({stage, layer, paramValue}) => {
    if (!isPaint || transformer) return

    if (!started) {
      const pos = stage.getPointerPosition()
      startPoint = [pos.x, pos.y]
      lastCircle = new Konva.Circle({
        name: 'circle',
        stroke: (paramValue && paramValue.color) ? paramValue.color : defalutParamValue.color,
        strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : defalutParamValue.strokeWidth,
        globalCompositeOperation: 'source-over',
        radius: 0,
        dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
        dash: [8],
        strokeScaleEnabled: false,
      })
      layer.add(lastCircle)
      started = true
    }

    const pos = stage.getPointerPosition()
    const radius = Math.sqrt(Math.pow(pos.x - startPoint[0], 2) + Math.pow(pos.y - startPoint[1], 2)) / 2
    lastCircle.x((pos.x + startPoint[0]) / 2)
    lastCircle.y((pos.y + startPoint[1]) / 2)
    lastCircle.setAttr('radius', radius)
    layer.batchDraw()
  },

  onDrawEnd: ({layer, historyStack}) => {
    // mouseup event is triggered by move event but click event
    if (started) {
      disableTransform(layer, selectedNode)
    }
    isPaint = false
    started = false
    historyStack.push(lastCircle)
  },

  onLeave: ({layer}) => {
    isPaint = false
    started = false
    disableTransform(layer, selectedNode)
  },
}  as PluginProps