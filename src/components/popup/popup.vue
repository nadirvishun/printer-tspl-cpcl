<script setup>
import {useCommonStore} from "@/store/common";
import {storeToRefs} from "pinia";
import {offConnect, startConnect, startOpen} from "@/utils/bluetooth";
import commonConst from "@/constants/commonConst";
import {batchWrite, offDeviceFound, onConnect} from "@/utils/bluetooth";
import {getCurrentInstance, onMounted, ref, watch} from "vue";
import logo from "@/static/logo.png"
import TSPL from "@/utils/tspl";
import CPCL from "@/utils/cpcl";
import {getImageData, getImageInfo} from "@/utils/image";

const model = defineModel()
const commonStore = useCommonStore()
const {isConnect} = storeToRefs(commonStore);
const deviceId = ref('');
//切换类型
const type = ref('tspl')

//发现监听执行回调
const foundListener = (res) => {
  //如果找到此名称，则自动连接
  console.log(res)
  if (res.devices[0].name === commonConst.bluetoothConfig.deviceName) {
    deviceId.value = res.devices[0].deviceId;
    startConnect(deviceId.value, commonConst.bluetoothConfig.serviceId);
  }
}

//连接监听执行回调
const connectListener = (res) => {
  commonStore.seIsConnect(res.connected);
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

//watch弹窗打开关闭来是否开启相关监听
watch(
    () => model.value,
    (newVal, oldVal) => {
      if (newVal) {
        //开启连接监听
        onConnect(connectListener);
      } else {
        //关闭发现监听
        if (foundListener) {
          offDeviceFound(foundListener)
        }
        //关闭连接监听
        if (connectListener) {
          offConnect(connectListener)
        }
      }
    },
    {immediate: true}
)

const canvasWidth = ref(0);
const canvasHeight = ref(0);
const imageData = ref(null);
const {proxy} = getCurrentInstance();

onMounted(async () => {
  // await loadImage()
})

//加载画布图片
async function loadImage() {
  //绘制图片
  const {width, height, path} = await getImageInfo(logo);
  console.log(width, height, path);
  //小程序中返回的不带/，会导致无法加载，而安卓的前缀是file:///storage/emulated/0/xxx
  let formatPath = path.startsWith('file') ? path : `/${path}`;
  canvasWidth.value = width;
  canvasHeight.value = height;
  const ctx = uni.createCanvasContext('hiddenCanvas', proxy);
  ctx.drawImage(formatPath, 0, 0, width, height);
  ctx.draw(false, async () => {
    //获取信息
    imageData.value = await getImageData('hiddenCanvas', width, height);
    console.log(imageData.value)
  })
}

//一键连接蓝牙
function handleOpen() {
  startOpen(foundListener, commonConst.bluetoothConfig.advertServiceId);
}

//打印
async function startPrint() {
  if (type.value === 'tspl') {
    await tsplPrint();
  } else if (type.value === 'cpcl') {
    cpclPrint()
  }
}

//tspl打印
async function tsplPrint() {
  let command = new TSPL()
      .init()
      .size(75, 60)
      .gap(2)
      .cls()
      .text(10, 10, "TSS24.BF2", 1, 1, "打印测试文本") // 文本
      .qrcode(40, 50, "L", 5, "A", "www.poscom.cn") // 二维码
      .barcode(10, 180, "128", 64, 1, 2, 4, "200902125410") // 条形码
      .bitmap(10, 250, 0, imageData.value)
      .box(10, 500, 500, 1000)
      .print()
  const sendData = command.getData();
  console.log(command.getRawData())
  await batchWrite(deviceId.value, commonConst.bluetoothConfig.serviceId, commonConst.bluetoothConfig.characterId, sendData);
}

//cpcl打印
function cpclPrint() {
  let command = new CPCL()
      .init(5, 200, 200, 500, 1)
      .pageWidth(600)
      .center()
      .text(0, 0, 20, 100, '测试文本')
      .barcodeTextOFF()
      .barcode(128, 2, 0, 60, 0, 30, '123456789')
      .left()
      .qrcode(0, 100, 2, 8, 'M', "测试二维码")
      .print()
  const sendData = command.getData();
  console.log(command.getRawData())
  batchWrite(deviceId.value, commonConst.bluetoothConfig.serviceId, commonConst.bluetoothConfig.characterId, sendData);
}
</script>

<template>
  <wd-popup v-model="model" closable :close-on-click-modal="false" @after-enter="loadImage">
    <view class="custom-txt">
      <wd-radio-group v-model="type" shape="button" inline size="large">
        <wd-radio value="tspl">TSPL</wd-radio>
        <wd-radio value="cpcl">CPCL</wd-radio>
      </wd-radio-group>
      <view style="margin-top: 10px">
        连接状态：
        <wd-tag :type="isConnect?'success':'warning'">{{ isConnect ? '已连接' : '未连接' }}</wd-tag>
      </view>
      <view style="margin-top: 10px">
        <wd-button size="small" type="success" @click="handleOpen()" v-if="!isConnect">连接蓝牙</wd-button>
        <wd-button size="small" type="primary" @click="startPrint()" v-if="isConnect">打印测试</wd-button>
      </view>

      <!-- 隐藏的Canvas，不显示在页面上，微信小程序有相关方法直接创建，其它的则需要绝对定位将其移出屏幕，这里为了方便则不隐藏了 -->
      <canvas
          canvas-id="hiddenCanvas"
          id="hiddenCanvas"
          :width="canvasWidth"
          :height="canvasHeight"
      ></canvas>
    </view>
  </wd-popup>
</template>

<style scoped lang="scss">
.custom-txt {
  color: black;
  width: 600rpx;
  padding: 40rpx;
  font-size: 40rpx;
  border-radius: 32rpx;
}
</style>
