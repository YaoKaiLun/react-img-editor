import React from 'react'
import { prefixCls } from '../../constants'

interface ColorSettingProps {
  value?: string;
  onChange: (color: string) => void;
}

const colors = ['#F5222D', '#FFEB00', '#007CFF', '#52C51A ', '#19191A']

export default function ColorSetting(props: ColorSettingProps) {
  return (
    <>
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
    </>
  )
}