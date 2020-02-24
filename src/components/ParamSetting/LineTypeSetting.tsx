import React from 'react'
import { prefixCls } from '../../common/constants'

interface LineTypeSettingProps {
  value?: string;
  onChange: (lineType: 'solid' | 'dash') => void;
}

export default function LineTypeSetting(props: LineTypeSettingProps) {
  return (
    <>
      <i
        className={`iconfont icon-line2 ${prefixCls}-line-type
          ${props.value === 'solid' ? prefixCls + '-line-type-activated' : ''}`}
        onClick={() => props.onChange('solid')}
      />
      <i
        className={`iconfont icon-dotted-line ${prefixCls}-line-type
          ${props.value === 'dash' ? prefixCls + '-line-type-activated' : ''}`}
        onClick={() => props.onChange('dash')}
      />
    </>
  )
}