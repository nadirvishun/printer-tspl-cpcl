export default {
  //打印机蓝牙配置（连哪个设备）
  bluetoothConfig: {
    deviceName: 'HM-A300-DB87',//蓝牙名称
    advertServiceId: '0000FEE7-0000-1000-8000-00805F9B34FB',//搜索用的广播ID
    serviceId: '0000FF00-0000-1000-8000-00805F9B34FB',//服务ID
    characterId: '0000FF02-0000-1000-8000-00805F9B34FB'//特征值ID
  },
  //分批写入的参数（怎么发数据）
  writeConfig: {
    chunkSize: 20,//每批写入的字节数（BLE 默认 ATT_MTU 23 减 3 字节 ATT 头 = 20；用 setBLEMTU 协商过就能调大）
    interval: 50//两批之间的延时(ms)。BLE 连接间隔常见 7.5~30ms，50 是留了余量的；打印机吃不下就调大，特征值支持带响应写入时可以调小甚至给 0
  }
}
