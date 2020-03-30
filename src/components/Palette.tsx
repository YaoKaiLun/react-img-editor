import Konva from 'konva'
import PubSub from '../common/PubSub'
import React from 'react'
import { EditorContextProps,  withEditorContext } from './EditorContext'
import { DrawEventPramas } from '../common/type'
import { prefixCls } from '../common/constants'
import { uuid } from '../common/utils'
import { Stage } from 'konva/types/Stage'
import { Layer } from 'konva/types/Layer'

interface PaletteProps extends EditorContextProps {
  height: number;
  imageObj: HTMLImageElement;
  getStage?: (stage: any) => void;
}

class Palette extends React.Component<PaletteProps> {
  containerId = prefixCls + uuid()
  canvasWidth: number
  canvasHeight: number
  pixelRatio: number
  stage: Stage | null = null
  imageLayer: Layer | null = null
  drawLayer: Layer | null = null
  imageData: ImageData | null = null
  historyStack: any[] = []
  pubSub: InstanceType<typeof PubSub>

  constructor(props: PaletteProps) {
    super(props)

    const { containerWidth, imageObj } = props

    const imageNatureWidth = imageObj.naturalWidth
    const imageNatureHeight = imageObj.naturalHeight
    const wRatio = containerWidth / imageNatureWidth
    const hRatio = props.height / imageNatureHeight
    const scaleRatio  = Math.min (wRatio, hRatio, 1)

    this.canvasWidth = Math.round(imageNatureWidth * scaleRatio)
    this.canvasHeight = Math.round(imageNatureHeight * scaleRatio)
    this.pixelRatio = 1 / scaleRatio

    Konva.pixelRatio = this.pixelRatio

    this.pubSub = new PubSub(this.containerId)
    this.subHistoryStack()
  }

  componentDidMount() {
    this.init()

    const { currentPlugin } = this.props
    if (currentPlugin && currentPlugin.onEnter) {
      currentPlugin.onEnter(this.getDrawEventPramas(null))
    }
  }

  componentDidUpdate(prevProps: PaletteProps) {
    const prevCurrentPlugin = prevProps.currentPlugin
    const { currentPlugin } = this.props

    // 撤销等操作，点击后会再自动清除当前插件
    if (currentPlugin !== prevCurrentPlugin) {
      if (currentPlugin) {
        this.bindEvents()

        if (currentPlugin.onEnter) {
          currentPlugin.onEnter(this.getDrawEventPramas(null))
        }
      }

      if (prevCurrentPlugin && prevCurrentPlugin.onLeave) {
        prevCurrentPlugin.onLeave(this.getDrawEventPramas(null))
      }
    }
  }

  componentWillUnmount() {
    const { currentPlugin } = this.props
    currentPlugin && currentPlugin.onLeave && currentPlugin.onLeave(this.getDrawEventPramas(null))
  }

  init = () => {
    const { getStage, imageObj } = this.props

    this.stage = new Konva.Stage({
      container: this.containerId,
      width: this.canvasWidth,
      height: this.canvasHeight,
    })

    getStage && getStage(this.resetStage(this.stage!))

    const img = new Konva.Image({
      x: 0,
      y: 0,
      image: imageObj,
      width: this.canvasWidth,
      height: this.canvasHeight,
    })
    this.imageLayer = new Konva.Layer()
    this.stage.add(this.imageLayer)
    this.imageLayer.setZIndex(0)
    this.imageLayer.add(img)
    this.imageLayer.draw()

    this.imageData = this.generateImageData(imageObj, this.canvasWidth, this.canvasHeight)

    this.drawLayer = new Konva.Layer()
    this.stage.add(this.drawLayer)
    this.bindEvents()
  }

  // 裁剪等操作执行后需要重新初始化
  reload = (imgObj: any, width: number, height: number) => {
    const { getStage } = this.props

    this.removeEvents()
    this.historyStack = []
    this.stage = new Konva.Stage({
      container: this.containerId,
      width: width,
      height: height,
    })

    getStage && getStage(this.resetStage(this.stage!))

    const img = new Konva.Image({
      x: 0,
      y: 0,
      image: imgObj,
      width: width,
      height: height,
    })

    this.imageLayer = new Konva.Layer()
    this.stage.add(this.imageLayer)
    this.imageLayer.add(img)
    this.imageLayer.draw()

    this.imageData = this.generateImageData(imgObj, width, height)

    this.drawLayer = new Konva.Layer()
    this.stage.add(this.drawLayer)
    this.bindEvents()
  }

  resetStage = (stage: Stage) => {
    // @ts-ignore
    stage._pixelRatio = this.pixelRatio
    // @ts-ignore
    stage.clearAndToCanvas = (config: any) => {
      const { currentPlugin } = this.props
      currentPlugin && currentPlugin.onLeave && currentPlugin.onLeave(this.getDrawEventPramas(null))
      return stage.toCanvas(config)
    }
    return stage
  }

