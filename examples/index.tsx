import React, { useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import ReactImageEditor from '../src/index'
import '../assets/index.less'

function Example() {
  const [isLoading, setIsLoading] = useState(true)
  const stageRef = useRef<any>(null)

  const imageObj = new Image()
  imageObj.onload = () => {
    setIsLoading(false)
  }
  imageObj.crossOrigin = 'anonymous'
  imageObj.src = 'https://cstore-public.seewo.com/faq-service/4e3f2924f1d4432f82e760468bf680f0'

  if (isLoading) {
    return null
  }

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

  return (
    <>
      <ReactImageEditor imageObj={imageObj} plugins={[]} getStage={setStage} />
      <div>
        <button onClick={downloadImage}>download</button>
      </div>
    </>
  )
}

ReactDOM.render(<Example />, document.getElementById('__react-content'))