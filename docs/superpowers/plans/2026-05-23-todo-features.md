# React-Img-Editor TODO 功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 README 中列出的 5 个 TODO 项：动态加载图片、下载图片类型配置、插件配置项配置、优化自由画笔书写体验、国际化支持。

**Architecture:** 在现有 React + KonvaJS 插件架构基础上扩展。核心思路：1) 通过扩展 Props 接口暴露新配置项；2) 在 Plugin 抽象类中增加配置项钩子；3) 新增 i18n 模块管理多语言文案；4) 优化 Pen 插件的绘制算法。所有改动保持向后兼容，新 Props 均为可选。

**Tech Stack:** React 16+、KonvaJS 4.x、TypeScript、rc-tooltip、pubsub-js

---

## 文件结构

| 操作 | 文件路径 | 职责 |
|------|----------|------|
| 修改 | `src/index.tsx` | 扩展 Props 接口，新增 `download`、`pluginConfig`、`locale` 属性 |
| 修改 | `src/common/type.tsx` | 新增 `DownloadConfig`、`PluginConfig` 类型定义 |
| 修改 | `src/plugins/Plugin.ts` | 新增 `config` 属性和 `applyConfig` 方法，新增 `titleKey` 可选属性 |
| 修改 | `src/plugins/PluginFactory.ts` | 传递 `pluginConfig` 到各插件实例 |
| 修改 | `src/plugins/Download.ts` | 支持 `download` 配置，支持 jpeg/png/webp |
| 修改 | `src/plugins/Pen.ts` | 优化画笔算法，使用贝塞尔曲线平滑 |
| 修改 | `src/components/Palette.tsx` | 支持动态图片加载、重新初始化画布 |
| 修改 | `src/components/Toolbar.tsx` | 使用 i18n 文案渲染工具栏 |
| 修改 | `src/components/ParamSetting/FontSizeSetting.tsx` | 使用 i18n 文案 |
| 修改 | `src/components/EditorContext.tsx` | 新增 `download`、`locale` 和 `t` 翻译函数到 Context |
| 新增 | `src/common/i18n.ts` | 国际化模块，管理多语言文案 |
| 新增 | `src/common/locales/en.ts` | 英文语言包 |
| 新增 | `src/common/locales/zh-CN.ts` | 中文语言包 |
| 修改 | `src/plugins/Crop.ts` | 裁剪工具栏文案使用 i18n |

---

## Task 1: 动态加载图片

**目标：** 当 `src` 属性变化时，组件能够重新加载新图片并重绘画布，而不是只在初始化时加载一次。

**Files:**
- 修改: `src/components/Palette.tsx:58-78`

- [ ] **Step 1: 修改 `Palette.tsx`，在 `componentDidUpdate` 中处理 `imageObj` 变化**

当前 `src/index.tsx` 的 `useEffect` 已经正确地在 `src` 变化时重新创建 Image 对象并设置 `imageObj`。但 `Palette` 组件的 `componentDidUpdate` 没有处理 `imageObj` 变化的情况。

注意：不能同时调用 `reload` 和 `init`，因为 `reload` 已经会创建新的 Stage，再调用 `init` 会重复创建。正确做法是在 `imageObj` 变化时，重新计算画布尺寸，然后调用 `reload`。

```typescript
componentDidUpdate(prevProps: PaletteProps) {
  const prevCurrentPlugin = prevProps.currentPlugin
  const { currentPlugin } = this.props

  if (this.props.imageObj !== prevProps.imageObj) {
    const { containerWidth } = this.props
    const imageObj = this.props.imageObj
    const imageNatureWidth = imageObj.naturalWidth
    const imageNatureHeight = imageObj.naturalHeight
    const wRatio = containerWidth / imageNatureWidth
    const hRatio = this.props.height / imageNatureHeight
    const scaleRatio = Math.min(wRatio, hRatio, 1)

    this.canvasWidth = Math.round(imageNatureWidth * scaleRatio)
    this.canvasHeight = Math.round(imageNatureHeight * scaleRatio)
    this.pixelRatio = 1 / scaleRatio
    Konva.pixelRatio = this.pixelRatio

    this.reload(imageObj, this.canvasWidth, this.canvasHeight)
    return
  }

  if (currentPlugin !== prevCurrentPlugin) {
    if (prevCurrentPlugin && prevCurrentPlugin.onLeave) {
      if (prevCurrentPlugin.name !== currentPlugin?.name) {
        prevCurrentPlugin.onLeave(this.getDrawEventParams(null))
      }
    }

    if (currentPlugin) {
      this.bindEvents()

      if (currentPlugin.onEnter) {
        currentPlugin.onEnter(this.getDrawEventParams(null))
      }
    }
  }
}
```

