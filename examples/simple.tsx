import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import ReactImgEditor from '../src/index'
import { Locale } from '../src/common/i18n'
import '../assets/index.less'

const images = [
  'https://picsum.photos/id/237/800/500',
  'https://picsum.photos/id/0/800/500',
  'https://picsum.photos/id/10/800/500',
  'https://picsum.photos/id/292/800/500',
]

const locales: Locale[] = ['zh-CN', 'en']
const localeLabels: Record<Locale, string> = {
  'zh-CN': '中文',
  'en': 'English',
}

function Example() {
  const stageRef = useRef<any>(null)
  const [imageIndex, setImageIndex] = useState(0)
  const [locale, setLocale] = useState<Locale>('zh-CN')

  function setStage(stage) {
    stageRef.current = stage
  }

  function downloadImage() {
    const canvas = stageRef.current.clearAndToCanvas({ pixelRatio: stageRef.current._pixelRatio })
    canvas.toBlob(function(blob: any) {
      const link = document.createElement('a')
      link.download = ''
      link.href = URL.createObjectURL(blob)
      link.click()
    }, 'image/jpeg')
  }

  function switchImage() {
    setImageIndex((imageIndex + 1) % images.length)
  }

  function switchLocale() {
    const currentIndex = locales.indexOf(locale)
    setLocale(locales[(currentIndex + 1) % locales.length])
  }

  return (
    <>
      <ReactImgEditor
        src={images[imageIndex]}
        width={736}
        height={414}
        getStage={setStage}
        defaultPluginName="text"
        crossOrigin="anonymous"
        locale={locale}
        pluginConfig={{
          download: { mimeType: 'image/png', quality: 1, fileName: 'edited-image.png' },
          pen: { defaultParamValue: { color: '#F5222D', strokeWidth: 2 } },
        }}
        toolbar={{
          items: ['pen', 'eraser', 'arrow', 'rect', 'circle', 'mosaic', 'text', '|', 'repeal', 'download', 'crop',
            '|', 'zoomIn', 'zoomOut'],
        }}
      />
      <div style={{ marginTop: '50px' }}>
        <button onClick={downloadImage}>download</button>
        <button onClick={switchImage} style={{ marginLeft: '10px' }}>切换图片 ({imageIndex + 1}/{images.length})</button>
        <button onClick={switchLocale} style={{ marginLeft: '10px' }}>语言: {localeLabels[locale]}</button>
      </div>
    </>
  )
}

ReactDOM.render(<Example />, document.getElementById('__react-content'))
