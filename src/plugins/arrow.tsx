import Konva from 'konva'
import { PluginProps } from '../type'
import { transformerStyle } from '../constants'

let lastArrow: any = null
let transformer: any = null
let selectedNode: any = null
let isPaint = false
let started = false
let startPoints = [0, 0]
const defalutParamValue = {
  strokeWidth: 2,
  lineType: 'solid',
  color: '#F5222D',
}

function enableTransform(stage: any, layer: any, node: any) {
  if (!transformer) {
    transformer = new Konva.Transformer({ ...transformerStyle, borderStrokeWidth: 0, rotateEnabled: true })
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
  name: 'arrow',
  iconfont: 'iconfont icon-arrow',
  title: '插入箭头',
  params: ['strokeWidth', 'color'],
  defalutParamValue,
  shapeName: 'arrow',
  onClick: ({event, stage, layer}) => {
    if (event.target.name && event.target.name() === 'arrow') {
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
      startPoints = [pos.x, pos.y]
      const strokeColor = (paramValue && paramValue.color) ? paramValue.color : defalutParamValue.color
      lastArrow = new Konva.Arrow({
        name: 'arrow',
        stroke: strokeColor,
        strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : defalutParamValue.strokeWidth,
        globalCompositeOperation: 'source-over',
        points: startPoints,
        dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
        dash: [8],
        fill: strokeColor,
        strokeScaleEnabled: false,
      })
      layer.add(lastArrow)
      started = true
    }

    const pos = stage.getPointerPosition()
    lastArrow.points([startPoints[0], startPoints[1], pos.x, pos.y])
    layer.batchDraw()
  },

  onDrawEnd: ({stage, layer, historyStack}) => {
    // mouseup event is triggered by move event but click event
    if (started) {
      disableTransform(stage, layer, selectedNode)
    }
    isPaint = false
    started = false
    historyStack.push(lastArrow)
  },

  onLeave: ({stage, layer}) => {
    isPaint = false
    started = false
    disableTransform(stage, layer, selectedNode)
  },
}  as PluginProps