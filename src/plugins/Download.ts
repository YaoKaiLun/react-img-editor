import { DrawEventParams } from '../common/type'
import { LocaleKey } from '../common/i18n'
import Plugin from './Plugin'

export default class Download extends Plugin {
  name = 'download'
  iconfont = 'iconfont icon-download'
  title = '下载图片'
  titleKey = 'download' as LocaleKey
  disappearImmediately = true

  onEnter = (drawEventParams: DrawEventParams) => {
    const { stage, pixelRatio, imageElement } = drawEventParams
    const config = this.config || {}
    const mimeType = config.mimeType || 'image/jpeg'
    const quality = config.quality !== undefined ? config.quality : 0.92
    const fileName = config.fileName || ''

    setTimeout(() => {
      const canvas = stage.toCanvas({
        pixelRatio,
        width: imageElement.width(),
        height: imageElement.height(),
      })
      canvas.toBlob(function(blob: any) {
        const link = document.createElement('a')
        link.download = fileName
        link.href = URL.createObjectURL(blob)
        link.click()
      }, mimeType, quality)
    }, 100)
  }
}
