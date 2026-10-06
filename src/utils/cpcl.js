import {encode} from 'iconv-lite'

class CPCL {
  /**
   * 通用命令
   * @param {string} content
   * @returns {CPCL}
   */
  addCommand(content) {
    const code = encode(`${content}\r\n`, 'gb18030')
    for (let i = 0; i < code.length; ++i) {
      this.command.push(code[i])
    }
    this.rawCommand += `${content}\r\n`
    return this
  }

  /**
   * 通用命令(无回车)
   * @param {string} content
   * @returns {CPCL}
   */
  addCommandWithoutEnter(content) {
    const code = encode(content, 'gb18030')
    for (let i = 0; i < code.length; ++i) {
      this.command.push(code[i])
    }
    this.rawCommand += content
    return this
  }

  /**
   * 初始化
   * @param {int} offset 偏移量
   * @param {int} horizontalDpi 横向DPI
   * @param {int} verticalDpi 纵向DPI
   * @param {int} height 最大高度
   * @param {int} qty 数量
   * @returns {CPCL}
   */
  init(offset, horizontalDpi, verticalDpi, height, qty) {
    this.command = []
    this.rawCommand = ''
    this.addCommand(`! ${offset} ${horizontalDpi} ${verticalDpi} ${height} ${qty}`)
    return this
  }

  /**
   * 设置页面宽度
   * @param {int} width 宽度
   * @returns {CPCL}
   */
  pageWidth(width) {
    this.addCommand(`PW ${width}`)
    return this
  }

  /**
   * 靠左
   * @returns {CPCL}
   */
  left() {
    this.addCommand(`LEFT`)
    return this
  }

  /**
   * 靠右
   * @returns {CPCL}
   */
  right() {
    this.addCommand(`RIGHT`)
    return this
  }

  /**
   * 居中
   * @returns {CPCL}
   */
  center() {
    this.addCommand(`CENTER`)
    return this
  }

  /**
   * 文本（横向）
   * @param {int|string} font 字体名称/编号
   * @param {int} size 忽略该参数，请输入任意数字
   * @param {int} x 横向起始位置
   * @param {int} y 纵向起始位置
   * @param {string} data 要打印的文本
   * @returns {CPCL}
   */
  text(font, size, x, y, data) {
    this.addCommand(`T ${font} ${size} ${x} ${y} ${data}`)
    return this
  }

  /**
   * 文本（纵向）
   * @param {int|string} font 字体名称/编号
   * @param {int} size 忽略该参数，请输入任意数字
   * @param {int} x 横向起始位置
   * @param {int} y 纵向起始位置
   * @param {string} data 要打印的文本
   * @returns {CPCL}
   */
  vText(font, size, x, y, data) {
    this.addCommand(`VT ${font} ${size} ${x} ${y} ${data}`)
    return this
  }

  /**
   * 字体放大（标签打印后仍保持有效，取消则设置0 0）
   * @param {int} w 宽度放大倍数，有效放大倍数为 1 到 16
   * @param {int} h 高度放大倍数，有效放大倍数为 1 到 16
   * @returns {CPCL}
   */
  setMag(w, h) {
    this.addCommand(`SETMAG ${w} ${h}`)
    return this
  }

  /**
   * 字体加粗（标签打印后仍保持有效，取消则设置0）
   * @param {int} value 0不加粗，1加粗
   * @returns {CPCL}
   */
  setBold(value) {
    this.addCommand(`SETBOLD ${value}`)
    return this
  }

  /**
   * 矩形
   * @param {int} startX 起始点的 X 坐标
   * @param {int} startY 起始点的 Y 坐标
   * @param {int} endX 终止点的 X 坐标
   * @param {int} endY 终止点的 Y 坐标
   * @param {int} width 线条的单位宽度
   * @returns {CPCL}
   */
  box(startX, startY, endX, endY, width) {
    this.addCommand(`BOX ${startX} ${startY} ${endX} ${endY} ${width}`)
    return this
  }

