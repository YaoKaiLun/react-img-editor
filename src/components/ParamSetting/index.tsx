import ColorSetting from './ColorSetting'
import FontSizeSetting from './FontSizeSetting'
import LineTypeSetting from './LineTypeSetting'
import React from 'react'
import StrokeWidthSetting from './StrokeWidthSetting'
import { PluginParamName, PluginParamValue } from '../../common/type'
import { prefixCls } from '../../common/constants'

interface ParamSettingProps {
  paramNames: PluginParamName[];
  paramValue: PluginParamValue | null;
  onChange: (value: PluginParamValue) => void;
}

export default function ParamSetting(props: ParamSettingProps) {
  function handleStrokeWidthChange(strokeWidth: number) {
    props.onChange({ ...props.paramValue, strokeWidth })
  }

  function handleLineTypeChange(lineType: 'solid' | 'dash') {
    props.onChange({ ...props.paramValue, lineType })
  }

  function handleColorChange(color: string) {
    props.onChange({ ...props.paramValue, color })
  }

  function handleFontSizeChange(fontSize: number) {
    props.onChange({ ...props.paramValue, fontSize })
  }

  function renderParamComponent(paramName: PluginParamName) {
    switch (paramName) {
      case 'strokeWidth':
        return (
          <StrokeWidthSetting
            key="stroke-width-setting"
            value={props.paramValue ? props.paramValue['strokeWidth'] : undefined}
            onChange={handleStrokeWidthChange}
          />
        )
      case 'lineType':
        return (
          <LineTypeSetting
            key="line-type-setting"
            value={props.paramValue ? props.paramValue['lineType'] : undefined}
            onChange={handleLineTypeChange}
          />
        )
      case 'color':
        return (
          <ColorSetting
            key="color-setting"
            value={props.paramValue ? props.paramValue['color'] : undefined}
            onChange={handleColorChange}
          />
        )
      case 'fontSize':
        return (
          <FontSizeSetting
            key="font-size-setting"
            value={props.paramValue ? props.paramValue['fontSize'] : undefined}
            onChange={handleFontSizeChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={`${prefixCls}-param-setting`}>
      {
        props.paramNames.map(paramName => (
          renderParamComponent(paramName)
        ))
      }
    </div>
  )
}