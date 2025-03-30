<template>
  <view class="content">
    <wd-divider>全局蓝牙</wd-divider>
    <wd-button v-for="item in list" @click="handlePop">
      {{ item }}
    </wd-button>
    <wd-divider>单独页面蓝牙</wd-divider>
    <wd-button type="success" block @click="handleSingle">新页面</wd-button>
    <wd-divider>调试页面</wd-divider>
    <wd-button type="warning" block @click="handleManual">蓝牙调试</wd-button>
    <!--  弹窗  -->
    <popup v-model="show"></popup>
  </view>
</template>

<script setup>
import {ref} from "vue";

const list = ref([1, 2, 3, 4, 5])
const show = ref(false)

function handlePop() {
  show.value = true;
}

function handleSingle() {
  uni.navigateTo({
    url: "/pages/single/index"
  })
}

function handleManual() {
  uni.navigateTo({
    url: "/pages/manual" +
        "/index"
  })
}
</script>

<style lang="scss" scoped>
.content {
  margin: 20px
}
</style>
