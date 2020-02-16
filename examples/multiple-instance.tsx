import React from 'react'
import ReactDOM from 'react-dom'
import ReactImgEditor from '../src/index'
import '../assets/index.less'

function MultipleInstance() {
  const image1 = 'https://cstore-public.seewo.com/faq-service/4e3f2924f1d4432f82e760468bf680f0'
  const image2 = 'https://cvte-dev-public.seewo.com/faq-service-test/4db524ec93324794b983bf7cd78b2ae1'

  return (
    <div style={{display: 'flex'}}>
      <ReactImgEditor
        src={image1}
        width={500}
        height={414}
        plugins={[]}
        defaultPluginName="text"
      />
      <ReactImgEditor
        src={image2}
        width={500}
        height={414}
        plugins={[]}
        defaultPluginName="rect"
      />
    </div>
  )
}

ReactDOM.render(<MultipleInstance />, document.getElementById('__react-content'))