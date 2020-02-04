import Konva from 'konva'
import { PluginProps } from '../type'
import { transformerStyle } from '../constants'

const initRectWidth = 100
const initRectHeight = 100
const initRectX = 0
const initRectY = 0
let virtualLayer: any = null
let rectWidth = initRectWidth
let rectHeight = initRectHeight
let rectX = initRectX
let rectY = initRectY

function adjustToolbarPosition(stage: any) {
  if (!document.getElementById('react-img-editor-crop-toolbar')) return

  const container = stage.container().getBoundingClientRect()
  const $placeholder = document.getElementById('react-img-editor-crop-toolbar')!
  $placeholder.style.left = `${container.left + rectX + 1}px`
  $placeholder.style.top = `${container.top + rectHeight + rectY + 20}px`
}

function createCropToolbar(sureBtnEvent: () => void, cancelBtnEvent: () => void) {
  if (document.getElementById('react-img-editor-crop-toolbar')) return

  const fragment = new DocumentFragment()

  // 创建截图工具栏
  const $cropToolbar = document.createElement('div')
  $cropToolbar.setAttribute('id', 'react-img-editor-crop-toolbar')
  const cropToolbarStyle = 'position: absolute; z-index: 1000; box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);' +
    'background: #FFF; width: 275px; height: 40px; display: flex; align-items: center; padding: 0 12px;' +
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

  rectWidth = initRectWidth
  rectHeight = initRectHeight
  rectX = initRectX
  rectY = initRectY
}

export default {
  name: 'crop',
  iconfont: 'iconfont icon-cut',
  onClick: ({stage, imageData, reload, pixelRatio}) => {
    if (document.getElementById('react-img-editor-crop-toolbar')) return

    virtualLayer = new Konva.Layer()

    // 绘制灰色遮罩
    const rect1 = new Konva.Rect({
      x: rectX,
      y: rectY,
      width: imageData.width,
      height: imageData.height,
      fill: 'rgba(0, 0, 0, .6)',
    })
    virtualLayer.add(rect1)

    // 绘制初始裁剪区域
    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: initRectWidth,
      height: initRectHeight,
      fill: 'red',
      draggable: true,
      shadowBlur: 1000,
      shadowColor: 'green',
      globalCompositeOperation: 'destination-out',
      dragBoundFunc: function(pos: any) {
        let x = pos.x
        let y = pos.y

        if (pos.x < 0) {
          x = 0
        }

        if (pos.x > imageData.width - rectWidth) {
          x = imageData.width - rectWidth
        }

        if (pos.y < 0) {
          y = 0
        }

        if (pos.y > imageData.height - rectHeight) {
          y = imageData.height - rectHeight
        }

        rectX = x
        rectY = y

        adjustToolbarPosition(stage)
        return { x, y }
      },
    })
    virtualLayer.add(rect)

    // 允许改变裁剪区域
    const transformer = new Konva.Transformer({
      node: rect,
      ...transformerStyle,
      boundBoxFunc: function(oldBox: any, newBox: any) {
        if (
          newBox.width > imageData.width ||
          newBox.height > imageData.height ||
          newBox.x < 0 ||
          newBox.y < 0 ||
          newBox.x + newBox.width > imageData.width ||
          newBox.y + newBox.height > imageData.height)
        {
          rectWidth = imageData.width
          rectHeight = imageData.height
          rectX = oldBox.x
          rectY = oldBox.y
          adjustToolbarPosition(stage)
          return oldBox
        }

        rectWidth = newBox.width
        rectHeight = newBox.height
        rectX = newBox.x
        rectY = newBox.y
        adjustToolbarPosition(stage)
        return newBox
      },
    })
    virtualLayer.add(transformer)

    createCropToolbar(function () {
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

    stage.add(virtualLayer)
  },
}  as PluginProps