// 指令封装的命令串验证：JSDoc 一致性、委托改造前后一致、各可选参数
import {test} from 'node:test'
import TSPL from '../src/utils/tspl.js'
import {check, read, encodeGbk} from './_helper.mjs'

const run = (method, ...args) => new TSPL().init()[method](...args).rawCommand

test('JSDoc 的 @param 个数与函数参数个数一致', () => {
  for (const f of ['src/utils/tspl.js', 'src/utils/cpcl.js']) {
    const src = read(f)
    const re = /\/\*\*([\s\S]*?)\*\/\s*([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/g
    const bad = []
    let m
    while ((m = re.exec(src))) {
      const tags = (m[1].match(/@param/g) || []).length
      const params = m[3].split(',').map(s => s.trim()).filter(Boolean).length
      if (tags && tags !== params) bad.push(`${m[2]}() @param ${tags} 个 / 参数 ${params} 个`)
    }
    check(`${f} 全部一致`, bad.join(' | '), '')
  }
})

test('委托改造后，各方法生成的命令字符串没变', () => {
  // 改造前各方法内联的模板（原样抄自改动前的代码）
  const old = {
    text: (x, y, font, zx, zy, data) => `TEXT ${x},${y},"${font}",0,${zx},${zy},"${data}"`,
    textRotation: (x, y, font, r, zx, zy, data) => `TEXT ${x},${y},"${font}",${r},${zx},${zy},"${data}"`,
    qrcode: (x, y, level, width, mode, data) => `QRCODE ${x},${y},${level},${width},${mode},0,"${data}"`,
    qrcodeRotation: (x, y, level, width, mode, r, data) => `QRCODE ${x},${y},${level},${width},${mode},${r},"${data}"`,
    barcode: (x, y, type, height, readable, narrow, wide, data) =>
        `BARCODE ${x},${y},"${type}",${height},${readable},0,${narrow},${wide},"${data}"`,
    barcodeRotation: (x, y, type, height, readable, r, narrow, wide, data) =>
        `BARCODE ${x},${y},"${type}",${height},${readable},${r},${narrow},${wide},"${data}"`,
  }
  // 每个参数给互不相同的值，这样一旦委托时参数顺序写错必然暴露
  const cases = [
    ['text', [11, 12, 'FONT', 13, 14, 'DATA']],
    ['text', [0, 0, 'TSS24.BF2', 1, 1, '打印测试文本']],
    ['textRotation', [21, 22, 'FONT', 23, 24, 25, 'DATA']],
    ['textRotation', [0, 0, 'TSS24.BF2', 3, 1, 1, '打印测试文本']],
    ['qrcode', [31, 32, 'L', 33, 'A', 'DATA']],
    ['qrcode', [40, 50, 'L', 5, 'A', 'www.poscom.cn']],
    ['qrcodeRotation', [41, 42, 'M', 43, 'A', 44, 'DATA']],
    ['barcode', [51, 52, '128', 53, 54, 55, 56, 'DATA']],
    ['barcode', [10, 180, '128', 64, 1, 2, 4, '200902125410']],
    ['barcodeRotation', [61, 62, '128', 63, 64, 65, 66, 67, 'DATA']],
    ['barcodeRotation', [10, 180, '128', 64, 1, 0, 2, 4, '200902125410']],
  ]
  for (const [method, args] of cases) {
    const cmd = new TSPL().init()[method](...args)
    const want = old[method](...args) + '\r\n'
    check(`${method}(${args.join(',')})`, cmd.rawCommand, want)
    check(`  └ 命令字节数`, cmd.getData().length, encodeGbk(want).length)
  }
})

test('DIRECTION 的第二个参数（镜像）可选', () => {
  const dir = (...args) => new TSPL().init().direction(...args).rawCommand
  check('只给方向（手册范例 DIRECTION 0）', dir(0), 'DIRECTION 0\r\n')
  check('只给方向 1', dir(1), 'DIRECTION 1\r\n')
  check('方向+镜像', dir(0, 1), 'DIRECTION 0,1\r\n')
  check('方向+镜像 1,0', dir(1, 0), 'DIRECTION 1,0\r\n')
  check('m=0 不能被当成“没传”', dir(0, 0), 'DIRECTION 0,0\r\n')
  check('链式 cls → direction → print 的命令条数',
      new TSPL().init().cls().direction(0).print().rawCommand.split('\r\n').filter(Boolean).length, 3)
})

test('print 的 m 必填、n 可选', () => {
  check('print() 无参可直接打印一套', run('print'), 'PRINT 1\r\n')
  check('print(1,1) 和以前一字不差', run('print', 1, 1), 'PRINT 1,1\r\n')
  check('print(3)（n 不传就不拼进去）', run('print', 3), 'PRINT 3\r\n')
  check('print(3,2)', run('print', 3, 2), 'PRINT 3,2\r\n')
  check('n=0 是合法值，不能被当成没传', run('print', 3, 0), 'PRINT 3,0\r\n')
  // printMulti(5) 以前会发 PRINT 5,undefined
  check('printMulti 已移除', typeof new TSPL().init().printMulti, 'undefined')
})

test('limitFeed 一族的三种单位', () => {
  check('limitFeed(12) 通用，默认 mm', run('limitFeed', 12), 'LIMITFEED 12 mm\r\n')
  check('limitFeedMm(12)', run('limitFeedMm', 12), 'LIMITFEED 12 mm\r\n')
  check('limitFeedInch(12)（手册范例就是 LIMITFEED 12）', run('limitFeedInch', 12), 'LIMITFEED 12\r\n')
  check('limitFeedDot(12)', run('limitFeedDot', 12), 'LIMITFEED 12 dot\r\n')

  check('limitFeed 一对', run('limitFeed', 12, 50, 3), 'LIMITFEED 12 mm,50 mm,3 mm\r\n')
  check('limitFeedMm 一对', run('limitFeedMm', 12, 50, 3), 'LIMITFEED 12 mm,50 mm,3 mm\r\n')
  check('limitFeedInch 一对', run('limitFeedInch', 12, 50, 3), 'LIMITFEED 12,50,3\r\n')
  check('limitFeedDot 一对（单位跟着每个参数）', run('limitFeedDot', 12, 50, 3), 'LIMITFEED 12 dot,50 dot,3 dot\r\n')

  let threw = false
  try {
    run('limitFeed', 12, 50)
  } catch (e) {
    threw = true
  }
  check('只给 minpaper → 抛错（不静默丢）', threw, true)
})

test('BARCODE 的 alignment', () => {
  check('不传 → 和以前一字不差', run('barcode', 1, 2, '128', 3, 4, 5, 6, 'd'), 'BARCODE 1,2,"128",3,4,0,5,6,"d"\r\n')
  check('传 alignment=2', run('barcode', 1, 2, '128', 3, 4, 5, 6, 'd', 2), 'BARCODE 1,2,"128",3,4,0,5,6,2,"d"\r\n')
  check('不传 → 和以前一字不差（带旋转的那个）',
      run('barcodeRotation', 1, 2, '128', 3, 4, 90, 5, 6, 'd'), 'BARCODE 1,2,"128",3,4,90,5,6,"d"\r\n')
  check('带旋转 + alignment',
      run('barcodeRotation', 1, 2, '128', 3, 4, 90, 5, 6, 'd', 3), 'BARCODE 1,2,"128",3,4,90,5,6,3,"d"\r\n')
})

test('QRCODE 的 model/mask', () => {
  check('不传 → 和以前一字不差', run('qrcode', 1, 2, 'L', 3, 'A', 'd'), 'QRCODE 1,2,L,3,A,0,"d"\r\n')
  check('只传 model', run('qrcode', 1, 2, 'L', 3, 'A', 'd', 'M2'), 'QRCODE 1,2,L,3,A,0,M2,"d"\r\n')
  check('model + mask', run('qrcode', 1, 2, 'L', 3, 'A', 'd', 'M2', 'S5'), 'QRCODE 1,2,L,3,A,0,M2,S5,"d"\r\n')
  check('不传 → 和以前一字不差（带旋转的那个）',
      run('qrcodeRotation', 1, 2, 'L', 3, 'A', 90, 'd'), 'QRCODE 1,2,L,3,A,90,"d"\r\n')
  check('带旋转 + model + mask',
      run('qrcodeRotation', 1, 2, 'L', 3, 'A', 90, 'd', 'M2', 'S5'), 'QRCODE 1,2,L,3,A,90,M2,S5,"d"\r\n')

  let threw = false
  try {
    run('qrcode', 1, 2, 'L', 3, 'A', 'd', undefined, 'S5')
  } catch (e) {
    threw = true
  }
  check('只传 mask → 抛错（不硬拼出两个逗号）', threw, true)
})

test('BOX 的 radius', () => {
  check('不传 → 和以前一字不差', run('box', 1, 2, 3, 4, 5), 'BOX 1,2,3,4,5\r\n')
  check('传圆角', run('box', 1, 2, 3, 4, 5, 20), 'BOX 1,2,3,4,5,20\r\n')
  check('radius=0 是合法值（直角），不能被当成没传', run('box', 1, 2, 3, 4, 5, 0), 'BOX 1,2,3,4,5,0\r\n')
})
