/**
 * 初始化
 * @returns {Promise<unknown>}
 */
export function init() {
  return new Promise((resolve, reject) => {
    uni.openBluetoothAdapter({
      success(res) {
        console.log("初始化成功：", res)
        resolve(res)
      },
      fail(err) {
        console.error("初始化失败：", err)
        reject(err)
      }
    })
  })
}

/**
 * 检测适配器状态
 * @returns {Promise<unknown>}
 */
export function checkInit() {
  return new Promise((resolve, reject) => {
    uni.getBluetoothAdapterState({
      success(res) {
        console.log("检测适配器状态成功：", res)
        if (res.available) {
          //成功
          resolve(res)
        } else {
          //失败
          reject(res)
        }
      },
      fail(err) {
        console.error("检测适配器状态失败：", err)
        //失败
        reject(err)
      }
    })
  })
}

/**
 * 搜索信息的设备
 * @param {string} advertServiceId
 * @returns {Promise<unknown>}
 */
export function discovery(advertServiceId) {
  return new Promise((resolve, reject) => {
    uni.startBluetoothDevicesDiscovery({
      services: [advertServiceId],
      success(res) {
        console.log("开始搜索成功：", res)
        uni.showLoading({
          title: "开始搜索..."
        })
        resolve(res)
      },
      fail(err) {
        console.error("开始搜索成功：", err)
        uni.showToast({
          title: "开启搜索失败，请重试",
          icon: "none",
        })
        reject(err)
      }
    })
  })
}

/**
 * 停止搜索
 * @returns {Promise<unknown>}
 */
export function stopDiscovery() {
  return new Promise((resolve, reject) => {
    uni.stopBluetoothDevicesDiscovery({
      success(res) {
        console.log('停止搜索成功：', res)
        resolve(res)
      },
      fail(err) {
        console.log('停止搜索失败：', err)
        reject(err)
      }
    })
  })
}

/**
 * 获取蓝牙服务
 * @param {string} deviceId
 * @returns {Promise<unknown>}
 */
export function getServices(deviceId) {
  return new Promise((resolve, reject) => {
    uni.getBLEDeviceServices({
      deviceId: deviceId,
      success(res) {
        console.log("获取蓝牙服务成功：", res)
        resolve(res)
      },
      fail(err) {
        console.error("获取蓝牙服务失败：", err)
        reject(err)
      }
    })
  })
}

/**
 * 获取蓝牙服务特征值
 * @param {string} deviceId
 * @param {string} serviceId
 * @returns {Promise<unknown>}
 */
export function getCharacteristics(deviceId, serviceId) {
  return new Promise((resolve, reject) => {
    uni.getBLEDeviceCharacteristics({
      deviceId: deviceId, // 设备ID
      serviceId: serviceId,
      success(res) {
        console.log("获取蓝牙服务特征值成功：", res)
        resolve(res)
      },
      fail(err) {
        console.error("获取蓝牙服务特征值失败：", err)
        reject(err)
      }
    })
  })
}


/**
 * 连接蓝牙
 * @param {string} deviceId
 * @returns {Promise<unknown>}
 */
export function connect(deviceId) {
  uni.showLoading({
    title: "已搜索到设备，连接中..."
  });
  return new Promise((resolve, reject) => {
    uni.createBLEConnection({
      deviceId: deviceId,
      success(res) {
        console.log('连接成功：', res)
        uni.showToast({title: "连接成功", icon: "none"})
        resolve(res)
      },
      fail(err) {
        console.error('连接失败：', err)
        uni.showToast({title: "连接失败，请重试", icon: "none"})
        reject(err)
      }
    })
  })
}

/**
 * 关闭蓝牙连接
 * @param {string} deviceId
 * @returns {Promise<unknown>}
 */
export function closeConnect(deviceId) {
  return new Promise((resolve, reject) => {
    uni.closeBLEConnection({
      deviceId: deviceId,
      success(res) {
        console.log("关闭蓝牙连接：", res)
        resolve(res)
      },
      fail(err) {
        console.log('关闭蓝牙连接失败：', err)
        reject(err)
      }
    })
  })
}

/**
 * 关闭蓝牙适配器
 */