- [ ] **Step 2: 修改 `Palette.tsx` 的 `reload` 方法，重新计算画布尺寸**

当图片动态切换时，新图片的尺寸可能不同。当前 `reload` 方法使用传入的 `width` 和 `height` 直接创建 Stage，但没有更新 `this.canvasWidth` 等实例属性。需要确保这些属性与实际画布一致：

```typescript
reload = (imgObj: any, width: number, height: number) => {
  const { getStage } = this.props

  this.canvasWidth = width
  this.canvasHeight = height

  this.removeEvents()
  this.historyStack = []
  this.stage = new Konva.Stage({
    container: this.containerId,
    width: this.canvasWidth,
    height: this.canvasHeight,
  })

  getStage && getStage(this.resetStage(this.stage!))

  const img = new Konva.Image({
    x: 0,
    y: 0,
    image: imgObj,
    width: this.canvasWidth,
    height: this.canvasHeight,
  })

  this.imageElement = img
  this.imageLayer = new Konva.Layer()
  this.stage.add(this.imageLayer)
  this.imageLayer.add(img)
  this.imageLayer.draw()

  this.imageData = this.generateImageData(imgObj, this.canvasWidth, this.canvasHeight)

  this.drawLayer = new Konva.Layer()
  this.stage.add(this.drawLayer)
  this.bindEvents()
}
```

- [ ] **Step 3: 在 examples/simple.tsx 中添加动态切换图片的示例代码**

在文件顶部增加 `useState` 导入：

```tsx
import React, { useRef, useState } from 'react'
```

修改 `Example` 组件：

```tsx
function Example() {
  const stageRef = useRef<any>(null)
  const [imageSrc, setImageSrc] = useState('https://pro-cos-public.seewo.com/seewo-school/7614707e9bfe42f1bfa3bf7fb9d71844')

  function setStage(stage) {
    stageRef.current = stage
  }

  function downloadImage() {
    const canvas = stageRef.current.clearAndToCanvas({ pixelRatio: stageRef.current._pixelRatio })
    canvas.toBlob(function(blob: any) {
      const link = document.createElement('a')
      link.download = ''
      link.href = URL.createObjectURL(blob)
      link.click()
    }, 'image/jpeg')
  }

  return (
    <>
      <ReactImgEditor
        src={imageSrc}
        width={736}
        height={414}
        getStage={setStage}
        defaultPluginName="text"
        crossOrigin="anonymous"
        toolbar={{
          items: ['pen', 'eraser', 'arrow', 'rect', 'circle', 'mosaic', 'text', '|', 'repeal', 'download', 'crop',
            '|', 'zoomIn', 'zoomOut'],
        }}
      />
      <div style={{ marginTop: '50px' }}>
        <button onClick={downloadImage}>download</button>
        <button onClick={() => setImageSrc('https://www.w3schools.com/html/img_girl.jpg')} style={{ marginLeft: '10px' }}>切换图片</button>
      </div>
    </>
  )
}
```

- [ ] **Step 4: 运行 lint 验证**

Run: `cd /Users/kailun/Documents/code/react-img-editor && npm run lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Palette.tsx examples/simple.tsx
git commit -m "feat: support dynamic image loading when src changes"
```

---

## Task 2: 下载图片类型配置

**目标：** 支持用户配置下载图片的格式（jpeg/png/webp）和质量，当前硬编码为 `image/jpeg`。

**Files:**
- 修改: `src/common/type.tsx`
- 修改: `src/index.tsx`
- 修改: `src/components/EditorContext.tsx`
- 修改: `src/plugins/Download.ts`

- [ ] **Step 1: 在 `src/common/type.tsx` 中新增 `DownloadConfig` 类型**

在文件末尾追加：

```typescript
export type DownloadType = 'image/jpeg' | 'image/png' | 'image/webp'

export interface DownloadConfig {
  mimeType?: DownloadType;
  quality?: number;
  fileName?: string;
}
```

- [ ] **Step 2: 在 `src/components/EditorContext.tsx` 中增加 `download` 到 Context**

