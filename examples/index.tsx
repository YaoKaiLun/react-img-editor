import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import ReactImageEditor from '../src/index'
import '../assets/index.less'

function Example() {
  const [isLoading, setIsLoading] = useState(true)

  const imageObj = new Image()
  imageObj.onload = () => {
    setIsLoading(false)
  }
  imageObj.crossOrigin = 'anonymous'
  imageObj.src = 'https://cstore-public.seewo.com/faq-service/4e3f2924f1d4432f82e760468bf680f0'

  if (isLoading) {
    return null
  }

  return <ReactImageEditor imageObj={imageObj} plugins={[]} />
}

ReactDOM.render(<Example />, document.getElementById('__react-content'))