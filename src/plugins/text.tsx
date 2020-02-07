import Konva from 'konva'
import { PluginProps } from '../type'

const defalutParamValue = {
  fontSize: 12,
  color: '#F5222D',
}

let isFocus = false

export default {
  name: 'text',
  iconfont: 'iconfont icon-text',
  title: '插入文字',
  params: ['fontSize', 'color'],
  defalutParamValue,
  onClick: ({stage}) => {
    stage.container().style.cursor = 'text'
  },
  onStageClcik: ({stage, layer, paramValue}) => {
    if (isFocus) return

    const fontSize = (paramValue && paramValue.fontSize) ? paramValue.fontSize : defalutParamValue.fontSize
    const color = (paramValue && paramValue.color) ? paramValue.color : defalutParamValue.color
    const startPos = stage.getPointerPosition()
    const textNode = new Konva.Text({
      text: '请输入',
      x: startPos.x,
      y: startPos.y - 10, // fix konvajs incorrect position of text
      fontSize,
      draggable: true,
      fill: color,
      padding: 3,
      lineHeight: 1.2,
    })
    textNode.on('mouseenter', function() {
      stage.container().style.cursor = 'move'
    })
    textNode.on('mouseleave', function() {
      stage.container().style.cursor = 'text'
    })

    // 由于 konvajs 的文本渲染和浏览器渲染的样式不一致，所以使用 Transformer 的边框来代替 textarea 自身的边框
    const transformer = new Konva.Transformer({
      node: textNode,
      enabledAnchors: [],
      rotateEnabled: false,
      borderStroke: color,
    })
    transformer.hide()

    layer.add(textNode)
    layer.add(transformer)
    layer.draw()

    textNode.on('dblclick dbltap', function(e) {
      e.cancelBubble = true
      isFocus = true
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      const container = stage.container().getBoundingClientRect()
      textarea.value = textNode.text()
      textarea.style.position = 'absolute'
      textarea.style.left = container.left + textNode.x() + 'px'
      textarea.style.top = container.top + textNode.y() + 15 + 'px'
      textarea.style.width = textNode.width() - 5 + 'px'
      textarea.style.height = textNode.height() - 5 + 'px'
      textarea.style.lineHeight = String(textNode.lineHeight())
      textarea.style.padding = textNode.padding() + 'px'
      textarea.style.margin = '0px'
      textarea.style.fontSize = textNode.fontSize() + 'px'
      textarea.style.color = textNode.fill()
      textarea.style.fontFamily = textNode.fontFamily()
      textarea.style.border = 'none'
      textarea.style.outline = 'none'
      textarea.style.overflow = 'hidden'
      textarea.style.background = 'none'
      textarea.style.resize = 'none'
      textarea.style.zIndex = '1000'
      textarea.style.boxSizing = 'content-box'
      textarea.focus()

      textNode.hide()
      transformer.show()
      layer.draw()

      textarea.addEventListener('keyup', function(e: any) {
        textNode.text(e.target.value)
        layer.draw()
        textarea.style.width = textNode.width() + 'px'
        textarea.style.height = textNode.height() + 'px'
      })

      textarea.addEventListener('blur', function () {
        setTimeout(() => {
          isFocus = false
        }, 100)

        textNode.text(textarea.value)
        textarea.parentNode!.removeChild(textarea)
        transformer.hide()
        textNode.show()
        layer.draw()
      })
    })
  },
  onLeave: ({stage}) => {
    stage.container().style.cursor = 'default'
  },
}  as PluginProps