export function closeAdapter() {
  return new Promise((resolve, reject) => {
    uni.closeBluetoothAdapter({
      success(res) {
        console.log('关闭蓝牙适配器：', res)
        resolve(res)
      },
      fail(err) {
        console.log('关闭蓝牙适配器失败：', err)
        reject(err)
      }
    })
  })
}

/**
 * 开启查找蓝牙设备监听回调
 * @param {function} listener
 */
export function onDeviceFound(listener) {
  uni.onBluetoothDeviceFound(listener);
}

/**
 * 关闭查找蓝牙设备监听回调(貌似目前只支持微信，app没有此方法可能会导致多次监听)
 * @param {function} listener
 */
export function offDeviceFound(listener) {
  //#ifdef MP-WEIXIN
  uni.offBluetoothDeviceFound(listener);
  //#endif
}

/**
 * 开启连接状态监听
 * @param {function} listener
 */
export function onConnect(listener) {
  uni.onBLEConnectionStateChange(listener)
}

/**
 * 关闭连接状态监听(貌似目前只支持微信，app没有此方法可能会导致多次监听)
 * @param {function} listener
 */
export function offConnect(listener) {
  //#ifdef MP-WEIXIN
  uni.offBLEConnectionStateChange(listener)
  //#endif
}

/**
 * 分批写入
 * @param {string} deviceId
 * @param {string} serviceId
 * @param {string} characteristicId
 * @param {Array} uint8Array
 */
export async function batchWrite(deviceId, serviceId, characteristicId, uint8Array) {
  return new Promise(async (resolve, reject) => {
    let uint8Buf = Array.from(uint8Array);
    const size = 20;
    try {
      for (let i = 0; i < uint8Buf.length; i += size) {
        let data = uint8Buf.slice(i, i + size)
        const buffer = new ArrayBuffer(data.length);
        // 批量复制数据（无需逐字节操作）
        const newUint8 = new Uint8Array(buffer);
        newUint8.set(data);
        await write(deviceId, serviceId, characteristicId, buffer);
        //延时写入
        await new Promise(r => setTimeout(r, 100));
      }
      //批量写入完成
      resolve(true)
    } catch (e) {
      //批量写入失败
      reject(false)
    }
  })
}

/**
 * 写入
 * @param {string} deviceId
 * @param {string} serviceId
 * @param {string} characteristicId
 * @param {ArrayBuffer} buffer
 * @returns {Promise<unknown>}
 */
export function write(deviceId, serviceId, characteristicId, buffer) {
  return new Promise((resolve, reject) => {
    uni.writeBLECharacteristicValue({
      deviceId,
      serviceId,
      characteristicId,
      value: buffer,
      success(res) {
        console.log("写入成功连接：", res)
        resolve(res)
      },
      fail(err) {
        console.log('写入失败：', err)
        reject(err)
      }
    })
  })
}

/**
 * 一键开启
 * @param {function} listener
 * @param {string} advertServiceId
 * @returns {Promise<void>}
 */
export async function startOpen(listener, advertServiceId) {
  //判定是否打开
  try {
    await checkInit();
  } catch (e) {
    try {
      await init();
    } catch (e) {
      uni.showToast({
        title: "初始化失败，请打开手机的【蓝牙】开关和【定位】开关后重试",
        icon: "none",
      })
      return
    }
  }
  //如果没有连接，则搜索
  try {
    //开启监听
    onDeviceFound(listener);
    //开始搜索
    await discovery(advertServiceId);
  } catch (e) {

  }
}


/**
 * 开始连接
 * @param {string} deviceId
 * @param {string} serviceId
 */
export async function startConnect(deviceId, serviceId) {
  try {
    await connect(deviceId);
    //停止搜索
    await stopDiscovery();
    //如果是ios,还是需要获取服务和特征值，安卓则不需要，因为已经都配置好了
    const isIOS = uni.getSystemInfoSync().platform === 'ios'
    if (isIOS) {
      //获取蓝牙服务
      await getServices(deviceId)
      //获取蓝牙服务特征值
      await getCharacteristics(deviceId, serviceId)
    }
  } catch (e) {
  }
}
