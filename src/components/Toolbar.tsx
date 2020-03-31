import ParamSetting from './ParamSetting'
import Plugin from '../plugins/Plugin'
import React, { useContext } from 'react'
import Tooltip from 'rc-tooltip'
import { prefixCls } from '../common/constants'
import { EditorContext } from './EditorContext'
import 'rc-tooltip/assets/bootstrap_white.css'

export default function Toolbar() {
  const {
    containerWidth,
    plugins,
    toolbar,
    currentPlugin,
    paramValue,
    handlePluginChange,
    handlePluginParamValueChange,
    toolbarItemConfig,
  } = useContext(EditorContext)

  const style = { width: containerWidth }

  function renderPlugin(plugin: Plugin) {
    const isActivated = !!(currentPlugin && currentPlugin.name === plugin.name)
    const paramNames = currentPlugin ? currentPlugin.params : []
    const isDisabled = toolbarItemConfig[plugin.name].disable

    if (!paramNames || paramNames.length === 0) {
      return (
        <span
          key={plugin.name}
          className={`${prefixCls}-toolbar-icon ${isActivated ? 'activated' : ''} ${isDisabled ? 'disabled' : ''}`}
        >
          <i title={plugin.title} className={plugin.iconfont} onClick={() => handlePluginChange(plugin)} />
        </span>
      )
    }

    return (
      <Tooltip
        key={plugin.name}
        placement="bottom"
        overlay={(
          <ParamSetting
            paramNames={paramNames}
            paramValue={paramValue}
            onChange={handlePluginParamValueChange}
          />
        )}
        visible={isActivated}
        overlayClassName={`${prefixCls}-tooltip`}
        arrowContent={<div className="rc-tooltip-arrow-inner"></div>}
      >
        <span
          key={plugin.name}
          className={`${prefixCls}-toolbar-icon ${isActivated ? 'activated' : ''} ${isDisabled ? 'disabled' : ''}`}
        >
          <i title={plugin.title} className={plugin.iconfont} onClick={() => handlePluginChange(plugin)} />
        </span>
      </Tooltip>
    )
  }

  return (
    <div className={`${prefixCls}-toolbar`} style={style}>
      {
        toolbar.items.map(item => {
          if (item === '|') return <span className={`${prefixCls}-toolbar-separator`} />
          for(let i = 0; i < plugins.length; i++) {
            if (plugins[i].name === item) {
              return renderPlugin(plugins[i])
            }
          }
          return null
        })
      }
    </div>
  )
}