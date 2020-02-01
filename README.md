# react-image-editor
图片编辑器（微信截图编辑 PRO 版）

## 安装

```
npm install react-image-editor -S
```

## 引入

```
import ReactImageEditor from 'react-image-editor'
import 'react-image-editor/assets/index.css'

<ReactImageEditor imageObj={newImage} />
```

## API

| 属性 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| imageObj | 待处理的 Image 对象， | HTMLImageElement | - |
| width | 画板宽度 | number? | 700 |
| height | 画板高度 | number? | 500 |
| style | 画板样式 | React.CSSProperties | - |
| plugins | 自定义的插件 | PluginProps[] | [] |
| toolbar | 工具栏配置 | { items: string[] } | {items: ['arrow', 'rect', 'circle', 'mosaic', 'text', 'repeal', 'download', 'crop']} |
| getStage | 获取 KonvaJS 的 [Stage](https://konvajs.org/api/Konva.Stage.html) 对象，可用于下载图片等操作 | (stage: any) => void |