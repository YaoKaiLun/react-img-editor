import Konva from 'konva'
import { PluginProps } from '../type'
import { transformerStyle } from '../constants'

let isPaint = false
let virtualLayer: any = null
let rect: any = null
let transformer: any = null
const toolbarWidth = 275
const toolbarHeight = 40

// 一直为正数
function getRectWidth() {
  return rect ? rect.getClientRect({skipTransform: false}).width : 0
}
// 一直为正数
function getRectHeight() {
  return rect ? rect.getClientRect({skipTransform: false}).height : 0
}

function getRectX() {
  return rect ? rect.getClientRect({skipTransform: false}).x : 0
}

function getRectY() {
  return rect ? rect.getClientRect({skipTransform: false}).y : 0
}

function adjustToolbarPosition(stage: any) {
  // 需要考虑宽和高为负数的情况
  const $toolbar = document.getElementById('react-img-editor-crop-toolbar')
  if (!$toolbar) return

  const container = stage.container().getBoundingClientRect()
  let left: number
  let top: number

  if (getRectWidth() >= 0) {
    left = container.left + getRectX()
  } else {
    left = container.left + getRectX() - toolbarWidth
  }

  if (getRectHeight() >= 0) {
    top = container.top + getRectHeight() + getRectY() + 20
  } else {
    top = container.top + getRectY() + 20
  }

  if (left < container.left) left = container.left
  if (left > container.left + stage.width() - toolbarWidth) left = container.left + stage.width() - toolbarWidth
  if (top < container.top) top = container.top
  if (top > container.top + stage.height()) top = container.top + stage.height()

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
  if (rect) {
    rect.off('mouseenter')
    rect.off('mouseleave')
  }
}

export default {
  name: 'crop',
  iconfont: 'iconfont icon-cut',
  title: '图片裁剪',
  params: [],
  onClick: ({stage}) => {
    stage.container().style.cursor = 'crosshair'
  },
  onDrawStart: ({stage}) => {
    if (document.getElementById('react-img-editor-crop-toolbar')) return
    isPaint = true

    const startPos = stage.getPointerPosition()

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
      x: startPos.x,
      y: startPos.y,
      fill: '#FFF',
      draggable: true,
      globalCompositeOperation: 'destination-out',
    })
    rect.on('mouseenter', function() {
      stage.container().style.cursor = 'move'
    })
    rect.on('mouseleave', function() {
      stage.container().style.cursor = 'default'
    })

    virtualLayer.add(rect)

    virtualLayer.draw()
  },
  onDraw: ({stage}) => {
    if (!isPaint) return
    if (document.getElementById('react-img-editor-crop-toolbar')) return

    const endPos = stage.getPointerPosition()

    // 绘制初始裁剪区域
    rect.width(endPos.x - getRectX())
    rect.height(endPos.y - getRectY())
    rect.dragBoundFunc((pos: any) => {
      let x = pos.x
      let y = pos.y

      if (transformer.width() >= 0) {
        if (pos.x <= 0) x = 0
        if (pos.x >= stage.width() - transformer.width()) x = stage.width() - transformer.width()
      } else {
        if (pos.x >= stage.width()) x = stage.width()
        if (pos.x <= - transformer.width()) x = - transformer.width()
      }

      if (transformer.height() >= 0) {
        if (pos.y <= 0) y = 0
        if (pos.y >= stage.height() - transformer.height()) y = stage.height() - transformer.height()
      } else {
        if (pos.y >= stage.height()) y = stage.height()
        if (pos.y <= - transformer.height()) y = - transformer.height()
      }

      adjustToolbarPosition(stage)
      return {x, y}
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
    transformer = new Konva.Transformer({
      node: rect,
      ...transformerStyle,
      boundBoxFunc: function(oldBox: any, newBox: any) {
        let x = newBox.x
        let y = newBox.y
        let width = newBox.width
        let height = newBox.height

        if (newBox.width >= 0) {
          if (newBox.x <= 0) {
            x = 0
            width = newBox.width + newBox.x
          }

          if (newBox.x >= stage.width() - newBox.width) {
            width = stage.width() - oldBox.x
          }
        } else {
          if (newBox.x >= stage.width()) {
            x = stage.width()
            width = newBox.width + (newBox.x - stage.width())
          }

          if (newBox.x <= - newBox.width) {
            width = - oldBox.x
          }
        }

        if (newBox.height >= 0) {
          if (newBox.y <= 0) {
            y = 0
            height = newBox.height + newBox.y
          }

          if (newBox.y >= stage.height() - newBox.height) {
            height = stage.height() - oldBox.y
          }
        } else {
          if (newBox.y >= stage.height()) {
            y = stage.height()
            height = newBox.height + (newBox.y - stage.height())
          }

          if (newBox.y <= - newBox.height) {
            height = - oldBox.y
          }
        }


        adjustToolbarPosition(stage)
        return {x, y, width, height} as any
      },
    })
    virtualLayer.add(transformer)
    virtualLayer.draw()

    createCropToolbar(function () {
      // 裁剪区域太小不允许裁剪
      if (getRectWidth() < 2 || getRectHeight() < 2) return

      // 提前清除拉伸框
      virtualLayer.remove(transformer)
      const dataURL = stage.toDataURL({
        x: getRectX(),
        y: getRectY(),
        width: getRectWidth(),
        height: getRectHeight(),
        pixelRatio,
        mimeType: 'image/jpeg',
      })
      const imageObj = new Image()
      imageObj.onload = function() {
        reload(imageObj, getRectWidth(), getRectHeight())
        reset()
      }
      imageObj.src = dataURL
      stage.container().style.cursor = 'crosshair'
    }, () => {
      reset()
      stage.container().style.cursor = 'crosshair'
    })
    adjustToolbarPosition(stage)
  },
  onLeave: ({stage}) => {
    reset()
    stage.container().style.cursor = 'default'
  },
}  as PluginProps