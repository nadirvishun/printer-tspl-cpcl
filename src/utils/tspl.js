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
   * 设置打印机的打印方向及是否镜像（该设置会保存在打印机内存里）
   * 语法按手册是 DIRECTION n[,m]：n 是打印方向、m 是镜像；注意佳博的TSPL手册只写了 n（没有镜像参数）
   * @param {int} n 打印方向：0或1，见手册示意图
   * @param {int} [m] 镜像：0正常，1镜像；不传就不拼进命令（手册范例就是 DIRECTION 0）
   * @returns {TSPL}
   */
  direction(n, m) {
    //m是可选参数，不传就不拼进命令，不替调用方补默认值
    const opt = m === undefined ? '' : `,${m}`
    this.addCommand(`DIRECTION ${n}${opt}`)
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
   * 三种单位形式共用这一份模板，limitFeedMm/limitFeedInch/limitFeedDot 只是换单位后缀委托进来
   * @param {int} n 最小的纸张侦测长度
   * @param {int} [minpaper] 最小的纸张大小，用于侦测预印好的标签；须与maxgap成对给，此参数仅V6.98.7 EZ之后的版本支持
   * @param {int} [maxgap] 最大的间隙大小；须与minpaper成对给，此参数仅V6.98.7 EZ之后的版本支持
   * @param {string} [unit] 内部用、别直接传：单位后缀 ''(英制inch) / ' mm' / ' dot'，默认 ' mm'
   * @returns {TSPL}
   */
  limitFeed(n, minpaper, maxgap, unit = ' mm') {
    const hasRange = minpaper !== undefined || maxgap !== undefined
    if (hasRange && (minpaper === undefined || maxgap === undefined)) {
      //手册没给这两个参数单独的默认值，只给一个时没法替调用方补另一个，所以报错而不是静默丢掉
      throw new Error('LIMITFEED 的 minpaper 与 maxgap 必须成对传，或者都不传')
    }
    const range = hasRange ? `,${minpaper}${unit},${maxgap}${unit}` : ''
    this.addCommand(`LIMITFEED ${n}${unit}${range}`)
    return this
  };

  /**
   * 若经过所设定的长度仍无法侦测到垂直间距，则打印机在连续纸模式工作(英寸)
   * @param {int} n 最小的纸张侦测长度
   * @param {int} [minpaper] 最小的纸张大小，用于侦测预印好的标签；须与maxgap成对给，此参数仅V6.98.7 EZ之后的版本支持
   * @param {int} [maxgap] 最大的间隙大小；须与minpaper成对给，此参数仅V6.98.7 EZ之后的版本支持
   * @returns {TSPL}
   */
  limitFeedInch(n, minpaper, maxgap) {
    return this.limitFeed(n, minpaper, maxgap, '')
  };

  /**
   * 同上，公制(mm)：LIMITFEED n mm[,...]
   * @param {int} n 最小的纸张侦测长度
   * @param {int} [minpaper] 最小的纸张大小，用于侦测预印好的标签；须与maxgap成对给，此参数仅V6.98.7 EZ之后的版本支持
   * @param {int} [maxgap] 最大的间隙大小；须与minpaper成对给，此参数仅V6.98.7 EZ之后的版本支持
   * @returns {TSPL}
   */
  limitFeedMm(n, minpaper, maxgap) {
    return this.limitFeed(n, minpaper, maxgap, ' mm')
  };

  /**
   * 若经过所设定的长度仍无法侦测到垂直间距，则打印机在连续纸模式工作(以dot为单位)
   * 此条指令仅在V6.34及以后版本Firmware中支持
   * @param {int} n 最小的纸张侦测长度
   * @param {int} [minpaper] 最小的纸张大小，用于侦测预印好的标签；须与maxgap成对给，此参数仅V6.98.7 EZ之后的版本支持
   * @param {int} [maxgap] 最大的间隙大小；须与minpaper成对给，此参数仅V6.98.7 EZ之后的版本支持
   * @returns {TSPL}
   */
  limitFeedDot(n, minpaper, maxgap) {
    return this.limitFeed(n, minpaper, maxgap, ' dot')
  };

  /**
   * 绘制线条
   * @param {int} x 起始x轴坐标 单位 dot
   * @param {int} y 起始y轴坐标 单位 dot
   * @param {int} width 线条长度 单位 dot
   * @param {int} height 线条高度 单位 dot
   * @returns {TSPL}
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
   * @param {int} [radius] 圆角半径（0就是直角），不传就不拼进命令；此参数仅V5.28EZ之后的版本支持
   * @returns {TSPL}
   */
  box(startX, startY, endX, endY, thickness, radius) {
    //radius是可选参数，不传就不拼进命令，不替调用方补默认值
    const opt = radius === undefined ? '' : `,${radius}`
    this.addCommand(`BOX ${startX},${startY},${endX},${endY},${thickness}${opt}`)
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
   * @param {string} data 文字内容（包含 " 等特殊符号需要转义，见 TSPL.escape()；库不做转义）
   * @param {int} [alignment] 对齐：0默认(居左)/1居左/2居中/3居右（V6.73EZ后才支持，不传就不拼进命令）
   * @returns {TSPL}
   */
  text(x, y, font, zoomX, zoomY, data, alignment) { //打印文字
    return this.textRotation(x, y, font, 0, zoomX, zoomY, data, alignment)
  };

  /**
   * 打印文字（可设置选中角度）
   * @param {int} x 文字 X 方向起始点坐标
   * @param {int} y 文字 Y 方向起始点坐标
   * @param {int|string} font 字体名称
   * @param {int} rotation 文字旋转角度（顺时针方向）
   * @param {int} zoomX X 方向放大倍率 1-10
   * @param {int} zoomY Y 方向放大倍率 1-10
   * @param {string} data 文字内容（包含 " 等特殊符号需要转义，见 TSPL.escape()；库不做转义）
   * @param {int} [alignment] 对齐：0默认(居左)/1居左/2居中/3居右（V6.73EZ后才支持，不传就不拼进命令）
   * @returns {TSPL}
   */
  textRotation(x, y, font, rotation, zoomX, zoomY, data, alignment) { //打印文字
    //alignment是可选的位置参数（在content之前），不传就不拼进命令
    const opt = alignment === undefined ? '' : `,${alignment}`
    this.addCommand(`TEXT ${x},${y},"${font}",${rotation},${zoomX},${zoomY}${opt},"${data}"`)
    return this
  };

  /**
   * 打印段落（在指定区域内自动换行，可设对齐）
   * 注意：BLOCK 是 TSPL2 才有的指令（TSPL2手册第76页；据该手册的 Update History，它是2012/11/21 才加入TSPL2的），
   * 只支持TSPL2的机器才能用；TSPL1（以及只认TSPL的机器）没有这条指令。
   * @param {int} x 段落左上角X坐标
   * @param {int} y 段落左上角Y坐标
   * @param {int} width 段落宽度，单位dot
   * @param {int} height 段落高度，单位dot
   * @param {int|string} font 字体名称
   * @param {int} rotation 旋转角度（顺时针方向）
   * @param {int} zoomX X方向放大倍率1-10
   * @param {int} zoomY Y方向放大倍率1-10
   * @param {string} data 段落内容（包含 " 等特殊符号需要转义，见 TSPL.escape()；库不做转义）
   * @param {int} [space] 在每一行中间添加或删除空格，单位dot（行距微调）
   * @param {int} [alignment] 对齐：0默认(居左)/1居左/2居中/3居右（V6.73EZ后才支持，与text的该参数一样；只给这个时会自动补 space=0）
   * @returns {TSPL}
   */
  block(x, y, width, height, font, rotation, zoomX, zoomY, data, space, alignment) {
    //space、alignment是BLOCK的位置参数：只给alignment时自动补space=0（0=不调行距，是该参数的中性值），
    //否则位置参数会把alignment当成space吃掉
    const s = space === undefined && alignment !== undefined ? 0 : space
    const opt = s === undefined ? '' : `,${s}`
    const opt2 = alignment === undefined ? '' : `,${alignment}`
    this.addCommand(`BLOCK ${x},${y},${width},${height},"${font}",${rotation},${zoomX},${zoomY}${opt}${opt2},"${data}"`)
    return this
  };

  /**
   * 打印二维码（无旋转）
   * @param {int} x 二维码水平方向起始点坐标
   * @param {int} y 二维码垂直方向起始点坐标
   * @param {int} level 选择 QRCODE 纠错等级
   * @param {int} width 二维码宽度 1-10
   * @param {string} mode 手动 A /自动编码 M
   * @param {string} data 二维码内容（包含 " 等特殊符号需要转义，见 TSPL.escape()；库不做转义）
   * @param {string} [model] 二维码版本：M1(默认，原始版本) / M2(扩大版本，大部分智能手机支持)，不传就不拼进命令
   * @param {string} [mask] 掩膜：S0~S8（默认S7），不传就不拼进命令；不能单独传，要和model一起传
   * @returns {TSPL}
   */
  qrcode(x, y, level, width, mode, data, model, mask) {
    return this.qrcodeRotation(x, y, level, width, mode, 0, data, model, mask)
  };

  /**
   * 打印二维码（可设置选中角度）
   * @param {int} x 二维码水平方向起始点坐标
   * @param {int} y 二维码垂直方向起始点坐标
   * @param {int} level 选择 QRCODE 纠错等级
   * @param {int} width 二维码宽度 1-10
   * @param {string} mode 手动 A /自动编码 M
   * @param {int} rotation 旋转角度（顺时针方向）
   * @param {string} data 二维码内容（包含 " 等特殊符号需要转义，见 TSPL.escape()；库不做转义）
   * @param {string} [model] 二维码版本：M1(默认，原始版本) / M2(扩大版本，大部分智能手机支持)，不传就不拼进命令
   * @param {string} [mask] 掩膜：S0~S8（默认S7），不传就不拼进命令；不能单独传，要和model一起传
   * @returns {TSPL}
   */
  qrcodeRotation(x, y, level, width, mode, rotation, data, model, mask) {
    //model、mask是可选参数，在命令里位于"content"之前，不传就不拼进命令
    //只给mask不给model时，命令里model那一位只能空着（QRCODE ...,,S5,"x"），手册没写这种写法，所以报错而不是硬拼
    if (model === undefined && mask !== undefined) {
      throw new Error('QRCODE 的 mask 不能单独传，要和 model 一起传')
    }
    const opt = model === undefined ? '' : `${model},${mask === undefined ? '' : `${mask},`}`
    this.addCommand(`QRCODE ${x},${y},${level},${width},${mode},${rotation},${opt}"${data}"`)
    return this
  };

  /**
   * 条形码（无旋转）
   * @param {int} x 左上角水平坐标起点，以点（dot）表示
   * @param {int} y 左上角垂直坐标起点，以点（dot）表示
   * @param {string} type 条码类型
   * @param {int} height 条形码高度，以点（dot）表示
   * @param {int} readable 码文是否显示：0不显示 / 1显示；2居中、3右对齐是较新固件才有的（2009版TSPL2手册只定义了0和1，2014版手册才扩展成4个值）
   * @param {int} narrow 窄 bar 宽度，以点（dot）表示
   * @param {int} wide 宽 bar 宽度，以点（dot）表示
   * @param {string} data 条码内容（包含 " 等特殊符号需要转义，见 TSPL.escape()；库不做转义）
   * @param {int} [alignment] 码文对齐：0默认(居左)/1居左/2居中/3居右，不传就不拼进命令；和 readable 的2/3一样，2009版手册的语法里还没有这个参数
   * @returns {TSPL}
   */
  barcode(x, y, type, height, readable, narrow, wide, data, alignment) {
    return this.barcodeRotation(x, y, type, height, readable, 0, narrow, wide, data, alignment)
  };

  /**
   * 条形码（可设置选中角度）
   * @param {int} x 左上角水平坐标起点，以点（dot）表示
   * @param {int} y 左上角垂直坐标起点，以点（dot）表示
   * @param {string} type 条码类型
   * @param {int} height 条形码高度，以点（dot）表示
   * @param {int} readable 码文是否显示：0不显示 / 1显示；2居中、3右对齐是较新固件才有的（2009版TSPL2手册只定义了0和1，2014版手册才扩展成4个值）
   * @param {int} rotation 旋转角度，顺时针方向
   * @param {int} narrow 窄 bar 宽度，以点（dot）表示
   * @param {int} wide 宽 bar 宽度，以点（dot）表示
   * @param {string} data 条码内容（包含 " 等特殊符号需要转义，见 TSPL.escape()；库不做转义）
   * @param {int} [alignment] 码文对齐：0默认(居左)/1居左/2居中/3居右，不传就不拼进命令；和 readable 的2/3一样，2009版手册的语法里还没有这个参数
   * @returns {TSPL}
   */
  barcodeRotation(x, y, type, height, readable, rotation, narrow, wide, data, alignment) {
    //alignment是可选参数，在命令里位于"content"之前，不传就不拼进命令
    const opt = alignment === undefined ? '' : `${alignment},`
    this.addCommand(`BARCODE ${x},${y},"${type}",${height},${readable},${rotation},${narrow},${wide},${opt}"${data}"`)
    return this
  };

  /**
   * 打印页面（对应 PRINT m[,n]）
   * 例：标签内容含序列号 @1 时，print(3,2) → 0001、0001、0002、0002、0003、0003
   * @param {int} [m] 打印几个序号（没设序列号时序号不变，即打印几张）：print(3) → 0001、0002、0003；不传按1个
   * @param {int} [n] 每个序号重复打印几张：print(3,2) 就是每个序号2张；不传就不拼进命令
   * @returns {TSPL}
   */
  print(m = 1, n) {
    const opt = n === undefined ? '' : `,${n}`
    this.addCommand(`PRINT ${m}${opt}`)
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
    // 每行字节数 = ceil(宽度 / 8)，BITMAP 头里的宽度单位是字节，不是点
    const width = parseInt((res.width + 7) / 8 * 8 / 8)
    const height = res.height
    const w = res.width
    const resultData = []
    this.addCommandWithoutEnter(`BITMAP ${x},${y},${width},${height},${mode},`)

    //for循环顺序不要错了，外层遍历高度，内层遍历该行的字节，因为横向每8个像素点组成一个字节
    //每行都要按 width*8 位重新对齐：宽度不是8的倍数时，行尾多出的补位像素不打印(1)。
    //否则比特位会在行与行之间累积错位(图像斜切)，且总字节数少于头部声明的 width*height，
    //打印机就会把后面的命令当成图像数据吃掉
    for (let y = 0; y < height; y++) {
      for (let i = 0; i < width; i++) {
        let p = 0
        for (let j = 0; j < 8; j++) {
          const x = i * 8 + j
          //1不打印, 0打印 （参考：佳博标签打印机编程手册tspl）
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
      this.command.push(resultData[i])
    }
    return this;
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

  /**
   * 转义要打印的内容（静态方法，配合 text/qrcode/barcode 的 data 参数使用）
   * 手册规定：字符串里的双引号要写成 \["]；内容里也不能有裸的CR/LF，它会被当成命令结束符，
   * 把一条命令切成两条，要打印它们得转义：CR写\[R]、LF写\[L]。
   * \[L]是“V5.10EZ”后的写法，如果机器固件较旧、换行打不出来时改成\[A]试下。
   * 注意： 只对原始内容调用一次，对已经转义过的内容再调用会二次转义；
   * @param {string} data 要打印的原始内容
   * @returns {string}
   */
  static escape(data) {
    return `${data}`.replace(/"/g, '\\["]').replace(/\r/g, '\\[R]').replace(/\n/g, '\\[L]')
  }
}

export default TSPL
