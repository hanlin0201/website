<script setup>
import { ref } from 'vue'
// ✅ 修正点：只引入 useLoop，删掉 TresMesh 等组件的引入
import { useLoop } from '@tresjs/core'

const meshRef = ref(null)

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  if (meshRef.value) {
    meshRef.value.rotation.y = elapsed * 0.4
  }
})
</script>

<template>
  <TresPerspectiveCamera :position="[2.2, 2.2, 2.2]" :look-at="[0, 0, 0]" />
  
  <TresMesh ref="meshRef" :position="[0, 0, 0]">
    <TresCylinderGeometry :args="[0.55, 0.6, 1.4, 20, 6]" />
    <TresMeshBasicMaterial :wireframe="true" color="#8B5A2B" />
  </TresMesh>
</template>