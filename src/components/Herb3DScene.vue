<script setup>
import { shallowRef } from 'vue'
// ✅ 只引入这一项，不要引入 TresMesh, TresCylinderGeometry 等
import { useLoop } from '@tresjs/core'

// 使用 shallowRef 性能更好（TresJS 推荐）
const meshRef = shallowRef(null)

// 官方推荐：用 onBeforeRender 在每帧渲染前更新旋转（见 TresJS Your First Scene）
const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  if (meshRef.value) {
    meshRef.value.rotation.y = elapsed * 0.5
    meshRef.value.rotation.z = Math.sin(elapsed * 0.5) * 0.1
  }
})
</script>

<template>
  <TresMesh ref="meshRef" :position="[0, 0, 0]">
    <TresCylinderGeometry :args="[0.5, 0.5, 1.8, 32]" />
    
    <TresMeshBasicMaterial :wireframe="true" color="#8B5A2B" />
  </TresMesh>
</template>