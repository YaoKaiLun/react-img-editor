# react-img-editor
图片编辑器（微信截图编辑 PRO 版）

![示例](./assets/demo.png)

## 安装

```
npm install react-img-editor -S
```

## 引入

```
import ReactImgEditor from 'react-img-editor'
import 'react-img-editor/assets/index.css'

<ReactImgEditor src="https://www.w3schools.com/html/img_girl.jpg" />
```

## API

| 属性 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| src | 图片 url | string | - |
| width | 画板宽度 | number? | 700 |
| height | 画板高度 | number? | 500 |
| style | 画板样式 | React.CSSProperties | - |
| plugins | 自定义的插件 | PluginProps[] | [] |
| toolbar | 工具栏配置 | { items: string[] } | {items: ['pen', 'eraser', 'arrow', 'rect', 'circle', 'mosaic', 'text', 'repeal', 'download', 'crop']} |
| getStage | 获取 KonvaJS 的 [Stage](https://konvajs.org/api/Konva.Stage.html) 对象，可用于下载图片等操作 | (stage: any) => void |
| defaultPluginName | 默认选中的插件名称 | string? | - |