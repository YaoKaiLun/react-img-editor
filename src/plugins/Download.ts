
import { DrawEventPramas } from '../common/type'
import Plugin from './Plugin'

export default class Download extends Plugin {
  name = 'download'
  iconfont = 'iconfont icon-download'
  title = '下载图片'

  onEnter = (drawEventPramas: DrawEventPramas) => {
    const {stage, pixelRatio} = drawEventPramas
    // 延迟下载，等触发 plugin 的 onLeave 生命周期，清除未完成的现场
    setTimeout(() => {
      const canvas = stage.toCanvas({ pixelRatio })
      canvas.toBlob(function(blob: any) {
        const link = document.createElement('a')
        link.download = ''
        link.href = URL.createObjectURL(blob)
        link.click()
      }, 'image/jpeg')
    }, 100)
  }
}