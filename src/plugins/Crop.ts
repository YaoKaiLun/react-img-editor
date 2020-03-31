import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventParams } from '../common/type'
import { transformerStyle } from '../common/constants'
import { uuid } from '../common/utils'

const toolbarWidth = 275
const toolbarHeight = 40

export default class Crop extends Plugin {
  name = 'crop'
  iconfont = 'iconfont icon-cut'
  title = '图片裁剪'
  params = []

  isPaint = false
  virtualLayer: any = null
  rect: any = null
  transformer: any = null
  toolbarId = 'react-img-editor-crop-toolbar' + uuid()

  // 一直为正数
  getRectWidth = () => {
    return this.rect ? this.rect.getClientRect({skipTransform: false}).width : 0
  }

  // 一直为正数
  getRectHeight = () => {
    return this.rect ? this.rect.getClientRect({skipTransform: false}).height : 0
  }

  getRectX = () => {
    return this.rect ? this.rect.getClientRect({skipTransform: false}).x : 0
  }

  getRectY = () => {
    return this.rect ? this.rect.getClientRect({skipTransform: false}).y : 0
  }

  adjustToolbarPosition = (stage: any) => {
    // 需要考虑宽和高为负数的情况
    const $toolbar = document.getElementById(this.toolbarId)
    if (!$toolbar) return

    let left: number
    let top: number

    if (this.getRectWidth() >= 0) {
      left = this.getRectX()
    } else {
      left = this.getRectX() - toolbarWidth
    }

    if (this.getRectHeight() >= 0) {
      top = this.getRectHeight() + this.getRectY() + 20
    } else {
      top = this.getRectY() + 20
    }

    if (left < 0) left = 0
    if (left > stage.width() - toolbarWidth) left = stage.width() - toolbarWidth
    if (top < 0) top = 0
    if (top > stage.height()) top = stage.height()

    $toolbar.style.left = `${left}px`
    $toolbar.style.top = `${top}px`
  }

  createCropToolbar = (stage: any, sureBtnEvent: () => void, cancelBtnEvent: () => void) => {
    if (document.getElementById(this.toolbarId)) return

    const fragment = new DocumentFragment()

    // 创建截图工具栏
    const $cropToolbar = document.createElement('div')
    $cropToolbar.setAttribute('id', this.toolbarId)
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

    stage.container().appendChild(fragment)
  }

  reset = (stage: any) => {
    const $toolbar = document.getElementById(this.toolbarId)
    $toolbar && stage.container().removeChild($toolbar)
    this.virtualLayer && this.virtualLayer.remove()
    if (this.rect) {
      this.rect.off('mouseenter')
      this.rect.off('mouseleave')
    }
  }

  onEnter = (drawEventParams: DrawEventParams) => {
    const {stage} = drawEventParams
    stage.container().style.cursor = 'crosshair'
  }

  onDrawStart = (drawEventParams: DrawEventParams) => {
    const {stage} = drawEventParams
    const startPos = stage.getPointerPosition()
    // 当鼠标移出 stage 时，不会触发 mouseup，重新回到 stage 时，会重新触发 onDrawStart，这里就是为了防止重新触发 onDrawStart
    if (this.isPaint || !startPos) return

    if (document.getElementById(this.toolbarId)) return
    this.isPaint = true

    this.virtualLayer = new Konva.Layer()
    stage.add(this.virtualLayer)
    this.virtualLayer.setZIndex(2)

    // 绘制透明黑色遮罩
    const maskRect = new Konva.Rect({
      globalCompositeOperation: 'source-over',
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
      fill: 'rgba(0, 0, 0, .6)',
    })

    this.virtualLayer.add(maskRect)

    this.rect = new Konva.Rect({
      x: startPos.x,
      y: startPos.y,
      fill: '#FFF',
      draggable: true,
      globalCompositeOperation: 'destination-out',
    })
    this.rect.on('mouseenter', function() {
      stage.container().style.cursor = 'move'
    })
    this.rect.on('mouseleave', function() {
      stage.container().style.cursor = 'default'
    })

    this.virtualLayer.add(this.rect)

    this.virtualLayer.draw()
  }

  onDraw = (drawEventParams: DrawEventParams) => {
    const {stage} = drawEventParams
    const endPos = stage.getPointerPosition()

    if (!this.isPaint || !endPos) return
    if (document.getElementById(this.toolbarId)) return

    // 绘制初始裁剪区域
    this.rect.width(endPos.x - this.getRectX())
    this.rect.height(endPos.y - this.getRectY())
    this.rect.dragBoundFunc((pos: any) => {
      let x = pos.x
      let y = pos.y

      if (this.transformer.width() >= 0) {
        if (pos.x <= 0) x = 0
        if (pos.x >= stage.width() - this.transformer.width()) x = stage.width() - this.transformer.width()
      } else {
        if (pos.x >= stage.width()) x = stage.width()
        if (pos.x <= - this.transformer.width()) x = - this.transformer.width()
      }

      if (this.transformer.height() >= 0) {
        if (pos.y <= 0) y = 0
        if (pos.y >= stage.height() - this.transformer.height()) y = stage.height() - this.transformer.height()
      } else {
        if (pos.y >= stage.height()) y = stage.height()
        if (pos.y <= - this.transformer.height()) y = - this.transformer.height()
      }

      this.adjustToolbarPosition(stage)
      return {x, y}
    })

    this.virtualLayer.draw()
  }

  onDrawEnd = (drawEventParams: DrawEventParams) => {
    const {stage, pixelRatio, reload} = drawEventParams

    if (!this.isPaint) {
      this.isPaint = false
      return
    }

    this.isPaint = false

    // 允许改变裁剪区域
    this.transformer = new Konva.Transformer({
      node: this.rect,
      ...transformerStyle,
      boundBoxFunc: (oldBox: any, newBox: any) => {
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


        this.adjustToolbarPosition(stage)
        return {x, y, width, height} as any
      },
    })
    this.virtualLayer.add(this.transformer)
    this.virtualLayer.draw()

    this.createCropToolbar(stage, () => {
      // 裁剪区域太小不允许裁剪
      if (this.getRectWidth() < 2 || this.getRectHeight() < 2) return

      // 提前清除拉伸框
      this.virtualLayer.remove(this.transformer)
      const dataURL = stage.toDataURL({
        x: this.getRectX(),
        y: this.getRectY(),
        width: this.getRectWidth(),
        height: this.getRectHeight(),
        pixelRatio,
        mimeType: 'image/jpeg',
      })
      const imageObj = new Image()
      imageObj.onload = () => {
        reload(imageObj, this.getRectWidth(), this.getRectHeight())
        this.reset(stage)
      }
      imageObj.src = dataURL
      stage.container().style.cursor = 'crosshair'
    }, () => {
      this.reset(stage)
      stage.container().style.cursor = 'crosshair'
    })
    this.adjustToolbarPosition(stage)
  }

  onLeave = (drawEventParams: DrawEventParams) => {
    const {stage} = drawEventParams
    this.reset(stage)
    stage.container().style.cursor = 'default'
    this.isPaint = false
  }
}