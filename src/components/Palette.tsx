import Konva from 'konva'
import React, { useEffect, useRef } from 'react'
import { PluginProps, PluginParamValue } from '../type'
import { prefixCls } from '../constants'

interface PaletteProps {
  width: number;
  height: number;
  imageObj: HTMLImageElement;
  currentPlugin: PluginProps | null;
  currentPluginParamValue: PluginParamValue | null;
}

Konva.pixelRatio = 1 // TODO: 临时修复 getImageData 的 bug

export default function Palette(props: PaletteProps) {
  const style = {
    width: props.width,
    height: props.height,
  }

  const hRatio = props.width / props.imageObj.naturalWidth
  const vRatio = props.height / props.imageObj.naturalHeight
  const ratio  = Math.min (hRatio, vRatio)
  const canvasWidth = props.imageObj.naturalWidth * ratio
  const canvasHeight = props.imageObj.naturalHeight * ratio

  const stageRef = useRef<any>(null)
  const imageRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const imageData = useRef<any>(null)
  const historyStack = useRef<any[]>([])

  function initPalette() {
    stageRef.current = new Konva.Stage({
      container: 'react-image-editor',
      width: canvasWidth,
      height: canvasHeight,
    })
    const $konvaContent = document.querySelector('.konvajs-content')
    const $placeholder = document.createElement('div')
    $placeholder.id = 'react-image-editor-inner-placeholder'
    $konvaContent?.appendChild($placeholder)
  }

  function drawImage() {
    const img = new Konva.Image({
      x: 0,
      y: 0,
      image: props.imageObj,
      width: canvasWidth,
      height: canvasHeight,
    })

    const imageLayer = new Konva.Layer({
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
    })
    stageRef.current.add(imageLayer)
    imageLayer.add(img)
    imageLayer.draw()
    imageRef.current = imageLayer
    const ctx = imageLayer.getContext()
    imageData.current = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
  }

  function reload(imgObj: any, width: number, height: number) {
    historyStack.current = []
    stageRef.current = new Konva.Stage({
      container: 'react-image-editor',
      width: width,
      height: height,
    })
    const $konvaContent = document.querySelector('.konvajs-content')
    const $placeholder = document.createElement('div')
    $placeholder.id = 'react-image-editor-inner-placeholder'
    $konvaContent?.appendChild($placeholder)

    const img = new Konva.Image({
      x: 0,
      y: 0,
      image: imgObj,
      width: width,
      height: height,
    })

    const imageLayer = new Konva.Layer({
      x: 0,
      y: 0,
      width: width,
      height: height,
    })
    stageRef.current.add(imageLayer)
    imageLayer.add(img)
    imageLayer.draw()
    imageRef.current = imageLayer
    const ctx = imageLayer.getContext()
    imageData.current = ctx.getImageData(0, 0, width, height)

    layerRef.current = new Konva.Layer()
    stageRef.current.add(layerRef.current)
  }

  function bindEvents() {
    if (!stageRef.current) return

    stageRef.current.add(layerRef.current)

    stageRef.current.on('mousedown touchstart', () => {
      const { currentPlugin, currentPluginParamValue } = props

      if (currentPlugin && currentPlugin.onDrawStart) {
        currentPlugin.onDrawStart({
          stage: stageRef.current,
          layer: layerRef.current,
          paramValue: currentPluginParamValue,
          imageData: imageData.current,
          reload,
          historyStack: historyStack.current,
        })
      }
    })

    stageRef.current.on('mousemove touchmove', () => {
      const { currentPlugin, currentPluginParamValue } = props

      if (currentPlugin && currentPlugin.onDraw) {
        currentPlugin.onDraw({
          stage: stageRef.current,
          layer: layerRef.current,
          paramValue: currentPluginParamValue,
          imageData: imageData.current,
          reload,
          historyStack: historyStack.current,
        })
      }
    })

    stageRef.current.on('mouseup touchend', () => {
      const { currentPlugin, currentPluginParamValue } = props

      if (currentPlugin && currentPlugin.onDrawEnd) {
        currentPlugin.onDrawEnd({
          stage: stageRef.current,
          layer: layerRef.current,
          paramValue: currentPluginParamValue,
          imageData: imageData.current,
          reload,
          historyStack: historyStack.current,
        })
      }
    })
  }

  function removeEvents() {
    if (!stageRef.current) return

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
      })
    }
  }, [props.currentPlugin])

  return (
    <div className={`${prefixCls}-palette`} style={style}>
      <div id={prefixCls} />
    </div>
  )
}