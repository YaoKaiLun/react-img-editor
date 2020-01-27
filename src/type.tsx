export type DrawEvent = (e: Event, Konva: any, stage: any, layer: any, paramValue: PluginParamValue | null, imageData: ImageData) => void;
export interface PluginProps {
  name: string;
  iconfont: string;
  params?: PluginParamName[];
  onClick?: (Konva: any, stage: any, layer: any, imageData: ImageData, imageLayer: any, reload: any) => void;
  onDrawStart?: DrawEvent;
  onDraw?: DrawEvent;
  onDrawEnd?: DrawEvent;
}
export type PluginParamName = 'strokeWidth' | 'color' | 'fontSize' | 'lineType'
export interface PluginParamValue {
  strokeWidth?: number;
  color?: string;
  fontSize?: 'small' | 'medium' | 'large';
  lineType?: 'solid' | 'dash';
}