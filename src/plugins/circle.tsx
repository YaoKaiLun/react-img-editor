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

function enableTransform(stage: any, layer: any, node: any) {
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

function disableTransform(stage: any, layer: any, node: any) {
  if (transformer) {
    transformer.remove()
    transformer = null
  }

  if (node) {
    node.draggable(false)
    node.off('mouseenter')
    node.off('mouseleave')
    stage.container().style.cursor = 'default'
  }

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
  onClick: ({event, stage, layer}) => {
    if (event.target.name && event.target.name() === 'circle') {
      // 之前没有选中节点或者在相同节点之间切换点击
      if (!selectedNode || selectedNode._id !== event.target._id) {
        selectedNode && disableTransform(stage, layer, selectedNode)
        enableTransform(stage, layer, event.target)
        selectedNode = event.target
      }
    } else {
      disableTransform(stage, layer, selectedNode)
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

  onDrawEnd: ({stage, layer, historyStack}) => {
    // mouseup event is triggered by move event but click event
    if (started) {
      disableTransform(stage, layer, selectedNode)
    }
    isPaint = false
    started = false
    historyStack.push(lastCircle)
  },

  onLeave: ({stage, layer}) => {
    isPaint = false
    started = false
    disableTransform(stage, layer, selectedNode)
  },
}  as PluginProps