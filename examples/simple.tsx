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
    const dataURL = stageRef.current.toDataURL({ pixelRatio: window.devicePixelRatio })
    const link = document.createElement('a')
    link.download = 'download.png'
    link.href = dataURL
    link.click()
  }

  const image1 = 'https://cstore-public.seewo.com/faq-service/4e3f2924f1d4432f82e760468bf680f0'
  // const image2 = 'https://cvte-dev-public.seewo.com/faq-service-test/4db524ec93324794b983bf7cd78b2ae1'
  // const image3 = 'https://cvte-dev-public.seewo.com/faq-service-test/bfdcc5337dfb43ce823a4c9743aba99c'

  return (
    <>
      <ReactImgEditor
        src={image1}
        width={736}
        height={414}
        plugins={[]}
        getStage={setStage}
        defaultPluginName="circle"
      />
      <div style={{ marginTop: '50px' }}>
        <button onClick={downloadImage}>download</button>
      </div>
    </>
  )
}

ReactDOM.render(<Example />, document.getElementById('__react-content'))