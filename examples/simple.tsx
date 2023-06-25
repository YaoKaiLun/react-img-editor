import React, { useRef } from 'react'
import ReactDOM from 'react-dom'
import ReactImgEditor from '../src/index'
import '../assets/index.less'

function Example() {
  const stageRef = useRef<any>(null)

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

  const image1 = 'https://pro-cos-public.seewo.com/seewo-school/7614707e9bfe42f1bfa3bf7fb9d71844'
  // const image2 = 'https://cvte-dev-public.seewo.com/faq-service-test/4db524ec93324794b983bf7cd78b2ae1'
  // const image3 = 'https://cvte-dev-public.seewo.com/faq-service-test/bfdcc5337dfb43ce823a4c9743aba99c'
  // const image4 = 'https://cvte-dev-public.seewo.com/faq-service-test/bc87ceeb7b1a473da41e025e656af966'

  return (
    <>
      <ReactImgEditor
        src={image1}
        width={736}
        height={414}
        getStage={setStage}
        defaultPluginName="text"
        crossOrigin="anonymous"
        toolbar={{
          items: ['pen', 'eraser', 'arrow', 'rect', 'circle', 'mosaic', 'text', '|', 'repeal', 'download', 'crop',
            '|', 'zoomIn', 'zoomOut'],
        }}
      />
      <div style={{ marginTop: '50px' }}>
        <button onClick={downloadImage}>download</button>
      </div>
    </>
  )
}

ReactDOM.render(<Example />, document.getElementById('__react-content'))