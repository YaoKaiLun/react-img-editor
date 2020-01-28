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
  imageObj: HTMLImageElement;
}

export default function ReactImageEditor(props: ReactImageEditorProps) {
  const plugins = [...corePlugins, ...props.plugins!]
  let defaultPlugin = null
  for(let i = 0; i < plugins.length; i++) {
    if (plugins[i].name === props.toolbar.items[0]) {
      defaultPlugin = plugins[i]
      break
    }
  }

  const [currentPlugin, setCurrentPlugin] = useState<PluginProps | null>(defaultPlugin)
  const [currentPluginParamValue, setCurrentPluginParamValue] = useState<PluginParamValue>({})

  function handlePluginChange(plugin: PluginProps) {
    setCurrentPlugin(plugin)
    if (plugin.onClick) {
      setTimeout(() => {
        setCurrentPlugin(null)
      }, 1000)
    }
  }

  function handlePluginParamValueChange(value: PluginParamValue) {
    setCurrentPluginParamValue(value)
  }

  return (
    <div className="react-image-editor" style={props.style}>
      <Palette
        width={props.width!}
        height={props.height!}
        imageObj={props.imageObj}
        currentPlugin={currentPlugin}
        currentPluginParamValue={currentPluginParamValue}
      />
      <Toolbar width={props.width!}
        plugins={plugins!}
        toolbar={props.toolbar!}
        currentPlugin={currentPlugin}
        currentPluginParamValue={currentPluginParamValue}
        handlePluginChange={handlePluginChange}
        handlePluginParamValueChange={handlePluginParamValueChange}
      />
    </div>
  )
}

ReactImageEditor.defaultProps = {
  width: 700,
  height: 500,
  style: {},
  plugins: [],
  toolbar: {
    items: ['rect', 'circle', 'mosaic', 'repeal', 'download', 'crop'],
  },
} as Partial<ReactImageEditorProps>