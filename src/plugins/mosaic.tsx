
import Konva from 'konva'
import { PluginProps } from '../type'

let isPaint = false
const defalutParamValue = {
  strokeWidth: 4,
}
const tiles: any = []
const tileHeight = 5
const tileWidth = 5
let tileRowSize = 0
let tileColumnSize = 0
let width = 0
let height = 0
let rectGroup: any = null

function drawTile(tiles: any, layer: any) {
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
    rectGroup.add(rect)

    tile.isFilled = true
  })

  layer.add(rectGroup)
  layer.draw()
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
  onDrawStart: ({stage, imageData}) => {
    isPaint = true
    width = stage.width()
    height = stage.height()
    tileRowSize = Math.ceil(height / tileHeight)
    tileColumnSize = Math.ceil(width / tileWidth)

    rectGroup = new Konva.Group()

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
        // 转换为像素图形下，起始像素位置
        const pixelPosition = (width * tileHeight * tile.row + tile.column * tileWidth) * 4
        // 转换为像素图形下，包含多少行
        const pixelRowAmount = tile.pixelHeight
        // 计算，转换为像素图形使，一个贴片所包含的所有像素数据。先遍历贴片范围内的每一列，每一列中再单独统计行的像素数量
        for (let i = 0; i < pixelRowAmount; i++) {
          // 当前列的起始像素位置
          const position = pixelPosition + width * 4 * i
          // 贴片范围内一行的像素数据，等于贴片宽度 * 4
          data = [...data, ...imageData.data.slice(position, position + tile.pixelWidth * 4)]
        }
        tile.data = data
        tiles.push(tile)
      }
    }
  },

  onDraw: ({stage, layer, paramValue}) => {
    if (!isPaint) return

    const strokeWidth = (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : defalutParamValue.strokeWidth
    const pos = stage.getPointerPosition()
    drawTile(getTilesByPoint(pos.x, pos.y, strokeWidth), layer)
  },

  onDrawEnd: ({historyStack}) => {
    isPaint = false
    historyStack.push(rectGroup)
  },
}  as PluginProps