```typescript
import React from 'react'
import Plugin from '../plugins/Plugin'
import withContext from '../common/withContext'
import { DownloadConfig, PluginParamValue } from '../common/type'

export interface EditorContextProps {
  containerWidth: number;
  containerHeight: number;
  plugins: Plugin[];
  toolbar: {
    items: string[];
  };
  currentPlugin: Plugin | null;
  handlePluginChange: (plugin: Plugin) => void;
  paramValue: PluginParamValue | null;
  handlePluginParamValueChange: (paramValue: PluginParamValue) => void;
  toolbarItemConfig: any;
  updateToolbarItemConfig: (config: any) => void;
  download: DownloadConfig;
}

export const EditorContext = React.createContext({} as EditorContextProps)
export const withEditorContext = withContext<EditorContextProps>(EditorContext)
```

注意：由于 `DrawEventParams extends EditorContextProps`，`download` 字段会自动继承到 `DrawEventParams`，无需在 `DrawEventParams` 中重复声明。

- [ ] **Step 3: 在 `src/index.tsx` 的 Props 接口中新增 `download` 配置项**

在文件顶部增加导入：

```typescript
import { DownloadConfig, PluginParamValue } from './common/type'
```

修改 `ReactImageEditorProps` 接口，增加 `download` 属性：

```typescript
interface ReactImageEditorProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  plugins?: Plugin[];
  toolbar?: {
    items: string[];
  };
  src: string;
  getStage?: (stage: any) => void;
  defaultPluginName?: string;
  crossOrigin?: string;
  download?: DownloadConfig;
}
```

在 `EditorContext.Provider` 的 value 中增加 `download: props.download!`：

```typescript
<EditorContext.Provider
  value={{
    containerWidth: props.width!,
    containerHeight: props.height!,
    plugins,
    toolbar: props.toolbar!,
    currentPlugin,
    paramValue,
    handlePluginChange,
    handlePluginParamValueChange,
    toolbarItemConfig,
    updateToolbarItemConfig,
    download: props.download!,
  }}
>
```

在 `defaultProps` 中增加：

```typescript
download: {
  mimeType: 'image/jpeg',
  quality: 0.92,
  fileName: '',
},
```

- [ ] **Step 4: 修改 `src/plugins/Download.ts`，使用 `download` 配置**

```typescript
import { DrawEventParams } from '../common/type'
import Plugin from './Plugin'

export default class Download extends Plugin {
  name = 'download'
  iconfont = 'iconfont icon-download'
  title = '下载图片'
  disappearImmediately = true

  onEnter = (drawEventParams: DrawEventParams) => {
    const { stage, pixelRatio, imageElement, download } = drawEventParams
    const mimeType = download.mimeType || 'image/jpeg'
    const quality = download.quality !== undefined ? download.quality : 0.92
    const fileName = download.fileName || ''

    setTimeout(() => {
      const canvas = stage.toCanvas({
        pixelRatio,
        width: imageElement.width(),
        height: imageElement.height(),
      })
      canvas.toBlob(function(blob: any) {
        const link = document.createElement('a')
        link.download = fileName
        link.href = URL.createObjectURL(blob)
        link.click()
      }, mimeType, quality)
    }, 100)
  }
}
```

- [ ] **Step 5: 运行 lint 验证**

Run: `cd /Users/kailun/Documents/code/react-img-editor && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/common/type.tsx src/plugins/Download.ts src/index.tsx src/components/EditorContext.tsx
git commit -m "feat: add download image type and quality configuration"
```

---

## Task 3: 提供插件配置项配置

**目标：** 允许用户通过 `pluginConfig` 属性覆盖各插件的默认参数值（如默认颜色、线宽等），而不是只能通过 UI 修改。

**Files:**
- 修改: `src/common/type.tsx`
- 修改: `src/plugins/Plugin.ts`
- 修改: `src/plugins/PluginFactory.ts`
- 修改: `src/index.tsx`

- [ ] **Step 1: 在 `src/common/type.tsx` 中新增 `PluginConfig` 类型**

在文件末尾追加：

```typescript
export interface PluginConfig {
  [pluginName: string]: {
    defaultParamValue?: PluginParamValue;
    [key: string]: any;
  };
}
```

- [ ] **Step 2: 修改 `src/plugins/Plugin.ts`，增加 `config` 属性和 `applyConfig` 方法**

```typescript
import { DrawEventParams, PluginParamName, PluginParamValue } from '../common/type'

export default abstract class Plugin {
  abstract name: string;
  abstract iconfont: string;
  abstract title: string;
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
```

- [ ] **Step 3: 修改 `src/plugins/PluginFactory.ts`，接受 `pluginConfig` 参数**

