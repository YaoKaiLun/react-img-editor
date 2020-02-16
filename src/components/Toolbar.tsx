import ParamSetting from './ParamSetting'
import Plugin from '../plugins/Plugin'
import React from 'react'
import Tooltip from 'rc-tooltip'
import { PluginParamValue } from '../type'
import { prefixCls } from '../constants'
import 'rc-tooltip/assets/bootstrap_white.css'

interface ToolbarProps {
  width: number;
  plugins: Plugin[];
  toolbar: {
    items: string[];
  };
  currentPlugin: Plugin | null;
  currentPluginParamValue: PluginParamValue | null;
  handlePluginChange: (plugin: Plugin) => void;
  handlePluginParamValueChange: (paramValue: PluginParamValue) => void;
}

export default function Toolbar(props: ToolbarProps) {
  const { plugins } = props
  const style = {
    width: props.width,
  }

  function renderPlugin(plugin: Plugin) {
    const isActivated = !!(props.currentPlugin && props.currentPlugin.name === plugin.name)
    const paramNames = props.currentPlugin ? props.currentPlugin.params : []

    if (!paramNames || paramNames.length === 0) {
      return (
        <span
          key={plugin.name}
          className={`${prefixCls}-toolbar-icon ${isActivated ? 'activated' : ''}`}
        >
          <i title={plugin.title} className={plugin.iconfont} onClick={() => props.handlePluginChange(plugin)} />
        </span>
      )
    }

    return (
      <Tooltip
        key={plugin.name}
        placement="bottom"
        trigger="click"
        overlay={(
          <ParamSetting
            paramNames={paramNames}
            paramValue={props.currentPluginParamValue}
            onChange={props.handlePluginParamValueChange}
          />
        )}
        visible={isActivated}
        overlayClassName={`${prefixCls}-tooltip`}
        arrowContent={<div className="rc-tooltip-arrow-inner"></div>}
      >
        <span
          key={plugin.name}
          className={`${prefixCls}-toolbar-icon ${isActivated ? 'activated' : ''}`}
        >
          <i title={plugin.title} className={plugin.iconfont} onClick={() => props.handlePluginChange(plugin)} />
        </span>
      </Tooltip>
    )
  }

  return (
    <div className={`${prefixCls}-toolbar`} style={style}>
      {
        props.toolbar.items.map(item => {
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