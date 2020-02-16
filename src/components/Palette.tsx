import Konva from 'konva'
import React, { useEffect, useRef } from 'react'
import { PluginProps, PluginParamValue, DrawEventPramas } from '../type'
import { prefixCls } from '../constants'
import plugins from '../plugins'

interface PaletteProps {
  width: number;
  height: number;
  imageObj: HTMLImageElement;
  plugins: PluginProps[];
  currentPlugin: PluginProps | null;
  currentPluginParamValue: PluginParamValue | null;
  getStage?: (stage: any) => void;
  handlePluginChange: (plugin: PluginProps) => void;
}

export default function Palette(props: PaletteProps) {
  const style = {
    width: props.width,
    height: props.height,
  }

  const imageNatureWidth = props.imageObj.naturalWidth
  const imageNatureHeight = props.imageObj.naturalHeight
  const wRatio = props.width / imageNatureWidth
  const hRatio = props.height / imageNatureHeight
  const scaleRatio  = Math.min (wRatio, hRatio, 1)
  const canvasWidth = Math.round(imageNatureWidth * scaleRatio)
  const canvasHeight = Math.round(imageNatureHeight * scaleRatio)
  const stageRef = useRef<any>(null)
  const imageRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const imageData = useRef<any>(null)
  const historyStack = useRef<any[]>([])
  const pixelRatio = 1 / scaleRatio
  Konva.pixelRatio = pixelRatio
  const currentPluginRef = useRef(props.currentPlugin)

  function initPalette() {
    stageRef.current = new Konva.Stage({
      container: 'react-img-editor',
      width: canvasWidth,
      height: canvasHeight,
    })
    stageRef.current._pixelRatio = pixelRatio
    props.getStage && props.getStage(stageRef.current)
  }

  function generateImageData(imgObj: any, width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx!.drawImage(imgObj, 0, 0, width, height)
    return ctx!.getImageData(0, 0, width, height)
  }

  function drawImage() {
    const img = new Konva.Image({
      x: 0,
      y: 0,
      image: props.imageObj,
      width: canvasWidth,
      height: canvasHeight,
    })

    const imageLayer = new Konva.Layer()
    stageRef.current.add(imageLayer)
    imageLayer.setZIndex(0)
    imageLayer.add(img)
    imageLayer.draw()
    imageRef.current = imageLayer

    imageData.current = generateImageData(props.imageObj, canvasWidth, canvasHeight)
  }

  function getDrawEventPramas(e: any) {
    const drawEventPramas: DrawEventPramas = {
      stage: stageRef.current,
      imageLayer: imageRef.current,
      layer: layerRef.current,
      paramValue: props.currentPluginParamValue,
      imageData: imageData.current,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      reload,
      historyStack: historyStack.current,
      pixelRatio,
      event: e,
      plugins: props.plugins,
    }

    return drawEventPramas
  }

  function bindEvents() {
    if (!stageRef.current) return

    stageRef.current.add(layerRef.current)
    layerRef.current.setZIndex(1)

    const { currentPlugin } = props

    stageRef.current.on('click tap', (e: any) => {
      if (e.target.name && e.target.name()) {
        const name = e.target.name()
        for (let i = 0; i < props.plugins.length; i++) {
          // 点击具体图形，会切到对应的插件去
          if (plugins[i].shapeName
            && plugins[i].shapeName === name
            && (!currentPlugin || !currentPlugin.shapeName || name !== currentPlugin.shapeName)) {
            (function(event: any) {
              setTimeout(() => {
                if (plugins[i].onClick) {
                  plugins[i].onClick(getDrawEventPramas(event))
                }
              })
            })(e)
            props.handlePluginChange(plugins[i])
            return
          }
        }
      }

      // 修复 stage 上元素双击事件不起作用
      // if (e.target instanceof Konva.Text) return

      if (currentPlugin && currentPlugin.onClick) {
        currentPlugin.onClick(getDrawEventPramas(e))
      }
    })

    stageRef.current.on('mousedown touchstart', (e: any) => {
      if (currentPlugin && currentPlugin.onDrawStart) {
        currentPlugin.onDrawStart(getDrawEventPramas(e))
      }
    })

    stageRef.current.on('mousemove touchmove', (e: any) => {
      if (currentPlugin && currentPlugin.onDraw) {
        currentPlugin.onDraw(getDrawEventPramas(e))
      }
    })

    stageRef.current.on('mouseup touchend', (e: any) => {
      if (currentPlugin && currentPlugin.onDrawEnd) {
        currentPlugin.onDrawEnd(getDrawEventPramas(e))
      }
    })
  }

  function removeEvents() {
    if (!stageRef.current) return

    stageRef.current.off('click tap')
    stageRef.current.off('mousedown touchstart')
    stageRef.current.off('mousemove touchmove')
    stageRef.current.off('mouseup touchend')
  }

  function reload(imgObj: any, width: number, height: number) {
    removeEvents()
    historyStack.current = []
    stageRef.current = new Konva.Stage({
      container: 'react-img-editor',
      width: width,
      height: height,
    })
    stageRef.current._pixelRatio = pixelRatio
    props.getStage && props.getStage(stageRef.current)

    const img = new Konva.Image({
      x: 0,
      y: 0,
      image: imgObj,
      width: width,
      height: height,
    })

    const imageLayer = new Konva.Layer()
    stageRef.current.add(imageLayer)
    imageLayer.add(img)
    imageLayer.draw()
    imageRef.current = imageLayer
    imageData.current = generateImageData(imgObj, width, height)

    layerRef.current = new Konva.Layer()
    stageRef.current.add(layerRef.current)
    bindEvents()
  }

  useEffect(() => {
    initPalette()
    drawImage()
    layerRef.current = new Konva.Layer()
    stageRef.current.add(layerRef.current)

    return () => {
      const currentPlugin = currentPluginRef.current
      // unMount 时清除插件数据
      currentPlugin && currentPlugin.onLeave && currentPlugin.onLeave(getDrawEventPramas(null))
    }
  }, [])

  useEffect(() => {
    bindEvents()
    return () => {
      removeEvents()
    }
  }, [props.imageObj, props.currentPlugin, props.currentPluginParamValue])

  useEffect(() => {
    const prevCurrentPlugin = currentPluginRef.current
    if (props.currentPlugin && prevCurrentPlugin &&
      props.currentPlugin.name !== prevCurrentPlugin.name && props.currentPlugin.params) {
      prevCurrentPlugin.onLeave && prevCurrentPlugin.onLeave(getDrawEventPramas(null))
    }

    if (props.currentPlugin && props.currentPlugin.onEnter) {
      props.currentPlugin.onEnter(getDrawEventPramas(null))
    }

    currentPluginRef.current = props.currentPlugin
  }, [props.currentPlugin])

  return (
    <div className={`${prefixCls}-palette`} style={style}>
      <div id={prefixCls} />
    </div>
  )
}