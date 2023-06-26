
import { DrawEventParams, PluginParamValue } from '../common/type'
import Plugin from './Plugin'

export default class ZoomIn extends Plugin {
  name = 'zoomIn'
  iconfont = 'iconfont icon-zoomIn'
  title = '放大'
  defaultParamValue = {
    zoomRatio: 0.2,
  } as PluginParamValue

  onEnter = (drawEventParams: DrawEventParams) => {
    const {imageElement, imageLayer, paramValue} = drawEventParams

    const zoomRatio = (paramValue && paramValue.zoomRatio) ? paramValue.zoomRatio : this.defaultParamValue.zoomRatio || 0

    imageElement.scale({
      x: imageElement.scaleX() * (1 + zoomRatio),
      y: imageElement.scaleY() * (1 + zoomRatio),
    })

    imageElement.x(imageElement.width() / 2)
    imageElement.y(imageElement.height() / 2)
    imageElement.offsetX(imageElement.width() / 2)
    imageElement.offsetY(imageElement.height() / 2)
    imageElement.draggable(true)

    imageLayer.draw()
  }

  onLeave = (drawEventParams: DrawEventParams) => {
    const {imageLayer, imageElement} = drawEventParams
    imageElement.draggable(false)
    imageLayer.draw()
  }
}