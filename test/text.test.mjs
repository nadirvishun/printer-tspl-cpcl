// TEXT / textRotation 的 alignment，以及 BLOCK 的 space/alignment
import {test} from 'node:test'
import TSPL from '../src/utils/tspl.js'
import {check, escape} from './_helper.mjs'

const run = (method, ...args) => new TSPL().init()[method](...args).rawCommand
const lines = (cmd) => cmd.rawCommand.split('\r\n').filter(Boolean).length

test('TEXT 不带 alignment（回归：必须和以前完全一样）', () => {
  check('text 6参', run('text', 11, 12, 'FONT', 13, 14, 'DATA'),
      'TEXT 11,12,"FONT",0,13,14,"DATA"\r\n')
  check('textRotation 7参', run('textRotation', 11, 12, 'FONT', 3, 14, 15, 'DATA'),
      'TEXT 11,12,"FONT",3,14,15,"DATA"\r\n')
  check('demo 的真实调用', run('text', 10, 10, 'TSS24.BF2', 1, 1, '打印测试文本'),
      'TEXT 10,10,"TSS24.BF2",0,1,1,"打印测试文本"\r\n')
})

test('TEXT 带 alignment（V6.73EZ 后的可选参数）', () => {
  check('居中(2)', run('text', 11, 12, 'FONT', 13, 14, 'DATA', 2),
      'TEXT 11,12,"FONT",0,13,14,2,"DATA"\r\n')
  check('alignment=0 也要原样发出（0 不是“没传”）', run('text', 11, 12, 'FONT', 13, 14, 'DATA', 0),
      'TEXT 11,12,"FONT",0,13,14,0,"DATA"\r\n')
  check('textRotation 靠右(3)', run('textRotation', 11, 12, 'FONT', 3, 14, 15, 'DATA', 3),
      'TEXT 11,12,"FONT",3,14,15,3,"DATA"\r\n')

  // 手册范例
  check('手册范例：TEXT 10,260,"3",0,1,1,0,"FONT 3"',
      run('text', 10, 260, '3', 1, 1, 'FONT 3', 0),
      'TEXT 10,260,"3",0,1,1,0,"FONT 3"\r\n')
  check('手册范例：TEXT 400,40,"0",0,8,8,2,"align center"',
      run('text', 400, 40, '0', 8, 8, 'align center', 2),
      'TEXT 400,40,"0",0,8,8,2,"align center"\r\n')
})

test('TEXT 配合转义与链式', () => {
  check('内容带双引号 + 居中',
      run('text', 11, 12, 'FONT', 13, 14, escape('12" 显示器'), 2),
      'TEXT 11,12,"FONT",0,13,14,2,"12\\["] 显示器"\r\n')
  check('链式 cls → text → print 的命令条数',
      lines(new TSPL().init().cls().text(1, 2, 'FONT', 1, 1, 'D', 2).print()), 3)
})

const A = [11, 12, 13, 14, 'FONT', 15, 16, 17, 'DATA']
const block = (...args) => new TSPL().init().block(...args).rawCommand

test('BLOCK 的 space / alignment 四种组合', () => {
  check('都不给', block(...A), 'BLOCK 11,12,13,14,"FONT",15,16,17,"DATA"\r\n')
  check('只给 space', block(...A, 20), 'BLOCK 11,12,13,14,"FONT",15,16,17,20,"DATA"\r\n')
  check('space + alignment', block(...A, 20, 2), 'BLOCK 11,12,13,14,"FONT",15,16,17,20,2,"DATA"\r\n')
  check('只给 alignment → 自动补 space=0（不能被吞掉）',
      block(...A, undefined, 2), 'BLOCK 11,12,13,14,"FONT",15,16,17,0,2,"DATA"\r\n')
  check('alignment=0 也要原样发出（0 不是“没传”）',
      block(...A, undefined, 0), 'BLOCK 11,12,13,14,"FONT",15,16,17,0,0,"DATA"\r\n')
  check('space=0 单独给也要发出', block(...A, 0), 'BLOCK 11,12,13,14,"FONT",15,16,17,0,"DATA"\r\n')
})

test('BLOCK 手册范例的写法', () => {
  check('无 space/alignment',
      block(15, 15, 790, 90, '0', 0, 8, 8, 'We stand behind our products.'),
      'BLOCK 15,15,790,90,"0",0,8,8,"We stand behind our products."\r\n')
  check('space=20 alignment=2 居中',
      block(15, 15, 790, 90, '0', 0, 8, 8, 'We stand behind our products.', 20, 2),
      'BLOCK 15,15,790,90,"0",0,8,8,20,2,"We stand behind our products."\r\n')
  check('只要求居中',
      block(15, 15, 790, 90, '0', 0, 8, 8, 'We stand behind our products.', undefined, 2),
      'BLOCK 15,15,790,90,"0",0,8,8,0,2,"We stand behind our products."\r\n')
})

test('BLOCK 配合转义与链式', () => {
  check('内容带双引号', block(...A.slice(0, 8), escape('12" 显示器')),
      'BLOCK 11,12,13,14,"FONT",15,16,17,"12\\["] 显示器"\r\n')
  check('链式 cls → block → print 的命令条数', lines(new TSPL().init().cls().block(...A).print()), 3)
})