```typescript
import Arrow from './Arrow'
import Circle from './Circle'
import Crop from './Crop'
import Download from './Download'
import Eraser from './Eraser'
import Mosaic from './Mosaic'
import Pen from './Pen'
import Rect from './Rect'
import Repeal from './Repeal'
import Text from './Text'
import ZoomIn from './ZoomIn'
import ZoomOut from './ZoomOut'
import { PluginConfig } from '../common/type'

export default class PluginFactory {
  plugins: import('./Plugin').default[]

  constructor(pluginConfig?: PluginConfig) {
    this.plugins = [
      new Arrow(),
      new Circle(),
      new Crop(),
      new Download(),
      new Eraser(),
      new Mosaic(),
      new Pen(),
      new Rect(),
      new Repeal(),
      new Text(),
      new ZoomIn(),
      new ZoomOut(),
    ]

    if (pluginConfig) {
      this.plugins.forEach(plugin => {
        if (pluginConfig[plugin.name]) {
          plugin.applyConfig(pluginConfig[plugin.name])
        }
      })
    }
  }
}
```

- [ ] **Step 4: 修改 `src/index.tsx`，将 `pluginConfig` 传入 `PluginFactory`**

在文件顶部增加导入：

```typescript
import { DownloadConfig, PluginConfig, PluginParamValue } from './common/type'
```

在 `ReactImageEditorProps` 接口中增加 `pluginConfig`：

```typescript
interface ReactImageEditorProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  plugins?: Plugin[];
  toolbar?: {
    items: string[];
  };
  src: string;
  getStage?: (stage: any) => void;
  defaultPluginName?: string;
  crossOrigin?: string;
  download?: DownloadConfig;
  pluginConfig?: PluginConfig;
}
```

修改 `PluginFactory` 实例化（将 `const pluginFactory = new PluginFactory()` 改为）：

```typescript
const pluginFactory = new PluginFactory(props.pluginConfig)
```

在 `defaultProps` 中增加：

```typescript
pluginConfig: {},
```

- [ ] **Step 5: 运行 lint 验证**

Run: `cd /Users/kailun/Documents/code/react-img-editor && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/common/type.tsx src/plugins/Plugin.ts src/plugins/PluginFactory.ts src/index.tsx
git commit -m "feat: add plugin configuration support via pluginConfig prop"
```

---

## Task 4: 优化自由画笔书写体验

**目标：** 优化 Pen 插件的绘制算法，使用贝塞尔曲线平滑替代直线段连接，减少锯齿感，提升书写流畅度。

**Files:**
- 修改: `src/plugins/Pen.ts`

- [ ] **Step 1: 修改 `src/plugins/Pen.ts`，使用二次贝塞尔曲线平滑画笔**

当前 Pen 插件在 `onDraw` 中直接将鼠标点追加到 `points` 数组，Konva.Line 使用 `tension: 1` 进行简单平滑。这会导致线条在快速移动时出现折角。

优化方案：收集原始点，使用二次贝塞尔曲线的中点算法生成平滑路径点，替代原始点。同时将 `tension` 从 `1` 降低为 `0.5`，减少过度平滑导致的线条偏移。

```typescript
import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventParams, PluginParamName, PluginParamValue } from '../common/type'
import { uuid } from '../common/utils'

export default class Pen extends Plugin {
  name = 'pen'
  iconfont = 'iconfont icon-pen'
  title = '画笔'
  params = ['strokeWidth', 'lineType', 'color'] as PluginParamName[]
  defaultParamValue = {
    strokeWidth: 2,
    lineType: 'solid',
    color: '#F5222D',
  } as PluginParamValue

  lastLine: any = null
  isPaint = false
  rawPoints: number[] = []

  onDrawStart = (drawEventParams: DrawEventParams) => {
    const { stage, drawLayer, paramValue } = drawEventParams
    const pos = stage.getPointerPosition()

    if (!pos) return

    this.isPaint = true
    this.rawPoints = [pos.x, pos.y]

    this.lastLine = new Konva.Line({
      id: uuid(),
      stroke: (paramValue && paramValue.color) ? paramValue.color : this.defaultParamValue.color,
      strokeWidth: (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : this.defaultParamValue.strokeWidth,
      globalCompositeOperation: 'source-over',
      points: [pos.x, pos.y],
      dashEnabled: !!(paramValue && paramValue.lineType && paramValue.lineType === 'dash'),
      dash: [8],
      tension: 0.5,
      lineCap: 'round',
      lineJoin: 'round',
    })
    drawLayer.add(this.lastLine)
  }

  onDraw = (drawEventParams: DrawEventParams) => {
    const { stage, drawLayer } = drawEventParams
    const pos = stage.getPointerPosition()

    if (!this.isPaint || !pos) return

    this.rawPoints.push(pos.x, pos.y)

    const smoothedPoints = this.getSmoothedPoints(this.rawPoints)
    this.lastLine.points(smoothedPoints)
    drawLayer.batchDraw()
  }

  onDrawEnd = (drawEventParams: DrawEventParams) => {
    const { pubSub } = drawEventParams
    this.isPaint = false
    this.rawPoints = []
    pubSub.pub('PUSH_HISTORY', this.lastLine)
  }

  onLeave = () => {
    this.isPaint = false
    this.rawPoints = []
  }

  getSmoothedPoints = (points: number[]): number[] => {
    if (points.length <= 4) return points

    const result: number[] = [points[0], points[1]]

    for (let i = 2; i < points.length - 2; i += 2) {
      const x1 = points[i]
      const y1 = points[i + 1]
      const x2 = points[i + 2]
      const y2 = points[i + 3]

      const midX = (x1 + x2) / 2
      const midY = (y1 + y2) / 2

      result.push(x1, y1, midX, midY)
    }

    result.push(points[points.length - 2], points[points.length - 1])

    return result
  }
}
```

