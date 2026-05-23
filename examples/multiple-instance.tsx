import React from 'react'
import ReactDOM from 'react-dom'
import ReactImgEditor from '../src/index'
import '../assets/index.less'

function MultipleInstance() {
  const image1 = 'https://picsum.photos/id/237/800/500'
  const image2 = 'https://picsum.photos/id/0/800/500'

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