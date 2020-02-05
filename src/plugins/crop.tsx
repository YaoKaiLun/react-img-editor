import Konva from 'konva'
import { PluginProps } from '../type'
import { transformerStyle } from '../constants'

let isPaint = false
let startPoint = [0, 0]
let virtualLayer: any = null
let rectX = 0
let rectY = 0
let rectWidth = 0
let rectHeight = 0
let rect = null
const toolbarWidth = 275
const toolbarHeight = 40

function adjustToolbarPosition(stage: any) {
  const $toolbar = document.getElementById('react-img-editor-crop-toolbar')
  if (!$toolbar) return

  const container = stage.container().getBoundingClientRect()

  let left = container.left + rectX + 1
  const top = container.top + rectHeight + rectY + 20

  // 处理最右边工具栏溢出
  if (rectX + toolbarWidth > stage.width()) {
    left = container.left + (stage.width() - toolbarWidth) + 1
  }

  $toolbar.style.left = `${left}px`
  $toolbar.style.top = `${top}px`
}

function createCropToolbar(sureBtnEvent: () => void, cancelBtnEvent: () => void) {
  if (document.getElementById('react-img-editor-crop-toolbar')) return

  const fragment = new DocumentFragment()

  // 创建截图工具栏
  const $cropToolbar = document.createElement('div')
  $cropToolbar.setAttribute('id', 'react-img-editor-crop-toolbar')
  const cropToolbarStyle = 'position: absolute; z-index: 1000; box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);' +
    `background: #FFF; width: ${toolbarWidth}px; height: ${toolbarHeight}px; display: flex; align-items: center; padding: 0 12px;` +
    'font-size: 14px;'
  $cropToolbar.setAttribute('style', cropToolbarStyle)
  fragment.appendChild($cropToolbar)

  // 创建文本
  const $textNode = document.createTextNode('拖动边框调整图片显示范围')
  $cropToolbar.appendChild($textNode)

  const btnStyle = 'display: inline-block; width: 32px; height: 24px; border: 1px solid #C9C9D0;' +
    'border-radius: 2px; text-align: center; cursor: pointer; line-height: 24px;'

  // 创建取消按钮
  const $cancelBtn = document.createElement('span')
  $cancelBtn.setAttribute('style', btnStyle + 'background: #FFF; margin: 0 8px 0 10px;')
  $cancelBtn.onclick = cancelBtnEvent
  $cropToolbar.appendChild($cancelBtn)

  // 创建取消按钮图标
  const $closeIcon = document.createElement('i')
  $closeIcon.setAttribute('class', 'iconfont icon-close')
  $closeIcon.setAttribute('style', 'font-size: 12px;')
  $cancelBtn.appendChild($closeIcon)

  // 创建确认按钮
  const $sureBtn = document.createElement('span')
  $sureBtn.setAttribute('style', btnStyle + 'background: #007AFF; color: #FFF;')
  $sureBtn.onclick = sureBtnEvent
  $cropToolbar.appendChild($sureBtn)

  // 创建确认按钮图标
  const $checkIcon = document.createElement('i')
  $checkIcon.setAttribute('class', 'iconfont icon-check')
  $checkIcon.setAttribute('style', 'font-size: 12px;')
  $sureBtn.appendChild($checkIcon)

  document.body.appendChild(fragment)
}

function reset() {
  const $toolbar = document.getElementById('react-img-editor-crop-toolbar')
  $toolbar && document.body.removeChild($toolbar)
  virtualLayer && virtualLayer.remove()
}

export default {
  name: 'crop',
  iconfont: 'iconfont icon-cut',
  params: [],
  onClick: ({stage}) => {
    stage.container().style.cursor = 'crosshair'
  },
  onDrawStart: ({stage}) => {
    if (document.getElementById('react-img-editor-crop-toolbar')) return
    isPaint = true

    const pos = stage.getPointerPosition()
    startPoint = [pos.x, pos.y]
    rectX = pos.x
    rectY = pos.y

    virtualLayer = new Konva.Layer()
    stage.add(virtualLayer)
    virtualLayer.setZIndex(2)

    // 绘制透明黑色遮罩
    const maskRect = new Konva.Rect({
      globalCompositeOperation: 'source-over',
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
      fill: 'rgba(0, 0, 0, .6)',
    })

    virtualLayer.add(maskRect)

    rect = new Konva.Rect({
      x: pos.x,
      y: pos.y,
      fill: '#FFF',
      draggable: true,
      globalCompositeOperation: 'destination-out',
    })
    virtualLayer.add(rect)

    virtualLayer.draw()
  },
  onDraw: ({stage}) => {
    if (!isPaint) return
    if (document.getElementById('react-img-editor-crop-toolbar')) return

    const endPos = stage.getPointerPosition()
    rectWidth = endPos.x - startPoint[0]
    rectHeight = endPos.y - startPoint[1]

    // 绘制初始裁剪区域
    rect.width(endPos.x - startPoint[0])
    rect.height(endPos.y - startPoint[1])
    rect.dragBoundFunc((pos: any) => {
      let x = pos.x
      let y = pos.y

      if (pos.x <= 0) x = 0
      if (pos.x >= stage.width() - rectWidth) x = stage.width() - rectWidth
      if (pos.y <= 0) y = 0
      if (pos.y >= stage.height() - rectHeight) y = stage.height() - rectHeight

      rectX = x
      rectY = y

      adjustToolbarPosition(stage)
      return { x, y }
    })

    virtualLayer.draw()
  },
  onDrawEnd: ({stage, pixelRatio, reload}) => {
    if (!isPaint) {
      isPaint = false
      return
    }

    isPaint = false

    // 允许改变裁剪区域
    const transformer = new Konva.Transformer({
      node: rect,
      ...transformerStyle,
      boundBoxFunc: function(oldBox: any, newBox: any) {
        // 禁止反向拖拽
        if (newBox.width < 0 || newBox.height < 0) return oldBox

        let x = newBox.x
        let y = newBox.y
        let width = newBox.width
        let height = newBox.height

        if (newBox.x <= 0) {
          x = 0
          width = newBox.width + newBox.x
        }

        if (newBox.x >= stage.width() - newBox.width) {
          width = stage.width() - oldBox.x
        }

        if (newBox.y <= 0) {
          y = 0
          height = newBox.height + newBox.y
        }

        if (newBox.y >= stage.height() - newBox.height) {
          height = stage.height() - oldBox.y
        }

        rectWidth = width
        rectHeight = height
        rectX = x
        rectY = y
        adjustToolbarPosition(stage)
        return { x, y, width, height } as any
      },
    })
    virtualLayer.add(transformer)
    virtualLayer.draw()

    createCropToolbar(function () {
      // 裁剪区域太小不允许裁剪
      if (rectWidth < 2 || rectHeight < 2) return

      // 提前清除拉伸框
      virtualLayer.remove(transformer)
      const dataURL = stage.toDataURL({
        x: rectX,
        y: rectY,
        width: rectWidth,
        height: rectHeight,
        pixelRatio,
        mimeType: 'image/jpeg',
      })
      const imageObj = new Image()
      imageObj.onload = function() {
        reload(imageObj, rectWidth, rectHeight)
        reset()
      }
      imageObj.src = dataURL
    }, reset)
    adjustToolbarPosition(stage)
  },
  onLeave: ({stage}) => {
    reset()
    stage.container().style.cursor = 'default'
  },
}  as PluginProps