import Plugin from './plugins/Plugin'

export interface DrawEventPramas {
  stage: any;
  imageLayer: any;
  layer: any;
  paramValue: PluginParamValue | null;
  imageData: ImageData;
  reload: (imageObj: any, rectWidth: number, rectHeigh: number) => void;
  historyStack: any[];
  pixelRatio: number;
  event?: any;
  plugins: Plugin[];
}
export type PluginParamName = 'strokeWidth' | 'color' | 'fontSize' | 'lineType'
export interface PluginParamValue {
  strokeWidth?: number;
  color?: string;
  fontSize?: number;
  lineType?: 'solid' | 'dash';
}