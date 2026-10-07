// 位图：行补齐 / 透明合成 / 像素数据长度校验
import {test} from 'node:test'
import TSPL from '../src/utils/tspl.js'
import CPCL from '../src/utils/cpcl.js'
import {check, mkRes, readPng, decoder, encodeGbk} from './_helper.mjs'

// 修复前的算法：把整张图摊平成一个连续比特流，每 8 位切一刀（宽度不是 8 的倍数时行间累积错位）
function oldPack(w, h) {
  const pointList = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) pointList.push(x < Math.ceil(w / 2) ? 0 : 1)
  }
  const resultData = []
  for (let i = 0; i < pointList.length; i += 8) {
    let p = 0
    for (let j = 0; j < 8; j++) p += (pointList[i + j] || 0) * (128 >> j)
    resultData.push(p)
  }
  return resultData.length
}

// 逐像素解码 + 补位检查（TSPL：0=打印/黑，1=不打印/白）
function verifyTSPL(w, h) {
  const res = mkRes(w, h)
  const cmd = new TSPL().init().bitmap(10, 250, 0, res)
  const bytes = cmd.getData()
  const headerLen = encodeGbk(cmd.rawCommand).length
  const perRow = Math.ceil(w / 8)

  console.log(`    TSPL ${w}x${h}: 头部 ${JSON.stringify(cmd.rawCommand)}`)
  check(`TSPL ${w}x${h} 每行字节数(头部声明)`, Number(cmd.rawCommand.split(',')[2]), perRow)
  check(`TSPL ${w}x${h} 图像字节数 = ceil(w/8)*h`, bytes.length - headerLen, perRow * h)
  console.log(`      (修复前只发 ${oldPack(w, h)} 字节，差值 ${perRow * h - oldPack(w, h)})`)

  let mismatch = 0, padWrong = 0
  for (let y = 0; y < h; y++) {
    for (let i = 0; i < perRow; i++) {
      const byte = bytes[headerLen + y * perRow + i] & 0xff
      for (let j = 0; j < 8; j++) {
        const x = i * 8 + j
        const bit = (byte >> (7 - j)) & 1
        if (x < w) {
          if (bit !== (x < Math.ceil(w / 2) ? 0 : 1)) mismatch++
        } else if (bit !== 1) {
          padWrong++ // 补位必须是 1(不打印)，否则右边缘出现黑边
        }
      }
    }
  }
  check(`TSPL ${w}x${h} 像素/行对齐错位个数`, mismatch, 0)
  check(`TSPL ${w}x${h} 补位像素非白个数`, padWrong, 0)
}

// CPCL 与 TSPL 相反（发出的位 1=黑），所以期望值取反、补位期望 0
function verifyCPCL(w, h) {
  const res = mkRes(w, h)
  const cmd = new CPCL().init().bitmap(0, 200, res)
  const bytes = cmd.getData()
  const headerLen = encodeGbk(cmd.rawCommand).length
  const perRow = Math.ceil(w / 8)

  console.log(`    CPCL ${w}x${h}: 头部 ${JSON.stringify(cmd.rawCommand)}`)
  check(`CPCL ${w}x${h} 图像字节数 = ceil(w/8)*h`, bytes.length - headerLen, perRow * h)

  let mismatch = 0, padWrong = 0
  for (let y = 0; y < h; y++) {
    for (let i = 0; i < perRow; i++) {
      const byte = bytes[headerLen + y * perRow + i] & 0xff
      for (let j = 0; j < 8; j++) {
        const x = i * 8 + j
        const bit = (byte >> (7 - j)) & 1
        if (x < w) {
          if (bit !== (x < Math.ceil(w / 2) ? 1 : 0)) mismatch++
        } else if (bit !== 0) {
          padWrong++
        }
      }
    }
  }
  check(`CPCL ${w}x${h} 像素/行对齐错位个数`, mismatch, 0)
  check(`CPCL ${w}x${h} 补位像素非白个数`, padWrong, 0)
}

test('TSPL 位图行补齐（宽度不是 8 的倍数也不错位）', () => {
  verifyTSPL(72, 72)    // 8 的倍数：修复前后应一致（demo 用的尺寸）
  verifyTSPL(10, 3)     // 非 8 的倍数：修复前必定错位
  verifyTSPL(100, 120)
})