  bindEvents = () => {
    if (!this.stage || !this.drawLayer) return

    const { plugins, currentPlugin, handlePluginChange } = this.props
    this.removeEvents()
    this.stage.add(this.drawLayer)
    this.drawLayer.setZIndex(1)

    this.stage.on('click tap', (e: any) => {
      if (e.target.name && e.target.name()) {
        const name = e.target.name()
        for (let i = 0; i < plugins.length; i++) {
          // 点击具体图形，会切到对应的插件去
          if (plugins[i].shapeName && plugins[i].shapeName === name
            && (!currentPlugin || !currentPlugin.shapeName || name !== currentPlugin.shapeName)) {
            ((event: any) => {
              setTimeout(() => {
                plugins[i].onClick && plugins[i].onClick!(this.getDrawEventPramas(event))
              })
            })(e)
            handlePluginChange(plugins[i])
            return
          }
        }
      }

      if (currentPlugin && currentPlugin.onClick) {
        currentPlugin.onClick(this.getDrawEventPramas(e))
      }
    })

    this.stage.on('mousedown touchstart', (e: any) => {
      if (currentPlugin && currentPlugin.onDrawStart) {
        currentPlugin.onDrawStart(this.getDrawEventPramas(e))
      }
    })

    this.stage.on('mousemove touchmove', (e: any) => {
      if (currentPlugin && currentPlugin.onDraw) {
        currentPlugin.onDraw(this.getDrawEventPramas(e))
      }
    })

    this.stage.on('mouseup touchend', (e: any) => {
      if (currentPlugin && currentPlugin.onDrawEnd) {
        currentPlugin.onDrawEnd(this.getDrawEventPramas(e))
      }
    })
  }

  removeEvents = () => {
    if (!this.stage) return

    this.stage.off('click tap')
    this.stage.off('mousedown touchstart')
    this.stage.off('mousemove touchmove')
    this.stage.off('mouseup touchend')
  }

  subHistoryStack = () => {
    this.pubSub.sub('PUSH_HISTORY', (_: any, node: any) => {
      const { toolbarItemConfig, updateToolbarItemConfig } = this.props
      // 撤销按钮更新为激活状态
      if (this.historyStack.length === 0) {
        const newToolbarItemConfig = { ...toolbarItemConfig }
        if (newToolbarItemConfig.repeal) {
          newToolbarItemConfig.repeal.disable = false
          updateToolbarItemConfig(newToolbarItemConfig)
        }
      }
      this.historyStack.push(node.toObject())
    })

    // 仅接收状态，不实际 pop history
    this.pubSub.sub('POP_HISTORY', (_: any, historyStack: any[]) => {
      const { toolbarItemConfig, updateToolbarItemConfig } = this.props
      if (historyStack.length === 0) {
        const newToolbarItemConfig = { ...toolbarItemConfig }
        if (newToolbarItemConfig.repeal) {
          newToolbarItemConfig.repeal.disable = true
          updateToolbarItemConfig(newToolbarItemConfig)
        }
      }
    })
  }

  // 主要用于在马赛克时，进行图片像素处理
  generateImageData = (imgObj: any, width: number, height: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx!.drawImage(imgObj, 0, 0, width, height)
    return ctx!.getImageData(0, 0, width, height)
  }

  // 生命周期的统一参数生成函数
  getDrawEventPramas = (e: any) => {
    const props = this.props
    const drawEventPramas: DrawEventPramas = {
      event: e,
      stage: this.stage!,
      imageLayer: this.imageLayer!,
      drawLayer: this.drawLayer!,
      imageData: this.imageData!,
      reload: this.reload,
      historyStack: this.historyStack,
      pixelRatio: this.pixelRatio,
      pubSub: this.pubSub,
      // editor context
      containerWidth: props.containerWidth,
      containerHeight: props.containerHeight,
      plugins: props.plugins,
      toolbar: props.toolbar,
      currentPlugin: props.currentPlugin,
      handlePluginChange: props.handlePluginChange,
      paramValue: props.paramValue,
      handlePluginParamValueChange: props.handlePluginParamValueChange,
      toolbarItemConfig: props.toolbarItemConfig,
      updateToolbarItemConfig: props.updateToolbarItemConfig,
    }

    return drawEventPramas
  }

  render() {
    const { height } = this.props
    const { containerWidth } = this.context
    const style = {
      width: containerWidth,
      height: height, // 高度是用户设置的高度减掉工具栏的高度
    }

    return (
      <div className={`${prefixCls}-palette`} style={style}>
        <div id={this.containerId} className={`${prefixCls}-container`} />
      </div>
    )
  }
}

export default withEditorContext(Palette)