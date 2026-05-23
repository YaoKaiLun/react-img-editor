import Arrow from './Arrow'
import Circle from './Circle'
import Crop from './Crop'
import Download from './Download'
import Eraser from './Eraser'
import Mosaic from './Mosaic'
import Pen from './Pen'
import Rect from './Rect'
import Repeal from './Repeal'
import Text from './Text'
import ZoomIn from './ZoomIn'
import ZoomOut from './ZoomOut'
import { PluginConfig } from '../common/type'

export default class PluginFactory {
  plugins: import('./Plugin').default[]

  constructor(pluginConfig?: PluginConfig) {
    this.plugins = [
      new Arrow(),
      new Circle(),
      new Crop(),
      new Download(),
      new Eraser(),
      new Mosaic(),
      new Pen(),
      new Rect(),
      new Repeal(),
      new Text(),
      new ZoomIn(),
      new ZoomOut(),
    ]

    if (pluginConfig) {
      this.plugins.forEach(plugin => {
        if (pluginConfig[plugin.name]) {
          plugin.applyConfig(pluginConfig[plugin.name])
        }
      })
    }
  }
}
