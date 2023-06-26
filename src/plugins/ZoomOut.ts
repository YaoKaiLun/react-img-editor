
import { DrawEventParams, PluginParamValue } from '../common/type'
import Plugin from './Plugin'

export default class ZoomOut extends Plugin {
  name = 'zoomOut'
  iconfont = 'iconfont icon-zoomOut'
  title = '缩小'
  defaultParamValue = {
    zoomRatio: 0.2,
  } as PluginParamValue

  onEnter = (drawEventParams: DrawEventParams) => {
    const {imageLayer, imageElement, paramValue} = drawEventParams

    const zoomRatio = (paramValue && paramValue.zoomRatio) ? paramValue.zoomRatio : this.defaultParamValue.zoomRatio || 0

    imageLayer.scale({
      x: imageLayer.scaleX() * (1 - zoomRatio),
      y: imageLayer.scaleY() * (1 - zoomRatio),
    })

    imageLayer.x(imageLayer.width() / 2)
    imageLayer.y(imageLayer.height() / 2)
    imageLayer.offsetX(imageLayer.width() / 2)
    imageLayer.offsetY(imageLayer.height() / 2)
    imageElement.draggable(true)
    imageLayer.draw()
  }

  onLeave = (drawEventParams: DrawEventParams) => {
    const {imageLayer, imageElement} = drawEventParams
    imageElement.draggable(false)
    imageLayer.draw()
  }
}