
import { PluginProps, PluginParamValue } from '../type'

let isPaint = false
const defalutParamValue = {
  strokeWidth: 4,
}
const tiles: any = []
const tileHeight = 10
const tileWidth = 10
let tileRowSize = 0
let tileColumnSize = 0
let width = 0
let height = 0

function drawTile(tiles: any, Konva: any, stage: any, layer: any) {
  tiles = [].concat(tiles)
  tiles.forEach((tile: any) => {
    if (tile.isFilled) {
      return
    }

    if (!tile.color) {
      const dataLen = tile.data.length
      let r = 0, g = 0, b = 0, a = 0
      for (let i = 0; i < dataLen; i += 4) {
        r += tile.data[i]
        g += tile.data[i + 1]
        b += tile.data[i + 2]
        a += tile.data[i + 3]
      }

      // Set tile color.
      const pixelLen = dataLen / 4
      tile.color = {
        r: Math.round(r / pixelLen),
        g: Math.round(g / pixelLen),
        b: Math.round(b / pixelLen),
        a: Math.round(a / pixelLen),
      }
    }

    const color = tile.color
    const x = tile.column * tileWidth
    const y = tile.row * tileHeight
    const w = tile.pixelWidth
    const h = tile.pixelHeight

    const rect = new Konva.Rect({
      globalCompositeOperation: 'source-over',
      x,
      y,
      width: w,
      height: h,
      fill: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`,
    })
    layer.add(rect)
    layer.draw()

    tile.isFilled = true
  })
}

function getTilesByPoint(x: number, y: number, strokeWidth: number) {
  const ts: any = []
  let startRow = Math.max(0, Math.floor(y / tileHeight) - Math.floor(strokeWidth / 2))
  const startColumn = Math.max(0, Math.floor(x / tileWidth) - Math.floor(strokeWidth / 2))
  const endRow = Math.min(tileRowSize, startRow + strokeWidth)
  const endColumn = Math.min(tileColumnSize, startColumn + strokeWidth)

  while (startRow < endRow) {
    let column = startColumn
    while (column < endColumn) {
      ts.push(tiles[startRow * tileColumnSize + column])
      column += 1
    }
    startRow += 1
  }

  return ts
}

export default {
  name: 'mosaic',
  iconfont: 'iconfont icon-mosaic',
  params: ['strokeWidth'],
  onDrawStart: (e: Event, Konva: any, stage: any, layer: any, paramValue: PluginParamValue, imageData: ImageData) => {
    isPaint = true

    width = imageData.width
    height = imageData.height
    tileRowSize = Math.ceil(height / tileHeight)
    tileColumnSize = Math.ceil(width / tileWidth)

    // 将图片切分成一个个大一点的贴片
    for (let i = 0; i < tileRowSize; i++) {
      for (let j = 0; j < tileColumnSize; j++) {
        const tile = {
          row: i,
          column: j,
          pixelWidth: tileWidth,
          pixelHeight: tileHeight,
          data: [],
        }

        let data: any = []
        const pixelPosition = width * 4 * tileHeight * tile.row + tile.column * tileWidth * 4
        // 每个贴片包含的所有像素数据，遍历贴片范围内的每一列
        for (let i = 0, j = tile.pixelHeight; i < j; i++) {
          const position = pixelPosition + width * 4 * i
          // 贴片范围内一行的像素数据，等于 贴片宽度 * 4
          data = [...data, ...imageData.data.slice(position, position + tile.pixelWidth * 4)]
        }
        tile.data = data
        tiles.push(tile)
      }
    }
  },

  onDraw: (e: Event, Konva: any, stage: any, layer: any, paramValue: PluginParamValue) => {
    if (!isPaint) return

    const strokeWidth = (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : defalutParamValue.strokeWidth
    const pos = stage.getPointerPosition()
    drawTile(getTilesByPoint(pos.x, pos.y, strokeWidth), Konva, stage, layer)
  },

  onDrawEnd: () => {
    isPaint = false
  },
}  as PluginProps