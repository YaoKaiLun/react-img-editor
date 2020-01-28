export interface DrawEventPramas {
  stage: any;
  layer: any;
  paramValue: PluginParamValue | null;
  imageData: ImageData;
  reload: (imageObj: any, rectWidth: number, rectHeigh: number) => void;
  historyStack: any[];
}
export interface PluginProps {
  name: string;
  iconfont: string;
  params?: PluginParamName[];
  onClick?: (params: DrawEventPramas) => void;
  onDrawStart?: (params: DrawEventPramas) => void;
  onDraw?: (params: DrawEventPramas) => void;
  onDrawEnd?: (params: DrawEventPramas) => void;
}
export type PluginParamName = 'strokeWidth' | 'color' | 'fontSize' | 'lineType'
export interface PluginParamValue {
  strokeWidth?: number;
  color?: string;
  fontSize?: 'small' | 'medium' | 'large';
  lineType?: 'solid' | 'dash';
}