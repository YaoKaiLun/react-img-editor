import React from 'react'
import Plugin from '../plugins/Plugin'
import withContext from '../common/withContext'
import { PluginParamValue } from '../common/type'
import { Locale, LocaleKey } from '../common/i18n'

export interface EditorContextProps {
  containerWidth: number;
  containerHeight: number;
  plugins: Plugin[];
  toolbar: {
    items: string[];
  };
  currentPlugin: Plugin | null;
  handlePluginChange: (plugin: Plugin) => void;
  paramValue: PluginParamValue | null;
  handlePluginParamValueChange: (paramValue: PluginParamValue) => void;
  toolbarItemConfig: any;
  updateToolbarItemConfig: (config: any) => void;
  locale: Locale;
  t: (key: LocaleKey) => string;
}

export const EditorContext = React.createContext({} as EditorContextProps)
export const withEditorContext = withContext<EditorContextProps>(EditorContext)
