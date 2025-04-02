import {encode} from 'iconv-lite'

class TSPL {
  /**
   * 初始化
   * @returns {TSPL}
   */
  init() {
    this.command = []
    this.rawCommand = ''
    return this
  }

  /**
   * 通用命令
   * @param {string} content
   * @returns {TSPL}
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
   * @returns {TSPL}
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
   * 设定卷标纸的宽度和长度(毫米)
   * @param {int} width 标签纸的宽度（不含背纸）
   * @param {int} height 标签纸的长度（不含背纸）
   * @returns {TSPL}
   */
  size(width, height) {
    this.addCommand(`SIZE ${width} mm,${height} mm`)
    return this
  };

  /**
   * 设定卷标纸的宽度和长度(英寸)
   * @param {int} width 标签纸的宽度（不含背纸）
   * @param {int} height 标签纸的长度（不含背纸）
   * @returns {TSPL}
   */
  sizeInch(width, height) {
    this.addCommand(`SIZE ${width},${height}`)
    return this
  };

  /**
   * 控制打印速度
   * @param {number} level 1-6
   * @returns {TSPL}
   */
  speed(level) {
    this.addCommand(`SPEED ${level}`)
    return this
  };

  /**
   * 设置打印浓度
   * @param {int} level
   * @returns {TSPL}
   */
  density(level) {
    this.addCommand(`DENSITY ${level}`)
    return this
  };

  /**
   * 设置纸间间隙(毫米)
   * @param {int} length 两标签纸中间的垂直距离
   * @returns {TSPL}
   */
  gap(length) {
    this.addCommand(`GAP ${length} mm,0 mm`)
    return this
  };

  /**
   * 设置纸间间隙(英寸)
   * @param {int} length 两标签纸中间的垂直距离
   * @returns {TSPL}
   */
  gapInch(length) {
    this.addCommand(`GAP ${length},0`)
    return this
  };

  /**
   * 选择国际字符集
   * @param {string} charset
   * @returns {TSPL}
   */
  country(charset) {
    this.addCommand(`COUNTRY ${charset}`)
    return this
  };

  /**
   * 选择国际代码页
   * @param {string} codepage
   * @returns {TSPL}
   */
  codepage(codepage) {
    this.addCommand(`CODEPAGE ${codepage}`)
    return this
  }

  /**
   * 清除图像缓冲区（image buffer)的数据
   * @returns {TSPL}
   */
  cls() {
    this.addCommand(`CLS`)
    return this
  };

  /**
   * 将标签纸向前推送指定的长度
   * 200 DPI:1 mm = 8 dots
   * 300 DPI:1 mm = 12 dots
   * @param {int} length 1≤n≤9999，单位 dot
   * @returns {TSPL}
   */
  feed(length) {
    this.addCommand(`FEED ${length}`)
    return this
  };

  /**
   * 将标签纸向后回拉指定的长度
   * 200 DPI:1 mm = 8 dots
   * 300 DPI:1 mm = 12 dots
   * @param {int} length 1≤n≤9999，单位 dot
   * @returns {TSPL}
   */
  backFeed(length) {
    this.addCommand(`BACKFEED ${length}`)
    return this
  }

  /**
   * 设置打印方向
   * @returns {TSPL}
   * @param {int} m 0或1 出纸方向
   * @param {int} n 0或1 打印字体方向 0正常，1镜像
   */
  direction(m, n) {
    this.addCommand(`DIRECTION ${m},${n}`)
    return this
  };

  /**
   * 定义卷标的参考坐标原点
   * @param {int} x 水平方向的坐标位置,单位 dot
   * @param {int} y 垂直方向的坐标位置,单位 dot
   * @returns {TSPL}
   */
  reference(x, y) {
    this.addCommand(`REFERENCE ${x},${y}`)
    return this
  };

  /**
   * 控制打印机进一张标签纸
   * @returns {TSPL}
   */
  formFeed() {
    this.addCommand(`FORMFEED`)
    return this
  };

  /**
   * 将标签纸向前推送至下一张标签纸的起点
   * 标签尺寸和间隙需要在本条指令前设置
   * @returns {TSPL}
   */
  home() {
    this.addCommand(`HOME`)
    return this
  };

  /**
   * 控制蜂鸣器的频率
   * @param {int} level 音阶:0-9
   * @param {int} interval 间隔时间:1-4095
   * @returns {TSPL}
   */
  sound(level, interval) {
    this.addCommand(`SOUND ${level},${interval}`)
    return this
  };

  /**
   * 若经过所设定的长度仍无法侦测到垂直间距，则打印机在连续纸模式工作(毫米)
   * @param {int} limit
   * @returns {TSPL}
   */
  limitFeed(limit) {
    this.addCommand(`LIMITFEED ${limit} mm`)
    return this
  };

