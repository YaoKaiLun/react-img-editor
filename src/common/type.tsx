import Konva from 'konva'
import PubSub from './PubSub'
import { EditorContextProps } from '../components/EditorContext'

export interface DrawEventParams extends EditorContextProps {
  event?: any;
  stage: Konva.Stage;
  imageLayer: Konva.Layer;
  drawLayer: Konva.Layer;
  imageElement: Konva.Image;
  imageData: ImageData;
  reload: (imageObj: any, rectWidth: number, rectHeigh: number) => void;
  historyStack: any[];
  pixelRatio: number;
  pubSub: InstanceType<typeof PubSub>;
}
export type PluginParamName = 'strokeWidth' | 'color' | 'fontSize' | 'lineType' | 'zoomRatio'
export interface PluginParamValue {
  strokeWidth?: number;
  color?: string;
  fontSize?: number;
  lineType?: 'solid' | 'dash';
  zoomRatio?: number;
}