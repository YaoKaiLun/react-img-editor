import Konva from 'konva'
import React, { useEffect, useRef } from 'react'
import { PluginProps, PluginParamValue, DrawEventPramas } from '../type'
import { prefixCls } from '../constants'

interface PaletteProps {
  width: number;
  height: number;
  imageObj: HTMLImageElement;
  currentPlugin: PluginProps | null;
  currentPluginParamValue: PluginParamValue | null;
  getStage?: (stage: any) => void;
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
  const canvasWidth = imageNatureWidth * scaleRatio
  const canvasHeight = imageNatureHeight * scaleRatio
  const stageRef = useRef<any>(null)
  const imageRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const imageData = useRef<any>(null)
  const historyStack = useRef<any[]>([])
  const pixelRatio = 1 / scaleRatio
  Konva.pixelRatio = pixelRatio

  function initPalette() {
    stageRef.current = new Konva.Stage({
      container: 'react-img-editor',
      width: canvasWidth,
      height: canvasHeight,
    })
    props.getStage && props.getStage(stageRef.current)
  }

  function generateImageData(imgObj: any, width: number, height: number) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(imgObj, 0, 0, width, height)
    return ctx.getImageData(0, 0, width, height)
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
    imageLayer.add(img)
    imageLayer.draw()
    imageRef.current = imageLayer

    imageData.current = generateImageData(props.imageObj, canvasWidth, canvasHeight)
  }

  function reload(imgObj: any, width: number, height: number) {
    historyStack.current = []
    stageRef.current = new Konva.Stage({
      container: 'react-img-editor',
      width: width,
      height: height,
    })
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
  }

  function bindEvents() {
    if (!stageRef.current) return

    stageRef.current.add(layerRef.current)

    const { currentPlugin, currentPluginParamValue } = props
    const drawEventPramas: DrawEventPramas = {
      stage: stageRef.current,
      layer: layerRef.current,
      paramValue: currentPluginParamValue,
      imageData: imageData.current,
      reload,
      historyStack: historyStack.current,
      pixelRatio,
    }

    stageRef.current.on('click tap', (e: any) => {
      // 修复 stage 上元素双击事件不起作用
      if (e.target instanceof Konva.Text) return

      if (currentPlugin && currentPlugin.onStageClcik) {
        currentPlugin.onStageClcik(drawEventPramas)
      }
    })

    stageRef.current.on('mousedown touchstart', () => {
      if (currentPlugin && currentPlugin.onDrawStart) {
        currentPlugin.onDrawStart(drawEventPramas)
      }
    })

    stageRef.current.on('mousemove touchmove', () => {
      if (currentPlugin && currentPlugin.onDraw) {
        currentPlugin.onDraw(drawEventPramas)
      }
    })

    stageRef.current.on('mouseup touchend', () => {
      if (currentPlugin && currentPlugin.onDrawEnd) {
        currentPlugin.onDrawEnd(drawEventPramas)
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

  useEffect(() => {
    initPalette()
    drawImage()
    layerRef.current = new Konva.Layer()
    stageRef.current.add(layerRef.current)
  }, [])

  useEffect(() => {
    bindEvents()
    return () => {
      removeEvents()
    }
  }, [props.imageObj, props.currentPlugin, props.currentPluginParamValue])

  useEffect(() => {
    const { currentPlugin, currentPluginParamValue } = props
    if (currentPlugin && currentPlugin.onClick) {
      currentPlugin.onClick({
        stage: stageRef.current,
        layer: layerRef.current,
        imageData: imageData.current,
        reload,
        paramValue: currentPluginParamValue,
        historyStack: historyStack.current,
        pixelRatio,
      })
    }
  }, [props.currentPlugin])

  return (
    <div className={`${prefixCls}-palette`} style={style}>
      <div id={prefixCls} />
    </div>
  )
}