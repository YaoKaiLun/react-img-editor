import Plugin from './plugins/Plugin'
import PluginFactory from './plugins/PluginFactory'
import Palette from './components/Palette'
import React, { useEffect, useState } from 'react'
import Toolbar from './components/Toolbar'
import { PluginParamValue } from './type'

interface ReactImageEditorProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  plugins?: Plugin[];
  toolbar?: {
    items: string[];
  };
  src: string;
  getStage?: (stage: any) => void;
  defaultPluginName?: string;
}

export default function ReactImageEditor(props: ReactImageEditorProps) {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const image = new Image()
    image.onload = () => {
      setImageObj(image)
    }
    image.crossOrigin = 'anonymous'
    image.src = props.src
  }, [props.src])

  const pluginFactory = new PluginFactory()
  const plugins = [...pluginFactory.plugins, ...props.plugins!]
  let defaultPlugin = null
  let defalutParamValue = {}
  for(let i = 0; i < plugins.length; i++) {
    if (props.defaultPluginName && props.toolbar && plugins[i].name === props.defaultPluginName) {
      defaultPlugin = plugins[i]

      if (defaultPlugin.defalutParamValue) {
        defalutParamValue = defaultPlugin.defalutParamValue
      }

      break
    }
  }

  const [currentPlugin, setCurrentPlugin] = useState<Plugin | null>(defaultPlugin)
  const [currentPluginParamValue, setCurrentPluginParamValue] = useState<PluginParamValue>(defalutParamValue)

  function handlePluginChange(plugin: Plugin) {
    setCurrentPlugin(plugin)
    plugin.defalutParamValue && setCurrentPluginParamValue(plugin.defalutParamValue)
    if (!plugin.params) {
      setTimeout(() => {
        setCurrentPlugin(null)
      })
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
              plugins={plugins!}
              currentPlugin={currentPlugin}
              currentPluginParamValue={currentPluginParamValue}
              getStage={props.getStage}
              handlePluginChange={handlePluginChange}
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
    items: ['pen', 'eraser', 'arrow', 'rect', 'circle', 'mosaic', 'text', 'repeal', 'download', 'crop'],
  },
} as Partial<ReactImageEditorProps>