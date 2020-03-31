import Konva from 'konva'
import Plugin from './Plugin'
import PubSub from '../common/PubSub'
import { DrawEventParams, PluginParamValue, PluginParamName } from '../common/type'
import { transformerStyle } from '../common/constants'
import { uuid } from '../common/utils'

export default class Text extends Plugin {
  name = 'text'
  iconfont = 'iconfont icon-text'
  title = '插入文字'
  params = ['fontSize', 'color'] as PluginParamName[]
  defaultParamValue = {
    fontSize: 12,
    color: '#F5222D',
  } as PluginParamValue
  shapeName = 'text'

  transformer: any = null
  selectedNode: any = null

  removeTextareaBlurModal = () => {
    const textareaBlurModal = document.getElementById('textareaBlurModal')
    if (textareaBlurModal) {
      textareaBlurModal.removeEventListener('click', this.removeTextareaBlurModal)
      document.body.removeChild(textareaBlurModal)
    }
  }

  // 防止 textarea blur 时触发 stage click 事件
  addTextareaBlurModal = (stage: any) => {
    if (document.getElementById('textareaBlurModal')) return

    const container = stage.container().getBoundingClientRect()
    const textareaBlurModal = document.createElement('div')
    textareaBlurModal.id = 'textareaBlurModal'
    textareaBlurModal.style.position = 'fixed'
    textareaBlurModal.style.left = container.left + 'px'
    textareaBlurModal.style.top = container.top + 'px'
    textareaBlurModal.style.width = container.width + 'px'
    textareaBlurModal.style.height = container.height + 'px'
    textareaBlurModal.style.zIndex = '999'

    document.body.appendChild(textareaBlurModal)

    textareaBlurModal.addEventListener('click', this.removeTextareaBlurModal)
  }

  createTextarea = (stage: any, drawLayer: any, transformer: any, textNode: any, pubSub: PubSub) => {
    const textarea = document.createElement('textarea')
    textarea.value = textNode.text()
    textarea.style.position = 'absolute'
    textarea.style.left = textNode.x() + 'px'
    textarea.style.top = textNode.y() + 'px'
    textarea.style.width = textNode.width() + 'px'
    textarea.style.height = textNode.height() + 'px'
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

    textarea.addEventListener('keyup', (e: any) => {
      textNode.text(e.target.value)
      drawLayer.draw()
      textarea.style.width = textNode.width() + 'px'
      textarea.style.height = textNode.height() + 'px'
    })

    textarea.addEventListener('blur', () => {
      if (textarea.value !== '') {
        textNode.text(textarea.value)
        transformer.hide()
        textNode.show()
      } else {
        textNode.destroy()
        transformer.destroy()
      }

      textarea.parentNode!.removeChild(textarea)
      drawLayer.draw()
      this.removeTextareaBlurModal()
      pubSub.pub('PUSH_HISTORY', textNode)
    })

    return textarea
  }

  enableTransform = (drawEventParams: DrawEventParams, node: any) => {
    const {stage, drawLayer} = drawEventParams

    if (!this.transformer) {
      this.transformer = new Konva.Transformer({ ...transformerStyle, enabledAnchors: [], padding: 2 })
      drawLayer.add(this.transformer)
      this.transformer.attachTo(node)
      node.on('mouseenter', function() {
        stage.container().style.cursor = 'move'
      })
      node.on('mouseleave', function() {
        stage.container().style.cursor = 'text'
      })
      stage.container().style.cursor = 'move'
    }

    node && node.draggable(true)
    drawLayer.draw()
  }

  disableTransform = (drawEventParams: DrawEventParams, node: any, remove?: boolean) => {
    const {stage, drawLayer, pubSub} = drawEventParams

    if (this.transformer) {
      this.transformer.remove()
      this.transformer = null
    }

    if (node) {
      node.draggable(false)
      node.off('mouseenter')
      node.off('mouseleave')
      stage.container().style.cursor = 'text'

      if (remove) {
        node.hide()
        // 使用隐藏节点占位并覆盖堆栈中已有节点
        pubSub.pub('PUSH_HISTORY', node)
        node.remove()
        node.remove()
      }
    }

    this.selectedNode = null
    drawLayer.draw()
  }

  onEnter = (drawEventParams: DrawEventParams) => {
    const {stage, drawLayer} = drawEventParams
    const container = stage.container()
    container.style.cursor = 'text'
    container.tabIndex = 1 // make it focusable
    container.focus()
    container.addEventListener('keyup', (e: any) => {
      if (e.key === 'Backspace' && this.selectedNode) {
        this.disableTransform(drawEventParams, this.selectedNode, true)
        drawLayer.draw()
      }
    })
  }

  onClick = (drawEventParams: DrawEventParams) => {
    const {event, stage, drawLayer, paramValue, pubSub} = drawEventParams

    if (event.target.name && event.target.name() === 'text') {
      // 之前没有选中节点或者在相同节点之间切换点击
      if (!this.selectedNode || this.selectedNode._id !== event.target._id) {
        this.selectedNode && this.disableTransform(drawEventParams, this.selectedNode)
        this.enableTransform(drawEventParams, event.target)
        this.selectedNode = event.target
      }
      return
    } else if (this.selectedNode) {
      this.disableTransform(drawEventParams, this.selectedNode)
      return
    }

    const fontSize = (paramValue && paramValue.fontSize) ? paramValue.fontSize : this.defaultParamValue.fontSize
    const color = (paramValue && paramValue.color) ? paramValue.color : this.defaultParamValue.color
    const startPos = stage.getPointerPosition()

    if (!startPos) return

    const textNode = new Konva.Text({
      id: uuid(),
      name: 'text',
      x: startPos.x,
      y: startPos.y - 10, // fix konvajs incorrect position of text
      fontSize,
      fill: color,
      padding: 3,
      lineHeight: 1.1,
    })
    textNode.on('dragend', function() {
      pubSub.pub('PUSH_HISTORY', this)
    })

    // 由于 konvajs 的文本渲染和浏览器渲染的样式不一致，所以使用 Transformer 的边框来代替 textarea 自身的边框
    const textareaTransformer = new Konva.Transformer({
      node: textNode as any,
      enabledAnchors: [],
      rotateEnabled: false,
      borderStroke: color,
    })

    drawLayer.add(textNode)
    drawLayer.add(textareaTransformer)
    textNode.hide()
    drawLayer.draw()

    const textarea = this.createTextarea(stage, drawLayer, textareaTransformer, textNode, pubSub)
    stage.container().appendChild(textarea)
    textarea.focus()
    this.addTextareaBlurModal(stage)

    textNode.on('dblclick dbltap', (e) => {
      // dblclick 前会触发两次 onClick 事件，因此要清楚 onClick 事件里的状态
      this.disableTransform(drawEventParams, this.selectedNode)

      e.cancelBubble = true
      const textarea = this.createTextarea(stage, drawLayer, textareaTransformer, textNode, pubSub)
      stage.container().appendChild(textarea)
      textarea.focus()
      textNode.hide()
      textareaTransformer.show()
      drawLayer.draw()
      this.addTextareaBlurModal(stage)
    })
  }

  onLeave = (drawEventParams: DrawEventParams) => {
    const {stage} = drawEventParams
    stage.container().style.cursor = 'default'
    this.removeTextareaBlurModal()
    this.disableTransform(drawEventParams, this.selectedNode)
  }

  onNodeRecreate = (drawEventParams: DrawEventParams, node: any) => {
    const {pubSub} = drawEventParams
    node.on('dragend', function() {
      pubSub.pub('PUSH_HISTORY', this)
    })
  }
}