关键优化点：
1. 将 `tension` 从 `1` 降低为 `0.5`，减少过度平滑导致的线条偏移
2. 新增 `getSmoothedPoints` 方法，使用中点贝塞尔曲线算法生成中间控制点
3. 保留 `rawPoints` 用于计算平滑曲线，最终渲染使用平滑后的点
4. 保持 `lineCap: 'round'` 和 `lineJoin: 'round'` 确保端点圆滑

- [ ] **Step 2: 运行 lint 验证**

Run: `cd /Users/kailun/Documents/code/react-img-editor && npm run lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/plugins/Pen.ts
git commit -m "feat: optimize pen drawing with bezier curve smoothing"
```

---

## Task 5: 国际化支持

**目标：** 新增 i18n 模块，支持中文和英文两种语言，所有用户可见文案（工具栏 tooltip、参数设置面板、裁剪提示等）均可翻译。

**Files:**
- 新增: `src/common/locales/zh-CN.ts`
- 新增: `src/common/locales/en.ts`
- 新增: `src/common/i18n.ts`
- 修改: `src/common/type.tsx`
- 修改: `src/components/EditorContext.tsx`
- 修改: `src/index.tsx`
- 修改: `src/plugins/Plugin.ts`
- 修改: `src/plugins/Crop.ts`
- 修改: `src/components/Toolbar.tsx`
- 修改: `src/components/ParamSetting/FontSizeSetting.tsx`

- [ ] **Step 1: 创建中文语言包 `src/common/locales/zh-CN.ts`**

```typescript
const zhCN = {
  pen: '画笔',
  eraser: '擦除',
  arrow: '插入箭头',
  rect: '插入矩形',
  circle: '插入圆圈',
  mosaic: '马赛克',
  text: '插入文字',
  repeal: '撤销',
  download: '下载图片',
  crop: '图片裁剪',
  zoomIn: '放大',
  zoomOut: '缩小',
  fontSizeSmall: '小',
  fontSizeMedium: '中',
  fontSizeLarge: '大',
  cropHint: '拖动边框调整图片显示范围',
}

export default zhCN
```

- [ ] **Step 2: 创建英文语言包 `src/common/locales/en.ts`**

```typescript
const en = {
  pen: 'Pen',
  eraser: 'Eraser',
  arrow: 'Arrow',
  rect: 'Rectangle',
  circle: 'Circle',
  mosaic: 'Mosaic',
  text: 'Text',
  repeal: 'Undo',
  download: 'Download',
  crop: 'Crop',
  zoomIn: 'Zoom In',
  zoomOut: 'Zoom Out',
  fontSizeSmall: 'S',
  fontSizeMedium: 'M',
  fontSizeLarge: 'L',
  cropHint: 'Drag the border to adjust the display range',
}

export default en
```

- [ ] **Step 3: 创建 i18n 模块 `src/common/i18n.ts`**

```typescript
import zhCN from './locales/zh-CN'
import en from './locales/en'

export type LocaleKey = keyof typeof zhCN
export type Locale = 'zh-CN' | 'en'

const locales: Record<Locale, Record<LocaleKey, string>> = {
  'zh-CN': zhCN,
  'en': en,
}

export function createTranslator(locale: Locale) {
  const messages = locales[locale] || locales['zh-CN']

  return function t(key: LocaleKey): string {
    return messages[key] || key
  }
}

export { zhCN, en }
```

- [ ] **Step 4: 修改 `src/plugins/Plugin.ts`，增加 `titleKey` 可选属性**