test('CPCL 位图行补齐', () => {
  verifyCPCL(10, 3)
  verifyCPCL(100, 120)
})

test('透明像素按白纸合成（不再整块印黑）', () => {
  // 修复前：直接拿原始 RGB 算灰度，忽略 alpha
  const oldBit = (d, i) => (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) > 128 ? 1 : 0
  // 修复后：先按白纸合成再算灰度
  const newBit = (d, i) => {
    const a = d[i + 3] / 255
    const r = d[i] * a + 255 * (1 - a)
    const g = d[i + 1] * a + 255 * (1 - a)
    const b = d[i + 2] * a + 255 * (1 - a)
    return (r * 0.299 + g * 0.587 + b * 0.114) > 128 ? 1 : 0
  }
  const decode = decoder   // 直接用 _helper 里那份，别再抄一遍

  for (const file of ['src/static/logo.png', 'src/static/marker.png']) {
    const res = readPng(file)
    const {width: w, height: h} = res
    const d = res.data

    let oldPrint = 0, newPrint = 0, diff = 0, trans = 0, semi = 0, opaque = 0, minLum = 255
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4
        const o = oldBit(d, i), n = newBit(d, i)
        if (o === 0) oldPrint++
        if (n === 0) newPrint++
        if (o !== n) diff++
        const a = d[i + 3]
        if (a === 0) trans++
        else if (a < 255) semi++
        else {
          opaque++
          const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
          if (lum < minLum) minLum = lum
        }
      }
    }
    console.log(`    ${file} ${w}x${h}: 全透明 ${trans}、半透明 ${semi}、不透明 ${opaque}`)
    if (opaque) console.log(`      不透明像素最暗灰度 ${minLum.toFixed(1)}`)
    console.log(`      会打印(黑)的像素：修复前 ${oldPrint} → 修复后 ${newPrint}，判定不同的 ${diff}`)

    // TSPL：bitmap(x, y, mode, res)
    const t = decode(new TSPL().init().bitmap(0, 0, 0, res), w)
    let tMis = 0
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (t(x, y) !== newBit(d, (y * w + x) * 4)) tMis++
    }
    check(`${file} TSPL 逐像素与预期一致`, tMis, 0)

    // CPCL：bitmap(x, y, res)，发出前做了 ~ 反转（1=黑）
    const c = decode(new CPCL().init().bitmap(0, 0, res), w)
    let cMis = 0
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (c(x, y) !== 1 - newBit(d, (y * w + x) * 4)) cMis++
    }
    check(`${file} CPCL 逐像素与预期一致(~反转后 1=黑)`, cMis, 0)

    let bad = 0
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] === 0 && t(x, y) !== 1) bad++
    }
    check(`${file} 全透明像素一律不打印`, bad, 0)
  }
})

