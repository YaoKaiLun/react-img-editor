import corePlugins from './plugins'
import Palette from './components/Palette'
import React, { useState } from 'react'
import Toolbar from './components/Toolbar'
import { PluginProps, PluginParamValue } from './type'

interface ReactImageEditorProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  plugins?: PluginProps[];
  toolbar?: {
    items: string[];
  };
  src: string;
  getStage?: (stage: any) => void;
}

export default function ReactImageEditor(props: ReactImageEditorProps) {
  const [imageObj, setImageObj] = useState<HTMLImageElement>(null)
  const image = new Image()
  image.onload = () => {
    setImageObj(image)
  }
  image.crossOrigin = 'anonymous'
  image.src = props.src

  const plugins = [...corePlugins, ...props.plugins!]
  let defaultPlugin = null
  for(let i = 0; i < plugins.length; i++) {
    if (props.toolbar && plugins[i].name === props.toolbar.items[0]) {
      defaultPlugin = plugins[i]
      break
    }
  }

  const [currentPlugin, setCurrentPlugin] = useState<PluginProps | null>(defaultPlugin)
  const [currentPluginParamValue, setCurrentPluginParamValue] = useState<PluginParamValue>({})

  function handlePluginChange(plugin: PluginProps) {
    setCurrentPlugin(plugin)
    if (plugin.onClick && !plugin.params) {
      setTimeout(() => {
        setCurrentPlugin(null)
      }, 1000)
    }
  }

  function handlePluginParamValueChange(value: PluginParamValue) {
    setCurrentPluginParamValue(value)
  }

  return (
    <div className="react-img-editor" style={props.style}>
      {
        imageObj ? (
          <>
            <Palette
              width={props.width!}
              height={props.height!}
              imageObj={imageObj}
              currentPlugin={currentPlugin}
              currentPluginParamValue={currentPluginParamValue}
              getStage={props.getStage}
            />
            <Toolbar width={props.width!}
              plugins={plugins!}
              toolbar={props.toolbar!}
              currentPlugin={currentPlugin}
              currentPluginParamValue={currentPluginParamValue}
              handlePluginChange={handlePluginChange}
              handlePluginParamValueChange={handlePluginParamValueChange}
            />
          </>
        ) : null
      }
    </div>
  )
}

ReactImageEditor.defaultProps = {
  width: 700,
  height: 500,
  style: {},
  plugins: [],
  toolbar: {
    items: ['arrow', 'rect', 'circle', 'mosaic', 'text', 'repeal', 'download', 'crop'],
  },
} as Partial<ReactImageEditorProps>