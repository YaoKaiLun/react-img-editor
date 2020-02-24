import React from 'react'
import { prefixCls } from '../../common/constants'

interface StrokeWidthSettingProps {
  value?: number;
  onChange: (strokeWidth: number) => void;
}

export default function StrokeWidthSetting(props: StrokeWidthSettingProps) {
  return (
    <>
      <span
        className={`${prefixCls}-stroke-circle ${prefixCls}-stroke-circle-small
          ${props.value === 2 ? prefixCls + '-stroke-circle-activated' : ''}`}
        onClick={() => props.onChange(2)}
      />
      <span
        className={`${prefixCls}-stroke-circle ${prefixCls}-stroke-circle-medium
          ${props.value === 6 ? prefixCls + '-stroke-circle-activated' : ''}`}
        onClick={() => props.onChange(6)}
      />
      <span
        className={`${prefixCls}-stroke-circle ${prefixCls}-stroke-circle-large
          ${props.value === 8 ? prefixCls + '-stroke-circle-activated' : ''}`}
        onClick={() => props.onChange(8)}
      />
    </>
  )
}