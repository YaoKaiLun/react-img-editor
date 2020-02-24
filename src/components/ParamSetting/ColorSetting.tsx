import React from 'react'
import { prefixCls } from '../../common/constants'

interface ColorSettingProps {
  value?: string;
  onChange: (color: string) => void;
}

const colors = ['#F5222D', '#FFEB00', '#00B4FF', '#52C51A ', '#19191A', '#FFFFFF']

export default function ColorSetting(props: ColorSettingProps) {
  return (
    <span style={{ margin: '0 8px', fontSize: 0 }}>
      {
        colors.map(color => {
          return (
            <span
              key={color}
              className={`${prefixCls}-color-square ${props.value === color ? prefixCls + '-color-square-activated' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => props.onChange(color)}
            />
          )
        })
      }
    </span>
  )
}