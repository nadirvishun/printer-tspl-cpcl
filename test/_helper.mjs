// 测试公共部分
import assert from 'node:assert'
import fs from 'fs'
import path from 'path'
import {createRequire} from 'module'

const require = createRequire(import.meta.url)

/** 项目根目录（测试都由 `npm test` 在根目录跑） */
export const root = process.cwd()

/** 读文件（相对项目根） */
export const read = (f) => fs.readFileSync(path.join(root, f), 'utf8')

/** pngjs：位图相关的用例要用真实 PNG */
export const {PNG} = require('pngjs')

/** 库内部用的编码（gb18030），测试里要按它来算期望字节数 */
export const encodeGbk = (s) => require('iconv-lite').encode(s, 'gb18030')

/** 读示例图片，返回 bitmap() 要的 res */
export function readPng(f) {
  const png = PNG.sync.read(fs.readFileSync(path.join(root, f)))
  return {data: new Uint8ClampedArray(png.data), width: png.width, height: png.height}
}

/** 造一张"左半黑、右半白"的测试图（TSPL 里 0=打印） */
export function mkRes(w, h) {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const v = x < Math.ceil(w / 2) ? 0 : 255
      data[i] = data[i + 1] = data[i + 2] = v
      data[i + 3] = 255
    }
  }
  return {data, width: w, height: h}
}

/** 对命令里的位图数据逐像素解码，返回 (x, y) => bit */
export function decoder(cmd, w) {
  //头部长度必须按字节算：rawCommand 是文本（UTF-16 码元数），getData() 是 gb18030 字节，
  //命令里含中文时前者会偏小（一个字 1 码元 / 2 字节），拿它当偏移会让解码整体前移
  const headerLen = encodeGbk(cmd.rawCommand).length
  const perRow = Math.ceil(w / 8)
  const bytes = cmd.getData()
  return (x, y) => ((bytes[headerLen + y * perRow + ((x / 8) | 0)] & 0xff) >> (7 - (x % 8))) & 1
}

/**
 * 断言相等：和原来一样打印 PASS/FAIL，失败时抛出去让 node:test 标记该用例失败
 */
export function check(label, got, want) {
  const ok = got === want
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`)
  assert.ok(ok, `${label}\n  got  = ${JSON.stringify(got)}\n  want = ${JSON.stringify(want)}`)
}

/** README「注意事项」里给出的转义实现（库本身不提供 escape） */
export const escape = (s) => `${s}`
    .replace(/"/g, '\\["]')
    .replace(/\r/g, '\\[R]')
    .replace(/\n/g, '\\[L]')
