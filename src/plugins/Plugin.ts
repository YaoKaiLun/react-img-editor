import { DrawEventPramas, PluginParamName, PluginParamValue } from '../common/type'

export default abstract class Plugin {
  abstract name: string;
  abstract iconfont: string;
  abstract title: string;
  params?: PluginParamName[];
  defalutParamValue?: PluginParamValue;
  shapeName?: string;

  onEnter?: (params: DrawEventPramas) => void;
  onDrawStart?: (params: DrawEventPramas) => void;
  onClick?: (params: DrawEventPramas) => void;
  onDraw?: (params: DrawEventPramas) => void;
  onDrawEnd?: (params: DrawEventPramas) => void;
  onLeave?: (params: DrawEventPramas) => void;
  onNodeRecreate?: (params: DrawEventPramas, node: any) => void;
}