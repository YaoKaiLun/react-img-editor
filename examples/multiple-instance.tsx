import React from 'react'
import ReactDOM from 'react-dom'
import ReactImgEditor from '../src/index'
import '../assets/index.less'

function MultipleInstance() {
  const image1 = 'https://pro-cos-public.seewo.com/seewo-school/7614707e9bfe42f1bfa3bf7fb9d71844'
  const image2 = 'https://pro-cos-public.seewo.com/seewo-school/1a18f6b98c2e4220a07592c83dc2d070'

  return (
    <div style={{display: 'flex'}}>
      <ReactImgEditor
        src={image1}
        width={500}
        height={414}
        plugins={[]}
        defaultPluginName="text"
        crossOrigin="anonymous"
      />
      <div style={{ width: '10px' }}></div>
      <ReactImgEditor
        src={image2}
        width={500}
        height={414}
        plugins={[]}
        defaultPluginName="rect"
        crossOrigin="anonymous"
      />
    </div>
  )
}

ReactDOM.render(<MultipleInstance />, document.getElementById('__react-content'))