  /**
   * 若经过所设定的长度仍无法侦测到垂直间距，则打印机在连续纸模式工作(英寸)
   * @param {int} limit
   * @returns {TSPL}
   */
  limitFeedInch(limit) {
    this.addCommand(`LIMITFEED ${limit}`)
    return this
  };

  /**
   * 绘制线条
   * @param {int} x 起始x轴坐标 单位 dot
   * @param {int} y 起始y轴坐标 单位 dot
   * @param {int} width 线条长度 单位 dot
   * @param {int} height 线条高度 单位 dot
   */
  bar(x, y, width, height) {
    this.addCommand(`BAR ${x},${y},${width},${height}`)
    return this
  };

  /**
   * 绘制方框
   * @param {int} startX 方框左上角x轴坐标 单位 dot
   * @param {int} startY 方框左上角y轴坐标 单位 dot
   * @param {int} endX  方框右下角x轴坐标 单位 dot
   * @param {int} endY  方框右下角y轴坐标 单位 dot
   * @param {int} thickness 方框线宽 单位 dot
   */
  box(startX, startY, endX, endY, thickness) {
    this.addCommand(`BOX ${startX},${startY},${endX},${endY},${thickness}`)
    return this
  };

  /**
   * 清除影像缓冲区部分区域的数据
   * @param {int} startX 清除区域的左上角 X 座标，单位 dot
   * @param {int} startY 清除区域的左上角 Y 座标，单位 dot
   * @param {int} widthX 清除区域宽度，单位 dot
   * @param {int} heightY 清除区域宽度，单位 dot
   * @returns {TSPL}
   */
  erase(startX, startY, widthX, heightY) {
    this.addCommand(`ERASE ${startX},${startY},${widthX},${heightY}`)
    return this
  };

  /**
   * 将指定的区域反相打印
   * @param {int} startX 反相区域左上角 X 坐标，单位 dot
   * @param {int} startY 反相区域左上角 Y 坐标，单位 dot
   * @param {int} widthX 反相区域宽度，单位 dot
   * @param {int} heightY 反相区域高度，单位 dot
   * @returns {TSPL}
   */
  reverse(startX, startY, widthX, heightY) {
    this.addCommand(`REVERSE ${startX},${startY},${widthX},${heightY}`)
    return this
  };

  /**
   * 打印文字（无旋转）
   * @param {int} x 文字 X 方向起始点坐标
   * @param {int} y 文字 Y 方向起始点坐标
   * @param {int|string} font 字体名称
   * @param {int} zoomX X 方向放大倍率 1-10
   * @param {int} zoomY Y 方向放大倍率 1-10
   * @param {string} data 文字内容
   * @returns {TSPL}
   */
  text(x, y, font, zoomX, zoomY, data) { //打印文字
    this.addCommand(`TEXT ${x},${y},"${font}",0,${zoomX},${zoomY},"${data}"`)
    return this
  };

  /**
   * 打印文字（可设置选中角度）
   * @param {int} x 文字 X 方向起始点坐标
   * @param {int} y 文字 Y 方向起始点坐标
   * @param {int|string} font 字体名称
   * @param {int} rotation 文字旋转角度（顺时针方向）
   * @param {int} zoomX X 方向放大倍率 1-10
   * @param {int} zoomY Y 方向放大倍率 1-10
   * @param {string} data 文字内容
   * @returns {TSPL}
   */
  textRotation(x, y, font, rotation, zoomX, zoomY, data) { //打印文字
    this.addCommand(`TEXT ${x},${y},"${font}",${rotation},${zoomX},${zoomY},"${data}"`)
    return this
  };

  /**
   * 打印二维码（无旋转）
   * @param {int} x 二维码水平方向起始点坐标
   * @param {int} y 二维码垂直方向起始点坐标
   * @param {int} level 选择 QRCODE 纠错等级
   * @param {int} width 二维码宽度 1-10
   * @param {string} mode 手动 A /自动编码 M
   * @param {string} data 二维码内容
   * @returns {TSPL}
   */
  qrcode(x, y, level, width, mode, data) {
    this.addCommand(`QRCODE ${x},${y},${level},${width},${mode},0,"${data}"`)
    return this
  };

  /**
   * 打印二维码（可设置选中角度）
   * @param {int} x 二维码水平方向起始点坐标
   * @param {int} y 二维码垂直方向起始点坐标
   * @param {int} level 选择 QRCODE 纠错等级
   * @param {int} width 二维码宽度 1-10
   * @param {string} mode 手动 A /自动编码 M
   * @param {int} rotation 旋转角度（顺时针方向）
   * @param {string} data 二维码内容
   * @returns {TSPL}
   */
  qrcodeRotation(x, y, level, width, mode, rotation, data) {
    this.addCommand(`QRCODE ${x},${y},${level},${width},${mode},${rotation},"${data}"`)
    return this
  };