保持 `title` 属性不变以确保向后兼容（自定义插件可能仍在使用 `title`），新增 `titleKey` 作为 i18n key。在 Toolbar 渲染时优先使用 `titleKey`，回退到 `title`。

```typescript
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
```

- [ ] **Step 5: 为所有内置插件添加 `titleKey` 属性**

在每个插件文件中增加 `titleKey` 属性和 `LocaleKey` 导入。不删除原有的 `title` 属性，保持向后兼容。

**Arrow.ts** — 在文件顶部增加 `import { LocaleKey } from '../common/i18n'`，在类中增加 `titleKey = 'arrow' as LocaleKey`

**Circle.ts** — 在文件顶部增加 `import { LocaleKey } from '../common/i18n'`，在类中增加 `titleKey = 'circle' as LocaleKey`

**Crop.ts** — 在文件顶部增加 `import { LocaleKey } from '../common/i18n'`，在类中增加 `titleKey = 'crop' as LocaleKey`

**Download.ts** — 在文件顶部增加 `import { LocaleKey } from '../common/i18n'`，在类中增加 `titleKey = 'download' as LocaleKey`

**Eraser.ts** — 在文件顶部增加 `import { LocaleKey } from '../common/i18n'`，在类中增加 `titleKey = 'eraser' as LocaleKey`

**Mosaic.ts** — 在文件顶部增加 `import { LocaleKey } from '../common/i18n'`，在类中增加 `titleKey = 'mosaic' as LocaleKey`

**Pen.ts** — 在文件顶部增加 `import { LocaleKey } from '../common/i18n'`，在类中增加 `titleKey = 'pen' as LocaleKey`

**Rect.ts** — 在文件顶部增加 `import { LocaleKey } from '../common/i18n'`，在类中增加 `titleKey = 'rect' as LocaleKey`

**Repeal.ts** — 在文件顶部增加 `import { LocaleKey } from '../common/i18n'`，在类中增加 `titleKey = 'repeal' as LocaleKey`

**Text.ts** — 在文件顶部增加 `import { LocaleKey } from '../common/i18n'`，在类中增加 `titleKey = 'text' as LocaleKey`

**ZoomIn.ts** — 在文件顶部增加 `import { LocaleKey } from '../common/i18n'`，在类中增加 `titleKey = 'zoomIn' as LocaleKey`

**ZoomOut.ts** — 在文件顶部增加 `import { LocaleKey } from '../common/i18n'`，在类中增加 `titleKey = 'zoomOut' as LocaleKey`

- [ ] **Step 6: 修改 `src/components/EditorContext.tsx`，增加 `locale` 和 `t` 函数**

```typescript
import React from 'react'
import Plugin from '../plugins/Plugin'
import withContext from '../common/withContext'
import { DownloadConfig, PluginParamValue } from '../common/type'
import { Locale, LocaleKey } from '../common/i18n'

export interface EditorContextProps {
  containerWidth: number;
  containerHeight: number;
  plugins: Plugin[];
  toolbar: {
    items: string[];
  };
  currentPlugin: Plugin | null;
  handlePluginChange: (plugin: Plugin) => void;
  paramValue: PluginParamValue | null;
  handlePluginParamValueChange: (paramValue: PluginParamValue) => void;
  toolbarItemConfig: any;
  updateToolbarItemConfig: (config: any) => void;
  download: DownloadConfig;
  locale: Locale;
  t: (key: LocaleKey) => string;
}

export const EditorContext = React.createContext({} as EditorContextProps)
export const withEditorContext = withContext<EditorContextProps>(EditorContext)
```

- [ ] **Step 7: 修改 `src/index.tsx`，增加 `locale` prop 并创建翻译函数**

在文件顶部增加导入：

```typescript
import { createTranslator, Locale } from './common/i18n'
import { DownloadConfig, PluginConfig, PluginParamValue } from './common/type'
```

在 `ReactImageEditorProps` 接口中增加 `locale`：

```typescript
interface ReactImageEditorProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  plugins?: Plugin[];
  toolbar?: {
    items: string[];
  };
  src: string;
  getStage?: (stage: any) => void;
  defaultPluginName?: string;
  crossOrigin?: string;
  download?: DownloadConfig;
  pluginConfig?: PluginConfig;
  locale?: Locale;
}
```

在组件内部创建翻译函数：

```typescript
export default function ReactImageEditor(props: ReactImageEditorProps) {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)

  const currentLocale = props.locale || 'zh-CN'
  const t = createTranslator(currentLocale)

  const pluginFactory = new PluginFactory(props.pluginConfig)
  // ... 其余代码不变
```

