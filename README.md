# TSPL / CPCL 指令封装

给 `uniapp vue3（非ts）` 用的标签打印机指令封装。JS 端的 `TSPL` 封装基本都跟佳博的 sdk 差不多、也有点旧了，这里用`模板字符串`重新封装了一遍；`CPCL` 的封装则很少，照着手册自己封了一套。两个类都只做一件事：拼出命令，拿到 `Uint8Array`，交给蓝牙或串口写出去。

## 用法

```js
//TSPL
import TSPL from '@/utils/tspl'
const data = new TSPL()
  .init()
  .size(75, 60)              // 标签宽高(mm)
  .gap(2)
  .cls()
  .text(10, 10, 'TSS24.BF2', 1, 1, '打印测试文本')
  .qrcode(40, 50, 'L', 5, 'A', 'www.poscom.cn')
  .barcode(10, 180, '128', 64, 1, 2, 4, '200902125410')
  .bitmap(10, 250, 0, imageData)
  .print()
  .getData()                 // Uint8Array，直接交给蓝牙/串口写

// CPCL 用法一样
import CPCL from '@/utils/cpcl'
const data2 = new CPCL()
  .init(5, 200, 200, 500, 1)
  .pageWidth(600)
  .text(0, 0, 20, 100, '测试文本')
  .print()
  .getData()
```

`getRawData()` 可以拿到可读的命令串，调试时看这个。`bitmap()` 要的 `imageData` 是这么来的：`uni.getImageInfo` 拿到图片路径 → `uni.createCanvasContext` 把图画到画布上 → `uni.canvasGetImageData` 取出像素数据。

库里没封装的指令用 `raw()` 接上去，和封装好的方法一样按顺序拼进同一条命令流，每条会自动补上回车换行：

```js
new TSPL().init()
  .size(75, 60)
  .raw('SET PEEL ON')       // 库里没封装的指令
  .text(10, 10, 'TSS24.BF2', 1, 1, '打印测试文本')
  .print()
  .getData()
```

内容**原样写入、不做转义**，所以内容里要带双引号时得自己转义（规则见下面「注意事项」）。`CPCL` 的 `raw()` 用法一样。

## 注意事项

- **内容转义**——`TSPL` 的文本/条码/二维码内容是用双引号包起来的，所以内容里的双引号必须由调用方自己转义，库**不做转义**。项目里加个工具函数即可：

  ```js
  const escape = (s) => `${s}`
    .replace(/"/g, '\\["]')
    .replace(/\r/g, '\\[R]')
    .replace(/\n/g, '\\[L]')
  ```

  规则来自手册：双引号写`\["]`、CR写`\[R]`、LF写`\[L]`（`\[L]`是“V5.10EZ”后的写法，旧固件换行打不出来就改成`\[A]`试下）。`CPCL` 的内容不加引号，没有这套转义。两边共同的一条：内容里别放裸的 CR/LF，它会被当成命令结束符把一条命令切成两条，多行文字请用多条 `text` 分别指定 `y` 坐标。
- **编码要跟字库匹配**——内置中文点阵字体本身就是内码字库（`TSS*.BF2`简体=GB码、`TST24.BF2`繁体=大五码），所以现在内容统一用 `gb18030` 配简体字库，换繁体/韩日字库就得换编码。TSPL2 虽然支持 `CODEPAGE UTF-8`，但**省不掉转码**（只对 Unicode 的 TTF 字体有意义）；CPCL 对应的开关是 `COUNTRY CHINA`/`BIG5`。注意**能编码≠能打印**：`gb18030` 有四字节区、连 emoji（`😀` → `94 39 fc 36`）都编得出来，但 `TSS24.BF2` 这类点阵字库只有 GB 码（双字节）区的字形，四字节码位在字库里没有点阵，照样打不出来——卡点在字库，不在编码器。
- **位图**——两个指令集对“一个位代表什么”的约定是**相反**的：`TSPL` 的 `BITMAP` 是 0=打印/1=不打印，`CPCL` 的 `CG` 是 1=打印/0=不打印（所以 CPCL 那边做了反转）。另外 `BITMAP` 头部的宽度是**字节数**（`ceil(宽度/8)`），每行必须独立按字节对齐、行尾补“不打印”(1)——不能把整张图摊平了每 8 位切一刀，那样宽度不是 8 的倍数时行与行会累积错位（图像斜切），而且总字节数少于头部声明的 `宽度(字节)*高度`，打印机就会把后面的命令当成图像数据吃掉。透明像素要按白纸做 alpha 合成（`c = c*a + 255*(1-a)`）再算灰度，否则 PNG 的透明区 RGB 是 `(0,0,0)`，会被整块印黑。示例里的 `marker.png` 现在会印成空白：它本身偏浅（最暗的像素灰度也有 137.7，高于 128 阈值），要在只支持黑白的打印机上出效果，得加深原图或者引入抖动(dithering)。
- **`intToByte()` 不必调用**——它只有在把命令数组交给**原生安卓插件**时才需要（那种接口要传 `byte[]`，取值必须是 -128~127）；普通蓝牙写入走 `batchWrite`→`ArrayBuffer`，与平台无关。

## 示例项目

两个使用场景：

- `components/popup` —— 弹窗组件，项目各处都能引用
- `pages/single` —— 单独的页面，用完就关蓝牙

两个都是一键连接蓝牙、不需要自己选设备，所以要先测好**设备名称、广播ID、服务ID、特征值ID**填到 `commonConst` 里——不知道填什么就去 `pages/manual` 页面扫一下、挑特征值是 `write:true` 的，不好找就直接联系打印机官方技术。

目前实机测过安卓和微信小程序，**IOS 没测**，而且只测了文本、条码、二维码、位图这些基本功能。

## 开发说明

- 编码依赖 [iconv-lite](https://github.com/ashtuchkin/iconv-lite)（Node 库），所以还得用 [vite-plugin-node-polyfills](https://www.npmjs.com/package/vite-plugin-node-polyfills) 插件来适配
- 蓝牙写入有长度限制，需要分批写入，每批之间加了 100ms 延迟
- `uniapp` 蓝牙部分 `off取消监听` 的多个方法只支持微信小程序，app 端不支持，可能导致重复监听
- 编程手册放在 `doc/手册/` 目录下，怎么挑、手册之间怎么对照，见 [doc/手册对照笔记.md](doc/手册对照笔记.md)
- 部分新增/改动的功能**没有实机验证**过，清单见 [doc/待实机验证.md](doc/待实机验证.md)
- 测试用打印机是汉印的 `HM-A300E`，`TSPL` 和 `CPCL` 可以通过刷固件来切换（汉印可以向技术要，佳博不清楚），但切换后汉印官方自带的小程序貌似就不能用了

## 参考

- [cpcl-bluetooth-print](https://github.com/codersmoixan/cpcl-bluetooth-print) 中的部分 `CPCL` 封装
- [BluetoothPrinter](https://gitee.com/booltrue/bluetooth-printer/tree/master)，除了低功耗蓝牙，还有原生安卓蓝牙操作
- 佳博、汉印两家都可以找客服技术要 `uniapp` 示例；汉印的 `uniapp` 版本只有`安卓原生插件`，纯 js 版本代码比较老
