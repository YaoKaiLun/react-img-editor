import Plugin from './plugins/Plugin'
import PluginFactory from './plugins/PluginFactory'
import Palette from './components/Palette'
import React, { useEffect, useState } from 'react'
import Toolbar from './components/Toolbar'
import { PluginParamValue } from './common/type'
import { EditorContext } from './components/EditorContext'

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
  crossOrigin?: string;
}

export default function ReactImageEditor(props: ReactImageEditorProps) {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)


  const pluginFactory = new PluginFactory()
  const plugins = [...pluginFactory.plugins, ...props.plugins!]
  let defaultPlugin = null
  let defaultParamValue = {}
  for(let i = 0; i < plugins.length; i++) {
    if (props.defaultPluginName && props.toolbar && plugins[i].name === props.defaultPluginName) {
      defaultPlugin = plugins[i]

      if (defaultPlugin.defaultParamValue) {
        defaultParamValue = defaultPlugin.defaultParamValue
      }

      break
    }
  }

  const [currentPlugin, setCurrentPlugin] = useState<Plugin | null>(defaultPlugin)
  const [paramValue, setParamValue] = useState<PluginParamValue>(defaultParamValue)

  // 生成默认 toolbarItemConfig
  const config: any = {}
  plugins.map(plugin => {
    if (plugin.name === 'repeal') {
      config[plugin.name] = { disable: true }
    } else {
      config[plugin.name] = { disable: false }
    }
  })

  const [toolbarItemConfig, setToolbarItemConfig] = useState(config)

  useEffect(() => {
    const image = new Image()
    image.onload = () => {
      setImageObj(image)
    }
    if (props.crossOrigin !== undefined) {
      image.crossOrigin = props.crossOrigin
    }
    image.src = props.src
  }, [props.src, props.crossOrigin])

  function handlePluginChange(plugin: Plugin) {
    setCurrentPlugin(plugin)
    plugin.defaultParamValue && setParamValue(plugin.defaultParamValue)
    if (plugin.disappearImmediately === true) {
      setTimeout(() => {
        setCurrentPlugin(null)
      })
    }
  }

  function handlePluginParamValueChange(value: PluginParamValue) {
    setParamValue(value)
  }

  function updateToolbarItemConfig(config: any) {
    setToolbarItemConfig(config)
  }

  const style = {
    width: props.width + 'px',
    height: props.height + 'px',
    ...props.style,
  }

  return (
    <EditorContext.Provider
      value={{
        containerWidth: props.width!,
        containerHeight: props.height!,
        plugins,
        toolbar: props.toolbar!,
        currentPlugin,
        paramValue,
        handlePluginChange,
        handlePluginParamValueChange,
        toolbarItemConfig,
        updateToolbarItemConfig,
      }}
    >
      <div className="react-img-editor" style={style}>
        {
          imageObj ? (
            <>
              <Palette
                height={props.height! - 42}
                imageObj={imageObj}
                getStage={props.getStage}
              />
              <Toolbar />
            </>
          ) : null
        }
      </div>
    </EditorContext.Provider>
  )
}

ReactImageEditor.defaultProps = {
  width: 700,
  height: 500,
  style: {},
  plugins: [],
  toolbar: {
    items: ['pen', 'eraser', 'arrow', 'rect', 'circle', 'mosaic', 'text', '|', 'repeal', 'download', 'crop'],
  },
} as Partial<ReactImageEditorProps>