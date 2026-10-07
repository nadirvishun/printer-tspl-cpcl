// 编码与转义：
//   1) 位图数据不经过 intToByte，输出的仍是合法字节（和旧管线的等价性由 bitmap.test.mjs 逐像素验证）
//   2) 保留下来的 intToByte 仍是原来的有符号转换，且源码里已无调用
//   3) README「注意事项」里给出的那段 escape 实现（库本身不提供 escape）
import {test} from 'node:test'
import TSPL from '../src/utils/tspl.js'
import CPCL from '../src/utils/cpcl.js'
import {check, read, readPng, escape} from './_helper.mjs'

// batchWrite 里 `new Uint8Array(buffer).set(data)` 的等价物：按 mod 256 收敛
const onWire = (a) => Buffer.from(Uint8Array.from(a))

test('位图数据不过 intToByte，输出仍是 0-255 的整数字节', () => {
  for (const file of ['src/static/logo.png', 'src/static/marker.png']) {
    const res = readPng(file)
    const imageBytes = Math.ceil(res.width / 8) * res.height
    const cmds = [
      ['TSPL', new TSPL().init().bitmap(0, 0, 0, res)],
      ['CPCL', new CPCL().init().bitmap(0, 0, res)],
    ]
    for (const [name, cmd] of cmds) {
      const arr = Array.from(cmd.getData())
      check(`${file} ${name} 全是 0-255 的整数`,
          arr.filter(v => Number.isInteger(v) && v >= 0 && v <= 255).length, arr.length)
      //（这里原来有一条“与改动前(APP-PLUS 分支)一致”的断言，删掉了：
      //  旧管线是 intToByte 存有符号值、写蓝牙时再由 set() 按 mod 256 归一化回来，而 intToByte 本身就是
      //  mod 256 的恒等变换；断言的右边又是从 arr 现算的，于是怎么写都恒真 —— 把打包逻辑改成逐字节 +1
      //  它照样绿。“打包出来的字节对不对”由 bitmap.test.mjs 用独立算出的期望值验证。）

      // 改动前在“两个 #ifdef 都没命中”的平台：只有位图数据经过 intToByte 返回 undefined，
      // 被 set 收敛成 0x00，头部不受影响 —— 量化一下后果
      const good = onWire(arr)
      let lost = 0
      for (let i = good.length - imageBytes; i < good.length; i++) if (good[i] !== 0) lost++
      if (lost) {
        console.log(`        （改动前在那种平台上：位图 ${imageBytes} 个字节全变 0x00，`
            + `其中原本非 0 的 ${lost} 个字节数据丢失 → 整块印黑）`)
      }
    }
  }
})

test('intToByte 保留且与旧写法逐个一致', () => {
  const t = new TSPL().init()
  let mis = 0
  for (let i = 0; i < 256; i++) {
    const b = i & 0xFF
    const orig = b >= 128 ? -1 * (128 - (b % 128)) : b
    if (t.intToByte(i) !== orig) mis++
  }
  check('0-255 全测，结果与原写法一致', mis, 0)
  check('intToByte(200) = -56', t.intToByte(200), -56)
  check('intToByte(127) = 127', t.intToByte(127), 127)

  for (const f of ['src/utils/tspl.js', 'src/utils/cpcl.js']) {
    check(`${f} 中已无 this.intToByte( 调用`, (read(f).match(/this\.intToByte\(/g) || []).length, 0)
  }
})

test('README 里那段 escape 实现', () => {
  check('双引号 → \\["]', escape('12" 显示器'), '12\\["] 显示器')
  check('多个双引号', escape('a"b"c'), 'a\\["]b\\["]c')
  check('LF → \\[L]', escape('第一行\n第二行'), '第一行\\[L]第二行')
  check('CR → \\[R]', escape('a\rb'), 'a\\[R]b')
  check('CRLF → \\[R]\\[L]（两个字符各自转义，不丢内容）', escape('a\r\nb'), 'a\\[R]\\[L]b')
  check('混合', escape('价"格\n备注'), '价\\["]格\\[L]备注')
  check('非字符串也能处理', escape(123), '123')
  check('无特殊字符时原样返回', escape('普通文本 abc'), '普通文本 abc')
  check('不是幂等的（只该对原始内容调用一次）', escape(escape('12"')) === escape('12"'), false)
})

test('转义后的内容落在引号字符串里，命令不会被截断', () => {
  const cmd = new TSPL().init().text(10, 10, 'TSS24.BF2', 1, 1, escape('12" 显示器'))
  check('生成的命令', cmd.rawCommand, 'TEXT 10,10,"TSS24.BF2",0,1,1,"12\\["] 显示器"\r\n')

  // 关键：内容里的 CR/LF 转义后，命令里只应剩结尾那一个 \r\n
  const cmd2 = new TSPL().init().text(10, 10, 'TSS24.BF2', 1, 1, escape('第一行\n第二行'))
  check('命令里的 \\r 个数（只应有结尾那一个）', (cmd2.rawCommand.match(/\r/g) || []).length, 1)
  check('命令里的 \\n 个数（只应有结尾那一个）', (cmd2.rawCommand.match(/\n/g) || []).length, 1)

  // 对照：不转义时，双引号会提前闭合、换行会把命令切成两条
  const broken = new TSPL().init().text(10, 10, 'TSS24.BF2', 1, 1, '12" 显示器\n第二行')
  check('不转义时的坏结果（对照）', broken.rawCommand,
      'TEXT 10,10,"TSS24.BF2",0,1,1,"12" 显示器\n第二行"\r\n')
  check('不转义时命令被切成两条（\\n 个数 > 1）', (broken.rawCommand.match(/\n/g) || []).length > 1, true)
})
