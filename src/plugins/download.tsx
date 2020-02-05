
import { PluginProps } from '../type'

export default {
  name: 'download',
  iconfont: 'iconfont icon-download',
  title: '下载图片',
  onClick: ({stage, pixelRatio}) => {
    const link = document.createElement('a')
    link.download = ''
    link.href = stage.toDataURL({pixelRatio, mimeType: 'image/jpeg'})
    link.click()
  },
}  as PluginProps