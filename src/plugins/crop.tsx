import Konva from 'konva'
import React from 'react'
import ReactDOM from 'react-dom'
import { PluginProps } from '../type'
import { transformerStyle } from '../constants'

const initRectWidth = 100
const initRectHeight = 100
const initRectX = 0
const initRectY = 0
const toolbarDistance = 20
let virtualLayer: any = null
let rectWidth = initRectWidth
let rectHeight = initRectHeight
let rectX = initRectX
let rectY = initRectY

const style = {
  wrapper: {
    background: '#FFF',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.15)',
    width: '285px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
  },
  cancelBtn: {
    display: 'inline-block',
    width: '32px',
    height: '24px',
    lineHeight: '24px',
    background: '#FFF',
    border: '1px solid #C9C9D0',
    borderRadius: '2px',
    textAlign: 'center' as const,
    margin: '0 8px 0 16px',
    cursor: 'pointer',
  },
  sureBtn: {
    display: 'inline-block',
    width: '32px',
    height: '24px',
    lineHeight: '24px',
    background: '#007AFF',
    border: '1px solid #C9C9D0',
    borderRadius: '2px',
    color: '#FFF',
    textAlign: 'center' as const,
    cursor: 'pointer',
  },
}

function adjustToolbarPosition() {
  const $placeholder = document.getElementById('react-img-editor-inner-placeholder')!
  $placeholder.style.left = `${rectX}px`
  $placeholder.style.top = `${rectHeight + rectY + toolbarDistance}px`
}

export default {
  name: 'crop',
  iconfont: 'iconfont icon-cut',
  onClick: ({stage, imageData, reload}) => {
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
        adjustToolbarPosition()
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
          adjustToolbarPosition()
          return oldBox
        }

        rectWidth = newBox.width
        rectHeight = newBox.height
        rectX = newBox.x
        rectY = newBox.y
        adjustToolbarPosition()
        return newBox
      },
    })
    virtualLayer.add(transformer)

    const $placeholder = document.getElementById('react-img-editor-inner-placeholder')!
    $placeholder.style.position = 'absolute'
    $placeholder.style.zIndex = '1'

    function cropImage() {
      virtualLayer.destroy()

      const dataURL = stage.toDataURL({
        x: rectX,
        y: rectY,
        width: rectWidth,
        height: rectHeight,
        pixelRatio: 2,
      })
      const imageObj = new Image()
      imageObj.onload = function() {
        reload(imageObj, rectWidth, rectHeight)
      }
      imageObj.src = dataURL
    }

    const ToolbarWrapper = (
      <div style={{ ...style.wrapper }}>
        拖动边框调整图片显示范围
        <span style={style.cancelBtn}>×</span>
        <span style={style.sureBtn} onClick={cropImage}>√</span>
      </div>
    )

    ReactDOM.render(ToolbarWrapper, $placeholder)

    adjustToolbarPosition()

    stage.add(virtualLayer)
  },
}  as PluginProps