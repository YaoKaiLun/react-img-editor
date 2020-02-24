import { EditorContextProps } from '../components/EditorContext'
import { Stage } from 'konva/types/Stage'
import { Layer } from 'konva/types/Layer'

export interface DrawEventPramas extends EditorContextProps {
  event?: any;
  stage: Stage;
  imageLayer: Layer;
  drawLayer: Layer;
  imageData: ImageData;
  reload: (imageObj: any, rectWidth: number, rectHeigh: number) => void;
  historyStack: any[];
  pixelRatio: number;
}
export type PluginParamName = 'strokeWidth' | 'color' | 'fontSize' | 'lineType'
export interface PluginParamValue {
  strokeWidth?: number;
  color?: string;
  fontSize?: number;
  lineType?: 'solid' | 'dash';
}