test('bitmap() 的 res 校验：宽高和像素数据都得对得上', () => {
  const tryRun = (fn) => {
    try {
      fn()
      return null
    } catch (e) {
      return e
    }
  }
  const tspl = (res) => () => new TSPL().init().bitmap(0, 0, 0, res)
  const cpcl = (res) => () => new CPCL().init(0, 200, 200, 500, 1).bitmap(0, 0, res)
  const bad = (label, res) => {
    check(`${label} → TSPL 抛错`, tryRun(tspl(res)) !== null, true)
    check(`${label} → CPCL 抛错`, tryRun(cpcl(res)) !== null, true)
  }

  console.log('    —— 正常的要放行 ——')
  check('72x72', tryRun(tspl(mkRes(72, 72))), null)
  check('71x72（宽度不是 8 的倍数）', tryRun(tspl(mkRes(71, 72))), null)
  check('CPCL 72x72', tryRun(cpcl(mkRes(72, 72))), null)

  console.log('    —— 宽高本身非法：以前会拼出 undefined/NaN/0 的畸形命令头 ——')
  bad('height=undefined', {width: 72, height: undefined, data: new Uint8ClampedArray(72 * 72 * 4)})
  bad('height=NaN', {width: 72, height: NaN, data: new Uint8ClampedArray(72 * 72 * 4)})
  bad('width=undefined', {width: undefined, height: 72, data: new Uint8ClampedArray(72 * 72 * 4)})
  bad('width=0', {width: 0, height: 72, data: new Uint8ClampedArray(0)})
  bad('height=0', {width: 72, height: 0, data: new Uint8ClampedArray(0)})
  bad('width 是小数', {width: 72.5, height: 72, data: new Uint8ClampedArray(72 * 72 * 4)})

  console.log('    —— 数据和宽高对不上：以前要么越界读成 NaN 印黑，要么多读/少读 ——')
  bad('数据只有一半', {width: 72, height: 72, data: new Uint8ClampedArray(72 * 36 * 4)})
  bad('数据为空', {width: 72, height: 72, data: new Uint8ClampedArray(0)})
  bad('数据多出一倍', {width: 72, height: 72, data: new Uint8ClampedArray(72 * 144 * 4)})

  const e = tryRun(tspl({width: 72, height: 72, data: new Uint8ClampedArray(72 * 36 * 4)}))
  check('错误信息带上了实际的宽高和长度', /width=72 height=72 data\.length=10368/.test(e.message), true)
  console.log(`      → ${e.message}`)

  // 宽高给了但 data 整个没给：条件里必须先判 res.data，否则读 .length 会先抛 TypeError、
  // 设计好的那句友好报错永远轮不到
  for (const [label, res] of [['没给 data', {width: 72, height: 72}], ['data 是 null', {width: 72, height: 72, data: null}]]) {
    const err = tryRun(tspl(res))
    check(`${label} → 抛的是那句友好报错，不是 TypeError`, /res 不合法/.test(err.message), true)
  }

  // 对照：数据短了时，越界处的灰度会算成 NaN，NaN > 128 为 false → bit 填 0，而 0 就是“打印”
  const w = 72
  const data = new Uint8ClampedArray(72 * 36 * 4).fill(255)
  const index = (60 * w + 3) * 4   // y=60 已超出给的 36 行
  const alpha = data[index + 3] / 255
  const r = data[index] * alpha + 255 * (1 - alpha)
  const g = data[index + 1] * alpha + 255 * (1 - alpha)
  const b = data[index + 2] * alpha + 255 * (1 - alpha)
  const gray = r * 0.299 + g * 0.587 + b * 0.114
  check('（对照）越界处的灰度确实是 NaN', Number.isNaN(gray), true)
})

test('位图前面有中文命令时，解码偏移仍按字节算', () => {
  //rawCommand 是文本（UTF-16 码元数）、getData() 是 gb18030 字节，含中文时会差出字节来；
  //这个用例把位图放在中文命令后面，专门盯住“拿 rawCommand.length 当偏移”这种错
  const cmd = new TSPL().init().text(0, 0, 'TSS24.BF2', 1, 1, '中文').bitmap(0, 0, 0, mkRes(16, 8))
  check('rawCommand.length 与字节数确实不同（否则这个用例没意义）',
      cmd.rawCommand.length !== encodeGbk(cmd.rawCommand).length, true)

  const bit = decoder(cmd, 16)
  let mismatch = 0
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 16; x++) {
      if (bit(x, y) !== (x < 8 ? 0 : 1)) mismatch++      // mkRes 是左半黑(0)、右半白(1)
    }
  }
  check('逐像素解码无错位', mismatch, 0)

  // 对照：真拿 rawCommand.length 当偏移会错多少 —— 证明这个用例是能发现问题的
  const wrongHeader = cmd.rawCommand.length
  const bytes = cmd.getData()
  let wrongMismatch = 0
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 16; x++) {
      const b = ((bytes[wrongHeader + y * 2 + ((x / 8) | 0)] & 0xff) >> (7 - (x % 8))) & 1
      if (b !== (x < 8 ? 0 : 1)) wrongMismatch++
    }
  }
  console.log(`      （用 rawCommand.length 当偏移的话，会有 ${wrongMismatch}/${16 * 8} 个像素解错）`)
  check('（对照）旧写法确实会错，说明这个用例有牙齿', wrongMismatch > 0, true)
})