  /**
   * 条形码（无旋转）
   * @param {int} x 左上角水平坐标起点，以点（dot）表示
   * @param {int} y 左上角垂直坐标起点，以点（dot）表示
   * @param {string} type 条码类型
   * @param {int} height 条形码高度，以点（dot）表示
   * @param {int} readable 0 表示人眼不可识，1 表示人眼可识
   * @param {int} narrow 窄 bar 宽度，以点（dot）表示
   * @param {int} wide 宽 bar 宽度，以点（dot）表示
   * @param {string} data 条码内容
   * @returns {TSPL}
   */
  barcode(x, y, type, height, readable, narrow, wide, data) {
    this.addCommand(`BARCODE ${x},${y},"${type}",${height},${readable},0,${narrow},${wide},"${data}"`)
    return this
  };

  /**
   * 条形码（可设置选中角度）
   * @param {int} x 左上角水平坐标起点，以点（dot）表示
   * @param {int} y 左上角垂直坐标起点，以点（dot）表示
   * @param {string} type 条码类型
   * @param {int} height 条形码高度，以点（dot）表示
   * @param {int} readable 0 表示人眼不可识，1 表示人眼可识
   * @param rotation 旋转角度，顺时针方向
   * @param {int} narrow 窄 bar 宽度，以点（dot）表示
   * @param {int} wide 宽 bar 宽度，以点（dot）表示
   * @param {string} type 条码类型
   * @param {string} data 条码内容
   * @returns {TSPL}
   */
  barcodeRotation(x, y, type, height, readable, rotation, narrow, wide, data) {
    this.addCommand(`BARCODE ${x},${y},${type},${height},${readable},${rotation},${narrow},${wide},"${data}"`)
    return this
  };

  /**
   * 打印页面
   * @returns {TSPL}
   */
  print() {
    this.addCommand(`PRINT 1,1`)
    return this
  };

  /**
   * 打印页面（多份）
   * @param {int} m 指定打印的份数
   * @param {int} n 每张标签需重复打印的张数
   * @returns {TSPL}
   */
  printMulti(m, n) {
    this.addCommand(`PRINT ${m},${n}`)
    return this
  }

  /**
   * 获取打印数据
   * @returns {[]}
   */
  getData() {
    return this.command
  };

  /**
   * 获取原始命令
   * @returns {string}
   */
  getRawData() {
    return this.rawCommand
  }

  /**
   * 绘制位图（原始命令）
   * @param {int} x 位图左上角 X 坐标
   * @param {int} y 位图左上角 Y 坐标
   * @param {int} width 位图的宽度，单位 byte
   * @param {int} height 位图的高度，单位 dot
   * @param {int} mode 位图绘制模式 0-OVERWRITE 1-OR 2-XOR
   * @param {string} data 16 进制图像数据
   * @returns {TSPL}
   */
  bitmapOrigin(x, y, width, height, mode, data) {
    this.addCommand(`BITMAP ${x},${y},${width},${height},${mode},${data}`)
    return this;
  }

  /**
   * 绘制位图（从画布中获取图像信息）
   * @param {int} x 位图左上角 X 坐标
   * @param {int} y 位图左上角 Y 坐标
   * @param {int} mode 位图绘制模式 0-OVERWRITE 1-OR 2-XOR
   * @param {object} res
   * @returns {TSPL}
   */
  bitmap(x, y, mode, res) {
    const width = parseInt((res.width + 7) / 8 * 8 / 8)
    const height = res.height
    const w = res.width
    const pointList = []
    const resultData = []
    this.addCommandWithoutEnter(`BITMAP ${x},${y},${width},${height},${mode},`)

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
      this.command.push(this.intToByte(resultData[i]))
    }
    return this;
  }

  /**
   * 绘制位图（从画布中获取图像信息）
   * @param {int} x 位图左上角 X 坐标
   * @param {int} y 位图左上角 Y 坐标
   * @param {int} mode 位图绘制模式 0-OVERWRITE 1-OR 2-XOR
   * @param {object} res
   * @returns {TSPL}
   */
  bitmap2(x, y, mode, res) {
    const width = parseInt((res.width + 7) / 8 * 8 / 8)
    const height = res.height
    const w = res.width
    this.addCommandWithoutEnter(`BITMAP ${x},${y},${width},${height},${mode},`)
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
      this.command.push(this.intToByte(bits[i]))
    }
    return this;
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

export default TSPL
