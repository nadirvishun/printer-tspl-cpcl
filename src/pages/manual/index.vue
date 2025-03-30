<template>
  <view class="m-4">
    <view class="text-center">
      <view class="mt-2">
        <wd-button type="success" @click="handleInit">初始化</wd-button>
      </view>
      <view class="mt-2">
        <wd-button type="success" @click="search">搜索蓝牙</wd-button>
      </view>
      <view class="mt-2">
        <wd-button type="warning" @click="stopSearch">停止搜索蓝牙</wd-button>
      </view>
      <view class="mt-2">
        <wd-button type="success" @click="handleServices">获取蓝牙服务和特征值（连接后）</wd-button>
      </view>
      <view class="mt-2">
        <wd-button type="warning" @click="handleCloseConnect">关闭连接</wd-button>
      </view>
    </view>

    <wd-divider custom-class="my-2" color="#4D80F0"></wd-divider>

    <wd-cell-group title="列表" v-if="deviceList.length>0">
      <wd-cell :title="item.name" :label="item.deviceId" value="连接" is-link @click="handleConnect(item.deviceId)"
               v-for="item in deviceList"/>
    </wd-cell-group>

  </view>
</template>

<script setup>
import {onUnmounted, ref} from 'vue'
import {
  checkInit,
  closeAdapter,
  closeConnect,
  connect,
  getCharacteristics,
  getServices,
  init,
  offDeviceFound,
  onConnect, onDeviceFound,
  stopDiscovery
} from "@/utils/bluetooth";
import {onLoad} from "@dcloudio/uni-app";

const deviceList = ref([])
const deviceId = ref('')

//发现监听执行回调
const foundListener = (res) => {
  let deviceIds = deviceList.value.map(e => e.deviceId);
  if (!deviceIds.includes(res.devices[0].deviceId)) {
    deviceList.value.push(res.devices[0])
    //从中可以获取到蓝牙名称和广播ID
    console.log(res.devices);
  }
}

//连接监听执行回调
const connectListener = (res) => {
  console.log("蓝牙连接状态", res.connected)
  if (res.connected) {
    uni.showToast({
      title: "蓝牙连接成功",
      icon: "none",
    })
  } else {
    //如果断开，则取消监听设备发现
    if (foundListener) {
      offDeviceFound(foundListener)
    }
    uni.showToast({
      title: "蓝牙连接断开",
      icon: "none",
    })
  }
}

onLoad(() => {
  //开启连接监听
  onConnect(connectListener);
  //开启搜索监听
  onDeviceFound(foundListener)
})

onUnmounted(async () => {
  if (deviceId.value) {
    try {
      await closeConnect(deviceId.value);
    } catch (e) {

    }
  }
  await closeAdapter();
})

//初始化
async function handleInit() {
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
      return;
    }
  }
  uni.showToast({
    title: "初始化成功",
    icon: "none",
  })
}

//开始搜索(包含新的和已有的)
function search() {
  deviceList.value = [];//重置列表
  //寻找新的
  uni.startBluetoothDevicesDiscovery({
    success(res) {
      console.log("开始搜索成功：", res)
      uni.showToast({
        title: "开始搜索...",
        icon: "none",
      })
    },
    fail(err) {
      console.error("开始搜索成功：", err)
      uni.showToast({
        title: "开启搜索失败，请重试",
        icon: "none",
      })
    }
  })
}

//停止搜索
function stopSearch() {
  stopDiscovery()
  uni.showToast({
    title: "已停止搜索"
  })
}

//连接蓝牙
async function handleConnect(id) {
  console.log("尝试连接蓝牙ID：", id)
  deviceId.value = id
  await connect(id);
  //重置列表
  deviceList.value = [];
  // 停止搜索
  stopSearch()
}

function handleCloseConnect() {
  if (deviceId.value) {
    closeConnect(deviceId.value);
  }
}

//获取蓝牙设备服务
async function handleServices() {
  const res = await getServices(deviceId.value)
  let i = 1;
  const data = []
  for (let item of res.services) {
    let charaRes = await getCharacteristics(deviceId.value, item.uuid);
    const charaData = []
    for (let charaItem of charaRes.characteristics) {
      charaData.push({
        id: charaItem.uuid,
        read: charaItem.properties.read,
        write: charaItem.properties.write,
        notify: charaItem.properties.notify,
        indicate: charaItem.properties.indicate,
      })
    }
    data.push({
      serviceId: item.uuid,
      characteristics: charaData
    })
    console.log(`服务${i}：${JSON.stringify(data)}`)
    i++;
  }
  uni.showToast({
    title: "获取服务和特征值成功，请去日志中查看",
    icon: "none",
  })
}


</script>

<style lang="scss" scoped>
.m-4 {
  margin: 8rpx;
}

.mt-2 {
  margin-top: 4rpx;
}
</style>
