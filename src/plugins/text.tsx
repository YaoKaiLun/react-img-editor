import Konva from 'konva'
import { PluginProps } from '../type'

const defalutParamValue = {
  fontSize: 12,
  color: '#df4b26',
}

let isFocus = false

export default {
  name: 'text',
  iconfont: 'iconfont icon-text',
  params: ['fontSize', 'color'],
  onStageClcik: ({stage, layer, paramValue}) => {
    if (isFocus) return

    const fontSize = (paramValue && paramValue.fontSize) ? paramValue.fontSize : defalutParamValue.fontSize
    const lineHeight = fontSize + 8
    const color = (paramValue && paramValue.color) ? paramValue.color : defalutParamValue.color
    const pos = stage.getPointerPosition()

    const textNode = new Konva.Text({
      text: '请输入',
      x: pos.x,
      y: pos.y,
      fontSize,
      draggable: true,
      fill: color,
    })

    layer.add(textNode)
    layer.draw()

    textNode.on('dblclick dbltap', function(e) {
      e.cancelBubble = true
      isFocus = true
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      const container = stage.container().getBoundingClientRect()
      textarea.value = textNode.text()
      textarea.style.position = 'absolute'
      textarea.style.top = container.top + textNode.y() + 'px'
      textarea.style.left = container.left + textNode.x() + 'px'
      textarea.style.fontSize = fontSize + 'px'
      textarea.style.width = (textNode.width() + 8) + 'px'
      textarea.style.lineHeight = lineHeight + 'px'
      textarea.style.height = (textNode.height() + 8) + 'px'
      textarea.style.border = '2px solid red'
      textarea.style.outline = 'none'
      textarea.style.color = color
      textarea.style.overflow = 'hidden'
      textarea.style.background = 'none'
      textarea.style.resize = 'none'
      textarea.focus()
      textNode.hide()
      layer.draw()

      textarea.addEventListener('keyup', function(e: any) {
        const rows: string[] = e.target.value.split(/[(\r\n)\r\n]+/)

        if (e.keyCode === 13) {
          textarea.style.height = rows.length * lineHeight + 'px'
        }

        const dom = document.createElement('span')
        dom.style.display = 'inline-block'
        dom.style.visibility = 'hidden'
        dom.style.fontSize = fontSize + 'px'
        document.body.appendChild(dom)

        const rowLengths = rows.map(row => {
          dom.innerText = row
          return dom.clientWidth
        })
        const width = Math.max(...rowLengths)
        document.body.removeChild(dom)
        textarea.style.width = (width + 8) + 'px'
      })

      textarea.addEventListener('blur', function () {
        setTimeout(() => {
          isFocus = false
        }, 100)

        textNode.text(textarea.value)
        textNode.width(textarea.clientWidth)
        textNode.height(textarea.clientHeight)
        textarea.parentNode!.removeChild(textarea)
        textNode.show()
        layer.draw()
      })
    })
  },
}  as PluginProps