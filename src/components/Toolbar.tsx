import ParamSetting from './ParamSetting'
import React from 'react'
import Tooltip from 'rc-tooltip'
import { PluginProps, PluginParamValue } from '../type'
import { prefixCls } from '../constants'
import 'rc-tooltip/assets/bootstrap.css'

interface ToolbarProps {
  width: number;
  plugins: PluginProps[];
  toolbar: {
    items: string[];
  };
  currentPlugin: PluginProps | null;
  currentPluginParamValue: PluginParamValue | null;
  handlePluginChange: (plugin: PluginProps) => void;
  handlePluginParamValueChange: (paramValue: PluginParamValue) => void;
}

export default function Toolbar(props: ToolbarProps) {
  const { plugins } = props
  const style = {
    width: props.width,
  }

  function renderPlugin(plugin: PluginProps) {
    const isActivated = !!(props.currentPlugin && props.currentPlugin.name === plugin.name)
    const paramNames = props.currentPlugin ? props.currentPlugin.params : []

    if (!paramNames) {
      return (
        <span
          key={plugin.name}
          className={`${prefixCls}-toolbar-icon ${isActivated ? 'activated' : ''}`}
          title={plugin.name}
        >
          <i className={plugin.iconfont} onClick={() => props.handlePluginChange(plugin)} />
        </span>
      )
    }

    return (
      <Tooltip
        placement="top"
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
        align={{offset: [0, -15]}}
      >
        <span
          key={plugin.name}
          className={`${prefixCls}-toolbar-icon ${isActivated ? 'activated' : ''}`}
          title={plugin.name}
        >
          <i className={plugin.iconfont} onClick={() => props.handlePluginChange(plugin)} />
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