import { DrawEventParams, PluginParamName, PluginParamValue } from '../common/type'

export default abstract class Plugin {
  abstract name: string;
  abstract iconfont: string;
  abstract title: string;
  params?: PluginParamName[];
  defaultParamValue?: PluginParamValue;
  shapeName?: string;
  disappearImmediately?: boolean;

  onEnter?: (params: DrawEventParams) => void;
  onDrawStart?: (params: DrawEventParams) => void;
  onClick?: (params: DrawEventParams) => void;
  onDraw?: (params: DrawEventParams) => void;
  onDrawEnd?: (params: DrawEventParams) => void;
  onLeave?: (params: DrawEventParams) => void;
  onNodeRecreate?: (params: DrawEventParams, node: any) => void;
}