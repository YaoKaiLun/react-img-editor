
import { PluginProps } from '../type'

export default {
  name: 'download',
  iconfont: 'iconfont icon-download',
  onClick: ({stage}) => {
    const dataURL = stage.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = 'stage.png'
    link.href = dataURL
    link.click()
  },
}  as PluginProps