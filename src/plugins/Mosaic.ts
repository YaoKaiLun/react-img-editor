
import Konva from 'konva'
import Plugin from './Plugin'
import { DrawEventParams, PluginParamValue, PluginParamName } from '../common/type'
import { uuid } from '../common/utils'

const tileHeight = 5
const tileWidth = 5

export default class Mosaic extends Plugin {
  name = 'mosaic'
  iconfont = 'iconfont icon-mosaic'
  title = '马赛克'
  params = ['strokeWidth'] as PluginParamName[]
  defaultParamValue = {
    strokeWidth: 2,
  } as PluginParamValue

  isPaint = false
  tiles: any = []
  tileRowSize = 0
  tileColumnSize = 0
  width = 0
  height = 0
  rectGroup: any = null

  drawTile = (tiles: any, drawLayer: any) => {
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
      this.rectGroup.add(rect)

      tile.isFilled = true
    })

    drawLayer.add(this.rectGroup)
    drawLayer.draw()
  }

  getTilesByPoint = (x: number, y: number, strokeWidth: number) => {
    const ts: any = []
    let startRow = Math.max(0, Math.floor(y / tileHeight) - Math.floor(strokeWidth / 2))
    const startColumn = Math.max(0, Math.floor(x / tileWidth) - Math.floor(strokeWidth / 2))
    const endRow = Math.min(this.tileRowSize, startRow + strokeWidth)
    const endColumn = Math.min(this.tileColumnSize, startColumn + strokeWidth)

    while (startRow < endRow) {
      let column = startColumn
      while (column < endColumn) {
        ts.push(this.tiles[startRow * this.tileColumnSize + column])
        column += 1
      }
      startRow += 1
    }

    return ts
  }

  onDrawStart = (drawEventParams: DrawEventParams) => {
    const {stage, imageData} = drawEventParams
    this.tiles = []
    this.width = stage.width()
    this.height = stage.height()
    this.tileRowSize = Math.ceil(this.height / tileHeight)
    this.tileColumnSize = Math.ceil(this.width / tileWidth)

    this.rectGroup = new Konva.Group({id: uuid()})

    // 将图片切分成一个个大一点的贴片
    for (let i = 0; i < this.tileRowSize; i++) {
      for (let j = 0; j < this.tileColumnSize; j++) {
        const tile = {
          row: i,
          column: j,
          pixelWidth: tileWidth,
          pixelHeight: tileHeight,
          data: [],
        }

        let data: any = []
        // 转换为像素图形下，起始像素位置
        const pixelPosition = (this.width * tileHeight * tile.row + tile.column * tileWidth) * 4
        // 转换为像素图形下，包含多少行
        const pixelRowAmount = tile.pixelHeight
        // 计算，转换为像素图形使，一个贴片所包含的所有像素数据。先遍历贴片范围内的每一列，每一列中再单独统计行的像素数量
        for (let i = 0; i < pixelRowAmount; i++) {
          // 当前列的起始像素位置
          const position = pixelPosition + this.width * 4 * i
          // 贴片范围内一行的像素数据，等于贴片宽度 * 4
          data = [...data, ...imageData.data.slice(position, position + tile.pixelWidth * 4)]
        }
        tile.data = data
        this.tiles.push(tile)
      }
    }

    this.isPaint = true
  }

  onDraw = (drawEventParams: DrawEventParams) => {
    const {stage, drawLayer, paramValue} = drawEventParams
    const pos = stage.getPointerPosition()
    if (!this.isPaint || !pos) return

    const strokeWidth = (paramValue && paramValue.strokeWidth) ? paramValue.strokeWidth : this.defaultParamValue.strokeWidth
    this.drawTile(this.getTilesByPoint(pos.x, pos.y, strokeWidth!), drawLayer)
  }

  onDrawEnd = (drawEventParams: DrawEventParams) => {
    const {pubSub} = drawEventParams
    this.isPaint = false
    pubSub.pub('PUSH_HISTORY', this.rectGroup)
  }

  onLeave = () => {
    this.isPaint = false
  }
}