在 `EditorContext.Provider` 的 value 中增加 `locale` 和 `t`：

```typescript
<EditorContext.Provider
  value={{
    containerWidth: props.width!,
    containerHeight: props.height!,
    plugins,
    toolbar: props.toolbar!,
    currentPlugin,
    paramValue,
    handlePluginChange,
    handlePluginParamValueChange,
    toolbarItemConfig,
    updateToolbarItemConfig,
    download: props.download!,
    locale: currentLocale,
    t,
  }}
>
```

在 `defaultProps` 中增加：

```typescript
locale: 'zh-CN',
```

- [ ] **Step 8: 修改 `src/components/Toolbar.tsx`，使用 `t` 函数渲染 tooltip**

```typescript
import ParamSetting from './ParamSetting'
import Plugin from '../plugins/Plugin'
import React, { useContext } from 'react'
import Tooltip from 'rc-tooltip'
import { prefixCls } from '../common/constants'
import { EditorContext } from './EditorContext'
import 'rc-tooltip/assets/bootstrap_white.css'

export default function Toolbar() {
  const {
    containerWidth,
    plugins,
    toolbar,
    currentPlugin,
    paramValue,
    handlePluginChange,
    handlePluginParamValueChange,
    toolbarItemConfig,
    t,
  } = useContext(EditorContext)

  const style = { width: containerWidth }

  function getPluginTitle(plugin: Plugin): string {
    if (plugin.titleKey) {
      return t(plugin.titleKey)
    }
    return plugin.title
  }

  function renderPlugin(plugin: Plugin) {
    const isActivated = !!(currentPlugin && currentPlugin.name === plugin.name)
    const paramNames = currentPlugin ? currentPlugin.params : []
    const isDisabled = toolbarItemConfig[plugin.name].disable

    if (!paramNames || paramNames.length === 0) {
      return (
        <span
          key={plugin.name}
          className={`${prefixCls}-toolbar-icon ${isActivated ? 'activated' : ''} ${isDisabled ? 'disabled' : ''}`}
        >
          <i title={getPluginTitle(plugin)} className={plugin.iconfont} onClick={() => handlePluginChange(plugin)} />
        </span>
      )
    }

    return (
      <Tooltip
        key={plugin.name}
        placement="bottom"
        overlay={(
          <ParamSetting
            paramNames={paramNames}
            paramValue={paramValue}
            onChange={handlePluginParamValueChange}
          />
        )}
        visible={isActivated}
        overlayClassName={`${prefixCls}-tooltip`}
        arrowContent={<div className="rc-tooltip-arrow-inner"></div>}
      >
        <span
          key={plugin.name}
          className={`${prefixCls}-toolbar-icon ${isActivated ? 'activated' : ''} ${isDisabled ? 'disabled' : ''}`}
        >
          <i title={getPluginTitle(plugin)} className={plugin.iconfont} onClick={() => handlePluginChange(plugin)} />
        </span>
      </Tooltip>
    )
  }

  return (
    <div className={`${prefixCls}-toolbar`} style={style}>
      {
        toolbar.items.map(item => {
          if (item === '|') return <span className={`${prefixCls}-toolbar-separator`} />
          for(let i = 0; i < plugins.length; i++) {
            if (plugins[i].name === item) {
              return renderPlugin(plugins[i])
            }
          }
          return null
        })
      }
    </div>
  )
}
```

- [ ] **Step 9: 修改 `src/components/ParamSetting/FontSizeSetting.tsx`，使用 i18n**

```typescript
import React, { useContext } from 'react'
import { prefixCls } from '../../common/constants'
import { EditorContext } from '../EditorContext'

interface FontSizeSettingProps {
  value?: number;
  onChange: (fontSize: number) => void;
}

export default function FontSizeSetting(props: FontSizeSettingProps) {
  const { t } = useContext(EditorContext)

  return (
    <span style={{ margin: '0 8px' }}>
      <button
        className={`${prefixCls}-font-size ${props.value === 12 ? prefixCls + '-font-size-activated' : ''}`}
        onClick={() => props.onChange(12)}
      >{t('fontSizeSmall')}</button>
      <button
        className={`${prefixCls}-font-size ${props.value === 16 ? prefixCls + '-font-size-activated' : ''}`}
        onClick={() => props.onChange(16)}
      >{t('fontSizeMedium')}</button>
      <button
        className={`${prefixCls}-font-size ${props.value === 20 ? prefixCls + '-font-size-activated' : ''}`}
        onClick={() => props.onChange(20)}
      >{t('fontSizeLarge')}</button>
    </span>
  )
}
```