  /**
   * 线条
   * @param {int} startX 起始点的 X 坐标
   * @param {int} startY 起始点的 Y 坐标
   * @param {int} endX 终止点的 X 坐标
   * @param {int} endY 终止点的 Y 坐标
   * @param {int} width 线条的单位宽度
   * @returns {CPCL}
   */
  line(startX, startY, endX, endY, width) {
    this.addCommand(`L ${startX} ${startY} ${endX} ${endY} ${width}`)
    return this
  }

  /**
   * 不展示条形码下方文本
   * @returns {CPCL}
   */
  barcodeTextOFF() {
    this.addCommand(`BT OFF`)
    return this
  }

  /**
   * 条形码下方文本
   * @param {int} fontNumber 注释条码时要使用的字体号
   * @param {int} fontSize 忽略该参数，请输入任意数字
   * @param {int} offset 文本距离条码的单位偏移量
   * @returns {CPCL}
   */
  barcodeText(fontNumber, fontSize, offset) {
    this.addCommand(`BT ${fontNumber} ${fontSize} ${offset}`)
    return this
  }

  /**
   * 条形码（横向）
   * @param {string} type 39-Code39/93-Code93/128-Code128等
   * @param {int} width 窄条的单位宽度
   * @param {int} ratio 宽条与窄条的比率：0，1，2，3，4，20...
   * @param {int} height 条码的单位高度
   * @param {int} x 横向起始位置
   * @param {int} y 纵向起始位置
   * @param {string} data 条码数据
   * @returns {CPCL}
   */
  barcode(type, width, ratio, height, x, y, data) {
    this.addCommand(`B ${type} ${width} ${ratio} ${height} ${x} ${y} ${data}`)
    return this
  }

  /**
   * 条形码（纵向）
   * @param {string} type 39-Code39/93-Code93/128-Code128等
   * @param {int} width 窄条的单位宽度
   * @param {int} ratio 宽条与窄条的比率：0，1，2，3，4，20...
   * @param {int} height 条码的单位高度
   * @param {int} x 横向起始位置
   * @param {int} y 纵向起始位置
   * @param {string} data 条码数据
   * @returns {CPCL}
   */
  vBarcode(type, width, ratio, height, x, y, data) {
    this.addCommand(`VB ${type} ${width} ${ratio} ${height} ${x} ${y} ${data}`)
    return this
  }

  /**
   * 二维码（横向）
   * @param {int} x 横向起始位置
   * @param {int} y 纵向起始位置
   * @param {int} m QR Code 规范编号,1 或 2，推荐为 2
   * @param {int} n 模块的单位宽度/单位高度1-32，默认为 6
   * @param {int} level 纠错等级：H Q M L
   * @param {string} data
   * @returns {CPCL}
   */
  qrcode(x, y, m, n, level, data) {
    this.addCommand(`B QR ${x} ${y} M ${m} N ${n}`)
        .addCommand(`${level}A,${data}`)
        .addCommand(`ENDQR`)
    return this
  }

  /**
   * 二维码（纵向）
   * @param {int} x 横向起始位置
   * @param {int} y 纵向起始位置
   * @param {int} m QR Code 规范编号,1 或 2，推荐为 2
   * @param {int} n 模块的单位宽度/单位高度1-32，默认为 6
   * @param {int} level 纠错等级：H Q M L
   * @param {string} data
   * @returns {CPCL}
   */
  vQrcode(x, y, m, n, level, data) {
    this.addCommand(`VB QR ${x} ${y} M ${m} N ${n}`)
        .addCommand(`${level}A,${data}`)
        .addCommand(`ENDQR`)
    return this
  }

  /**
   * 电机的最高速度级别
   * @param {int} level 0-5
   * @returns {CPCL}
   */
  speed(level) {
    this.addCommand(`SPEED ${level}`)
    return this
  }

  /**
   * 蜂鸣器
   * @param {int} length 蜂鸣持续时间，以 1/8 秒为单位递增
   * @returns {CPCL}
   */
  beep(length) {
    this.addCommand(`BEEP ${length}`)
    return this
  }

