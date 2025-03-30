import iconv from 'iconv-lite'

class CPCL {
  /**
   * 通用命令
   * @param {string} content
   * @returns {CPCL}
   */
  addCommand(content) {
    const code = iconv.encode(content + '\r\n', 'gb18030')
    for (let i = 0; i < code.length; ++i) {
      this.command.push(code[i])
    }
    this.rawCommand += content + '\r\n'
    return this
  }

  /**
   * 通用命令(无回车)
   * @param {string} content
   * @returns {CPCL}
   */
  addCommandWithoutEnter(content) {
    const code = iconv.encode(content, 'gb18030')
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
    const width = parseInt((res.width + 7) / 8 * 8 / 8)
    const height = res.height
    const w = res.width
    const pointList = []
    const resultData = []
    this.addCommandWithoutEnter(`CG ${width} ${height} ${x} ${y}`)
    //for循环顺序不要错了，外层遍历高度，内层遍历宽度，因为横向每8个像素点组成一个字节
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < w; x++) {
        let r = res.data[(y * w + x) * 4];
        let g = res.data[(y * w + x) * 4 + 1];
        let b = res.data[(y * w + x) * 4 + 2];
        // 像素灰度值
        let grayColor = r * 0.299 + g * 0.587 + b * 0.114
        //灰度值大于128位
        //1不打印, 0打印 （参考：佳博标签打印机编程手册tspl）
        if (grayColor > 128) {
          pointList.push(1)
        } else {
          pointList.push(0)
        }
      }
    }
    for (let i = 0; i < pointList.length; i += 8) {
      let p = pointList[i] * 128
          + pointList[i + 1] * 64
          + pointList[i + 2] * 32
          + pointList[i + 3] * 16
          + pointList[i + 4] * 8
          + pointList[i + 5] * 4
          + pointList[i + 6] * 2
          + pointList[i + 7]
      resultData.push(p)
    }
    for (let i = 0; i < resultData.length; ++i) {
      //与tspl不一样，测试cpcl打印的图像是反转的，所以要用~来转回来
      const invertedByte = ~resultData[i] & 0xff;
      this.command.push(this.intToByte(invertedByte))
    }
    return this;
  }

  /**
   * 打印位图
   * @param {int} x 横向起始位置
   * @param {int} y 纵向起始位置
   * @param {object} res 内容
   * @returns {CPCL}
   */
  bitmap2(x, y, res) {
    const w = res.width
    const width = parseInt((res.width + 7) / 8 * 8 / 8)
    const height = res.height;
    this.addCommandWithoutEnter(`CG ${width} ${height} ${x} ${y}`)
    const bits = new Uint8Array(height * width);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < w; x++) {
        let r = res.data[(y * w + x) * 4];
        let g = res.data[(y * w + x) * 4 + 1];
        let b = res.data[(y * w + x) * 4 + 2];
        let a = res.data[(y * w + x) * 4 + 3]
        const color = ((a & 0xFF) << 24) | ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | ((b & 0xFF) <<
            0);
        if ((color & 0xFF) > 128) {
          bits[parseInt(y * width + x / 8)] |= (0x80 >> (x % 8));
        }
      }
    }
    for (let i = 0; i < bits.length; i++) {
      //与tspl不一样，测试cpcl打印的图像是反转的，所以要用~来转回来
      this.command.push(this.intToByte(~bits[i]))
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
   * int转byte
   * @param {int} i
   * @returns {*|number}
   */
  intToByte(i) {
    // 此处关键 -- android是java平台 byte数值范围是 [-128, 127]
    // 因为java平台的byte类型是有符号的 最高位表示符号，所以数值范围固定
    // 而图片计算出来的是数值是 0 -255 属于int类型
    // 所以把int 转换成byte类型
    //#ifdef APP-PLUS
    let b = i & 0xFF;
    let c = 0;
    if (b >= 128) {
      c = b % 128;
      c = -1 * (128 - c);
    } else {
      c = b;
    }
    return c
    //#endif
    // 而微信小程序不需要，因为小程序api接收的是 无符号8位
    //#ifdef MP-WEIXIN
    return i
    //#endif
  }
}

export default CPCL

