# TSPL / CPCL 指令封装

给 `uniapp vue3（非ts）` 用的标签打印机指令封装。JS 端的 `TSPL` 封装基本都跟佳博的 sdk 差不多、也有点旧了，这里用`模板字符串`重新封装了一遍；`CPCL` 的封装则很少，照着手册自己封了一套。

## 使用说明

- **基础用法**

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

  `bitmap()` 要的 `imageData` 是这么来的：`uni.getImageInfo` 拿到图片路径 → `uni.createCanvasContext` 把图画到画布上 → `uni.canvasGetImageData` 取出像素数据。

- **自定义指令**

  库里没封装的指令用 `raw()` 接上去，和封装好的方法一样按顺序拼进同一条命令流，每条会自动补上回车换行：

  ```js
  new TSPL().init()
    .size(75, 60)
    .raw('SET PEEL ON')       // 库里没封装的指令
    .text(10, 10, 'TSS24.BF2', 1, 1, '打印测试文本')
    .print()
    .getData()
  ```

  内容**原样写入、不做转义**，所以内容里要带双引号时得自己转义（规则见「注意事项」）。`CPCL` 的 `raw()` 用法一样。

- **调试**

  `getRawData()` 方法可以拿到可读的命令串（位图的内容不包含在内），可以作为调试用。

## 注意事项

- **内容转义**
  - `TSPL` 的文本/条码/二维码内容是用双引号包起来的，所以内容里的双引号必须由调用方自己转义，库**不做转义**。项目里加个工具函数即可：

    ```js
    const escape = (s) => `${s}`
      .replace(/"/g, '\\["]')
      .replace(/\r/g, '\\[R]')
      .replace(/\n/g, '\\[L]')
    ```

  - 规则：双引号写`\["]`、CR写`\[R]`、LF写`\[L]`（`\[L]`是“V5.10EZ”后的写法，旧固件换行打不出来就改成`\[A]`试下）
  - `CPCL` 的内容不加引号，没有这套转义
  - 内容里的 CR/LF 会被当成命令结束符，会把一条命令切成两条，所以最好不要用，而是用多条 `text` 等替代
- **编码要跟字库匹配**
  - 内置的中文是**点阵字库**（如 `TSS24.BF2`），它内部**按 GB 码索引**：发过去的字节，打印机会拿去这张表里查字形。所以**发什么码就得配什么字库**——简体字库就用 `gb18030` 编码发送，换成繁体字库（`TST24.BF2`，按大五码索引）就得跟着换编码
  - TSPL2 的 `CODEPAGE UTF-8` **省不掉转码**：它只对 TTF 矢量字体有效（TTF 按 Unicode 索引，而且字体得先刷进打印机），内置点阵字库照样认 GB 码；CPCL 对应的是 `COUNTRY CHINA`/`BIG5`
  - **能编码≠能打印**：emoji 这类字符 `gb18030` 编得出来，但字库里没有对应字形，照样打不出来
- **位图**
  - `BITMAP` 和 `CG` 对“一个位代表什么”的约定**相反**：TSPL 是 0=打印，CPCL 是 1=打印（所以 CPCL 那边做了反转）
  - `BITMAP` 头部的宽度是**字节数**（`ceil(宽度/8)`），**每行独立按字节对齐**、行尾补“不打印”
  - 透明像素按白纸做 alpha 合成再算灰度，否则 PNG 的透明区会被整块印黑
  - 图本身偏浅时阈值化后可能整张空白，需要先加深原图或者加抖动
- **`intToByte()` 不必调用**
  - 它只在把命令数组交给**原生安卓插件**时才需要：那种接口要传 `byte[]`，取值必须是 -128~127
  - 目前项目中的示例还是JS封装的，走`batchWrite`→`ArrayBuffer`，不需要调用

## 示例项目

两个使用场景：

- `components/popup` —— 弹窗组件，项目各处都能引用
- `pages/single` —— 单独的页面，用完就关蓝牙

两个都是一键连接蓝牙、不需要自己选设备，所以**设备名称、广播ID、服务ID、特征值ID**得先填到 `commonConst` 里。这几个值可以用 `pages/manual` 页面扫出来看（挑特征值是 `write:true` 的那个），找不到就直接问打印机厂商的技术。

蓝牙的搜索、连接、分批写入封装在 `src/utils/bluetooth.js`（示例页面用它把 `getData()` 的结果发出去）。它不属于 `TSPL`/`CPCL` 这两个类，换成别的传输方式时可以整个替掉。

目前实机测过安卓和微信小程序，**IOS 没测**，而且只测了文本、条码、二维码、位图这些基本功能。

## 开发说明

- 编码依赖 [iconv-lite](https://github.com/ashtuchkin/iconv-lite)（Node 库），所以还得用 [vite-plugin-node-polyfills](https://www.npmjs.com/package/vite-plugin-node-polyfills) 插件来适配
- 蓝牙写入有长度限制（BLE 默认单次 20 字节），所以是分批发的，两批之间可能需要加延迟。每批多少字节、间隔多久都在 `commonConst.writeConfig` 里，这两个值跟具体打印机有关
- `uniapp` 蓝牙部分 `off取消监听` 的多个方法只支持微信小程序，app 端不支持，可能导致重复监听
- 编程手册放在 `doc/手册/` 目录下，怎么挑、手册之间怎么对照，见 [doc/手册对照笔记.md](doc/手册对照笔记.md)
- 部分新增/改动的功能**没有实机验证**过，清单见 [doc/待实机验证.md](doc/待实机验证.md)
- 测试用打印机是汉印的 `HM-A300E`，`TSPL` 和 `CPCL` 可以通过刷固件来切换（汉印可以向技术要，佳博不清楚），但切换后汉印官方自带的小程序貌似就不能用了

## 参考

- [cpcl-bluetooth-print](https://github.com/codersmoixan/cpcl-bluetooth-print) 中的部分 `CPCL` 封装
- [BluetoothPrinter](https://gitee.com/booltrue/bluetooth-printer/tree/master)，除了低功耗蓝牙，还有原生安卓蓝牙操作
- 佳博、汉印两家都可以找客服技术要 `uniapp` 示例；汉印的 `uniapp` 版本只有`安卓原生插件`，纯 js 版本代码比较老