  /**
   * 横向打印压缩图形
   * @param {int} width 图像的宽度（以字节为单位）
   * @param {int} height 图像的高度（以点为单位）
   * @param {int} x 横向起始位置
   * @param {int} y 纵向起始位置
   * @param {string} data 图形数据，由上至下，由左至右
   * @returns {CPCL}
   */
  cg(width, height, x, y, data) {
    this.addCommand(`CG ${width} ${height} ${x} ${y} ${data}`)
    return this
  }

  /**
   * 横向打印扩展图形
   * @param {int} width 图像的宽度（以字节为单位）
   * @param {int} height 图像的高度（以点为单位）
   * @param {int} x 横向起始位置
   * @param {int} y 纵向起始位置
   * @param {string} data 图形数据，由上至下，由左至右
   * @returns {CPCL}
   */
  eg(width, height, x, y, data) {
    this.addCommand(`EG ${width} ${height} ${x} ${y} ${data}`)
    return this
  }

  /**
   * 打印位图
   * @param {int} x 横向起始位置
   * @param {int} y 纵向起始位置
   * @param {object} res 内容
   * @returns {CPCL}
   */
  bitmap(x, y, res) {
    // 每行字节数 = ceil(宽度 / 8)，CG 头里的宽度单位是字节，不是点
    const width = parseInt((res.width + 7) / 8 * 8 / 8)
    const height = res.height
    const w = res.width
    const resultData = []
    this.addCommandWithoutEnter(`CG ${width} ${height} ${x} ${y}`)
    //for循环顺序不要错了，外层遍历高度，内层遍历该行的字节，因为横向每8个像素点组成一个字节
    //每行都要按 width*8 位重新对齐：宽度不是8的倍数时，行尾多出的补位像素不打印(1)。
    //否则比特位会在行与行之间累积错位(图像斜切)，且总字节数少于头部声明的 width*height，
    //打印机就会把后面的命令当成图像数据吃掉
    for (let y = 0; y < height; y++) {
      for (let i = 0; i < width; i++) {
        let p = 0
        for (let j = 0; j < 8; j++) {
          const x = i * 8 + j
          //1不打印, 0打印
          let bit = 1
          if (x < w) {
            const index = (y * w + x) * 4
            // 透明像素按白纸合成：c = c*a + 255*(1-a)。a=255（不透明）时结果不变，
            // a=0（全透明）合成后为白（不打印）；否则PNG的透明背景会被当成黑色整块印出来
            const alpha = res.data[index + 3] / 255
            const r = res.data[index] * alpha + 255 * (1 - alpha)
            const g = res.data[index + 1] * alpha + 255 * (1 - alpha)
            const b = res.data[index + 2] * alpha + 255 * (1 - alpha)
            // 像素灰度值，灰度值大于128不打印
            const grayColor = r * 0.299 + g * 0.587 + b * 0.114
            bit = grayColor > 128 ? 1 : 0
          }
          p = (p << 1) | bit
        }
        resultData.push(p)
      }
    }
    for (let i = 0; i < resultData.length; ++i) {
      //与tspl不一样，cpcl打印的图像是相反的，所以要用~来转回来
      const invertedByte = ~resultData[i] & 0xff;
      this.command.push(invertedByte)
    }
    return this;
  }

  /**
   * 打印
   * @returns {CPCL}
   */
  print() {
    this.addCommand("PRINT")
    return this
  }

  /**
   * 获取命令信息
   * @returns {[]}
   */
  getData() {
    return this.command
  }

  /**
   * 获取原始命令信息
   * @returns {[]}
   */
  getRawData() {
    return this.rawCommand
  }

  /**
   * int转有符号byte（当前未被调用，保留作参考）
   * 只有把命令数组直接交给原生安卓插件时才需要：那种接口要传 byte[]，取值必须是
   * java 的有符号字节 -128~127。本项目走的是 batchWrite -> ArrayBuffer，交给
   * uni.writeBLECharacteristicValue 的始终是无符号字节，所以位图数据直接 push 0-255 即可。
   * @param {int} i
   * @returns {number}
   */
  intToByte(i) {
    const b = i & 0xFF
    return b >= 128 ? b - 256 : b
  }
}

export default CPCL

