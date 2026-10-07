// TSPL：构造函数兜底 + init() 的重置语义
import {test} from 'node:test'
import TSPL from '../src/utils/tspl.js'
import {check} from './_helper.mjs'

const bytesOf = (cmd) => Array.from(cmd.getData()).join(',')

test('忘了调 init() 也不崩（构造函数兜底）', () => {
  const noInit = new TSPL().size(75, 60).gap(2).cls().print(1)
  check('不调 init() 的命令串正确', noInit.getRawData(),
      'SIZE 75 mm,60 mm\r\nGAP 2 mm,0 mm\r\nCLS\r\nPRINT 1\r\n')

  const withInit = new TSPL().init().size(75, 60).gap(2).cls().print(1)
  check('和不调 init() 的输出一字不差', noInit.getRawData(), withInit.getRawData())
  check('字节数组也一致', bytesOf(noInit), bytesOf(withInit))
})

test('init() 仍然是“重置”', () => {
  const t = new TSPL().init().size(75, 60).cls()
  check('重置前有内容', t.getData().length > 0, true)

  t.init()
  check('init() 后字节数组清空', t.getData().length, 0)
  check('init() 后命令串清空', t.getRawData(), '')

  t.size(90, 120)
  check('重置后还能继续拼', t.getRawData(), 'SIZE 90 mm,120 mm\r\n')
})

test('连续两次 init() 不炸', () => {
  const t = new TSPL()
  t.init().init().cls()
  check('结果正常', t.getRawData(), 'CLS\r\n')
})
