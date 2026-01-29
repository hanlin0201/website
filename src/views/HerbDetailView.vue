<script setup>
import { onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
// 3D 核心组件与控制器
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
// 引入你的 3D 模型子组件
import Herb3DScene from '@/components/Herb3DScene.vue'
// 引入数据获取逻辑
import { useHerbDetail } from '@/composables/useHerbData'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)

// 数据加载状态管理
const { herb, loading, error, load } = useHerbDetail(id)

function doLoad() {
  // 确保 ID 存在且有效才加载
  if (id.value && id.value !== '') {
    load(id.value)
  }
}

// 首次挂载和 ID 变化时触发加载
onMounted(doLoad)
watch(id, doLoad)

function goBack() {
  router.push('/') // 确保返回首页
}
</script>

<template>
  <div class="min-h-screen pb-24 flex flex-col bg-[#FDFBF7]">
    <header class="sticky top-0 z-10 glass-search wood-overlay px-4 py-2 flex items-center gap-3 border-b border-sandalwood/10">
      <button
        type="button"
        class="p-1.5 rounded-lg text-sandalwood hover:bg-sandalwood/10 transition-colors"
        aria-label="返回"
        @click="goBack"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="font-serif font-semibold text-sandalwood truncate text-lg">
        {{ herb?.name || '药材详情' }}
      </h1>
    </header>

    <template v-if="loading">
      <div class="flex-1 flex flex-col items-center justify-center text-sandalwood/60 gap-3">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sandalwood"></div>
        <span class="text-sm font-serif">正在翻阅本草纲目...</span>
      </div>
    </template>

    <template v-else-if="error || !herb">
      <div class="flex-1 flex flex-col items-center justify-center text-cinnabar gap-2">
        <span class="text-3xl">🍂</span>
        <span class="font-serif">未找到该药材记录</span>
        <button @click="goBack" class="text-sm underline text-sandalwood mt-2">返回首页</button>
      </div>
    </template>

    <template v-else>
      <!-- 3D 容器：显式高度 + shrink-0 防止 flex 压缩；内层 absolute 填满，确保 TresCanvas 父级有尺寸 -->
      <div class="w-full h-[42vh] min-h-[300px] shrink-0 bg-paper/90 border-b border-sandalwood/10 relative">
        <div class="tres-canvas-fill absolute inset-0 w-full h-full">
          <TresCanvas clear-color="#FDFBF7" alpha>
            <TresPerspectiveCamera :position="[3, 3, 3]" :look-at="[0, 0, 0]" />
            <OrbitControls :enable-zoom="false" :auto-rotate="false" />
            <Herb3DScene />
            <TresAmbientLight :intensity="1.5" />
            <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" />
          </TresCanvas>
        </div>
        <div class="absolute bottom-2 right-4 z-10 text-xs text-sandalwood/40 font-serif pointer-events-none">
          ⟲ 拖动旋转查看
        </div>
      </div>

      <main class="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-5 animate-fade-in-up">
        
        <div class="rounded-xl bg-paper-card shadow-paper p-5 border border-sandalwood/10">
          <h2 class="text-cinnabar font-serif font-semibold text-base mb-2 flex items-center gap-2">
            <span class="w-1 h-4 bg-cinnabar rounded" /> 性味归经
          </h2>
          <p class="text-sandalwood/90 text-sm leading-relaxed text-justify">
            {{ herb.nature }}；{{ herb.channel }}
          </p>
        </div>

        <div class="rounded-xl bg-paper-card shadow-paper p-5 border border-sandalwood/10">
          <h2 class="text-cinnabar font-serif font-semibold text-base mb-2 flex items-center gap-2">
            <span class="w-1 h-4 bg-cinnabar rounded" /> 功效
          </h2>
          <p class="text-sandalwood/90 text-sm leading-relaxed text-justify">{{ herb.efficacy }}</p>
        </div>

        <div class="rounded-xl bg-paper-card shadow-paper p-5 border border-sandalwood/10">
          <h2 class="text-bamboo font-serif font-semibold text-base mb-2 flex items-center gap-2">
            <span class="w-1 h-4 bg-bamboo rounded" /> 用法用量
          </h2>
          <p class="text-sandalwood/90 text-sm leading-relaxed text-justify">{{ herb.usage }}</p>
        </div>

        <div class="rounded-xl bg-paper-card shadow-paper p-5 border border-sandalwood/10">
          <h2 class="text-cinnabar font-serif font-semibold text-base mb-2 flex items-center gap-2">
            <span class="w-1 h-4 bg-cinnabar rounded" /> 使用禁忌
          </h2>
          <p class="text-sandalwood/90 text-sm leading-relaxed text-justify">{{ herb.taboo }}</p>
        </div>
      </main>
    </template>
  </div>
</template>