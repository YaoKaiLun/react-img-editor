import React, { useContext } from 'react'
import { prefixCls } from '../../common/constants'
import { EditorContext } from '../EditorContext'

interface FontSizeSettingProps {
  value?: number;
  onChange: (fontSize: number) => void;
}

export default function FontSizeSetting(props: FontSizeSettingProps) {
  const { t } = useContext(EditorContext)

  return (
    <span style={{ margin: '0 8px' }}>
      <button
        className={`${prefixCls}-font-size ${props.value === 12 ? prefixCls + '-font-size-activated' : ''}`}
        onClick={() => props.onChange(12)}
      >{t('fontSizeSmall')}</button>
      <button
        className={`${prefixCls}-font-size ${props.value === 16 ? prefixCls + '-font-size-activated' : ''}`}
        onClick={() => props.onChange(16)}
      >{t('fontSizeMedium')}</button>
      <button
        className={`${prefixCls}-font-size ${props.value === 20 ? prefixCls + '-font-size-activated' : ''}`}
        onClick={() => props.onChange(20)}
      >{t('fontSizeLarge')}</button>
    </span>
  )
}
