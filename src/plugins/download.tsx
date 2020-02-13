
import { PluginProps } from '../type'

export default {
  name: 'download',
  iconfont: 'iconfont icon-download',
  title: '下载图片',
  onEnter: ({stage, pixelRatio}) => {
    const canvas = stage.toCanvas({ pixelRatio })
    canvas.toBlob(function(blob: any) {
      const link = document.createElement('a')
      link.download = ''
      link.href = URL.createObjectURL(blob)
      link.click()
    }, 'image/jpeg')
  },
}  as PluginProps