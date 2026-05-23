import { DrawEventParams, PluginParamName, PluginParamValue } from '../common/type'
import { LocaleKey } from '../common/i18n'

export default abstract class Plugin {
  abstract name: string;
  abstract iconfont: string;
  abstract title: string;
  titleKey?: LocaleKey;
  params?: PluginParamName[];
  defaultParamValue?: PluginParamValue;
  shapeName?: string;
  disappearImmediately?: boolean;
  config?: Record<string, any>;

  onEnter?: (params: DrawEventParams) => void;
  onDrawStart?: (params: DrawEventParams) => void;
  onClick?: (params: DrawEventParams) => void;
  onDraw?: (params: DrawEventParams) => void;
  onDrawEnd?: (params: DrawEventParams) => void;
  onLeave?: (params: DrawEventParams) => void;
  onNodeRecreate?: (params: DrawEventParams, node: any) => void;

  applyConfig(config: Record<string, any>) {
    this.config = config
    if (config.defaultParamValue && this.defaultParamValue) {
      this.defaultParamValue = { ...this.defaultParamValue, ...config.defaultParamValue }
    }
  }
}
