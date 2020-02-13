export interface DrawEventPramas {
  stage: any;
  imageLayer: any;
  layer: any;
  paramValue: PluginParamValue | null;
  imageData: ImageData;
  reload: (imageObj: any, rectWidth: number, rectHeigh: number) => void;
  historyStack: any[];
  pixelRatio: number;
}
export interface PluginProps {
  name: string;
  iconfont: string;
  title: string;
  params?: PluginParamName[];
  defalutParamValue?: PluginParamValue;
  shapeName?: string;
  onClick?: (params: DrawEventPramas) => void;
  onDrawStart?: (params: DrawEventPramas) => void;
  onDraw?: (params: DrawEventPramas) => void;
  onDrawEnd?: (params: DrawEventPramas) => void;
  onStageClick?: (params: DrawEventPramas) => void;
  onLeave?: (params: DrawEventPramas) => void;
}
export type PluginParamName = 'strokeWidth' | 'color' | 'fontSize' | 'lineType'
export interface PluginParamValue {
  strokeWidth?: number;
  color?: string;
  fontSize?: number;
  lineType?: 'solid' | 'dash';
}