
import { DrawEventPramas } from '../common/type'
import Plugin from './Plugin'

export default class Download extends Plugin {
  name = 'download'
  iconfont = 'iconfont icon-download'
  title = '下载图片'

  onEnter = (drawEventPramas: DrawEventPramas) => {
    const {stage, pixelRatio} = drawEventPramas
    const canvas = stage.toCanvas({ pixelRatio })
    canvas.toBlob(function(blob: any) {
      const link = document.createElement('a')
      link.download = ''
      link.href = URL.createObjectURL(blob)
      link.click()
    }, 'image/jpeg')
  }
}