- [ ] **Step 10: 修改 `src/plugins/Crop.ts`，裁剪工具栏文案使用 i18n**

在文件顶部增加导入：

```typescript
import { LocaleKey } from '../common/i18n'
```

在类中增加 `titleKey`：

```typescript
titleKey = 'crop' as LocaleKey
```

修改 `createCropToolbar` 方法签名，增加 `hintText` 参数：

```typescript
createCropToolbar = (stage: any, sureBtnEvent: () => void, cancelBtnEvent: () => void, hintText: string) => {
```

将 `createCropToolbar` 方法中的 `document.createTextNode('拖动边框调整图片显示范围')` 替换为：

```typescript
const $textNode = document.createTextNode(hintText)
```

修改 `onDrawEnd` 中的 `createCropToolbar` 调用，传入翻译文案。由于 `DrawEventParams extends EditorContextProps`，而 `EditorContextProps` 已包含 `t` 函数，所以可以直接通过 `drawEventParams.t` 获取：

```typescript
this.createCropToolbar(stage, () => {
  // 裁剪区域太小不允许裁剪
  if (this.getRectWidth() < 2 || this.getRectHeight() < 2) return

  // 提前清除拉伸框
  this.virtualLayer.remove(this.transformer)
  const dataURL = stage.toDataURL({
    x: this.getRectX(),
    y: this.getRectY(),
    width: this.getRectWidth(),
    height: this.getRectHeight(),
    pixelRatio,
    mimeType: 'image/jpeg',
  })
  const imageObj = new Image()
  imageObj.onload = () => {
    reload(imageObj, this.getRectWidth(), this.getRectHeight())
    this.reset(stage)
  }
  imageObj.src = dataURL
  stage.container().style.cursor = 'crosshair'
}, () => {
  this.reset(stage)
  stage.container().style.cursor = 'crosshair'
}, drawEventParams.t('cropHint'))
```

- [ ] **Step 11: 运行 lint 验证**

Run: `cd /Users/kailun/Documents/code/react-img-editor && npm run lint`
Expected: PASS

- [ ] **Step 12: Commit**

```bash
git add src/common/i18n.ts src/common/locales/zh-CN.ts src/common/locales/en.ts src/common/type.tsx src/components/EditorContext.tsx src/index.tsx src/plugins/Plugin.ts src/plugins/Arrow.ts src/plugins/Circle.ts src/plugins/Crop.ts src/plugins/Download.ts src/plugins/Eraser.ts src/plugins/Mosaic.ts src/plugins/Pen.ts src/plugins/Rect.ts src/plugins/Repeal.ts src/plugins/Text.ts src/plugins/ZoomIn.ts src/plugins/ZoomOut.ts src/components/Toolbar.tsx src/components/ParamSetting/FontSizeSetting.tsx
git commit -m "feat: add internationalization support with zh-CN and en locales"
```

---

## 自检清单

### 1. Spec 覆盖度

| TODO 项 | 对应 Task | 状态 |
|---------|-----------|------|
| 动态加载图片 | Task 1 | ✅ |
| 下载图片类型配置 | Task 2 | ✅ |
| 提供插件配置项配置 | Task 3 | ✅ |
| 优化自由画笔书写体验 | Task 4 | ✅ |
| 国际化支持 | Task 5 | ✅ |

### 2. 占位符扫描

无 TBD、TODO、implement later 等占位符。所有代码步骤均包含完整实现。

### 3. 类型一致性

- `DownloadConfig` 在 `type.tsx` 中定义，在 `index.tsx`、`EditorContext.tsx`、`Download.ts` 中使用一致
- `PluginConfig` 在 `type.tsx` 中定义，在 `PluginFactory.ts`、`index.tsx` 中使用一致
- `Locale` / `LocaleKey` 在 `i18n.ts` 中定义，在 `EditorContext.tsx`、`Plugin.ts`、各插件文件中使用一致
- `titleKey` 是 `Plugin` 的可选属性（类型 `LocaleKey`），不破坏现有 `title` 属性，`Toolbar` 中通过 `getPluginTitle` 优先使用 `titleKey`，回退到 `title`
- `t` 函数签名 `(key: LocaleKey) => string` 在 `i18n.ts`、`EditorContext.tsx` 中一致
- `download` 属性在 `EditorContextProps` 中定义，`DrawEventParams extends EditorContextProps` 自动继承，无需重复声明
- `locale` 和 `t` 在 `EditorContextProps` 中定义，同样通过继承传递到 `DrawEventParams`
