# react-img-editor · 图像编辑器

![](https://img.shields.io/npm/v/react-img-editor.svg) ![](https://img.shields.io/npm/dw/react-img-editor.svg)

react-img-editor 是一个图像编辑器 react 组件，支持对图片进行裁剪、涂鸦、文字编辑、马赛克处理等操作，同时支持自定义插件和灵活的样式配置。

![示例](https://s2.ax1x.com/2020/02/16/39gZcD.png)

查看 [demo](https://yaokailun.github.io/react-img-editor/)

## ✨ 特性

- 支持自由画笔、矩形、圆形、箭头、文字、马赛克的绘制
- 支持橡皮擦、撤销操作、截图和图片下载
- 支持自定义插件和工具栏配置
- 支持矩形、圆形、箭头、文字等节点的拉伸、拖拽和删除
- 支持同一页面多个组件同时存在

## 📦 下载

```
npm install react-img-editor -S
```

## 🔨 引入和使用

```
import ReactImgEditor from 'react-img-editor'
import 'react-img-editor/assets/index.css'

<ReactImgEditor src="https://www.w3schools.com/html/img_girl.jpg" />
```

## 🧰 API

| 属性 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| src | 图片 url | string | - |
| width | 画板宽度 | number? | 700 |
| height | 画板高度 | number? | 500 |
| style | 画板样式 | React.CSSProperties | - |
| plugins | 自定义的插件 | Plugin[] | [] |
| toolbar | 工具栏配置 | { items: string[] } | {items: ['pen', 'eraser', 'arrow', 'rect', 'circle', 'mosaic', 'text', '|', 'repeal', 'download', 'crop']} |
| getStage | 获取 KonvaJS 的 [Stage](https://konvajs.org/api/Konva.Stage.html) 对象，可用于下载图片等操作 | (stage: any) => void |
| defaultPluginName | 默认选中的插件名称 | string? | - |
| crossOrigin | 处理跨域图片 | string? | - |


## 📝 TODO

- [ ] 动态加载图片
- [ ] 下载图片类型配置
- [ ] 提供插件配置项配置
- [ ] 优化自由画笔书写体验
- [ ] 国际化支持

## 🤝 贡献

开发
```
npm run start
```

http://127.0.0.1:8012/examples/simple.html

发布
```
npm run lint
npm run pub
```