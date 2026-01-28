<script setup>
import { onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useHerbDetail } from '@/composables/useHerbData'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)

const { herb, loading, error, load } = useHerbDetail(id)

function doLoad() {
  if (id.value != null && id.value !== '') load(id.value)
}
onMounted(doLoad)
watch(id, doLoad)

function goBack() {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="min-h-screen pb-24 flex flex-col">
    <!-- 顶部返回 -->
    <header class="sticky top-0 z-10 glass-search wood-overlay px-4 py-2 flex items-center gap-3">
      <button
        type="button"
        class="p-1.5 rounded-lg text-sandalwood hover:bg-sandalwood/10 transition-colors"
        aria-label="返回"
        @click="goBack"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="font-serif font-semibold text-sandalwood truncate">
        {{ herb?.name || '药材详情' }}
      </h1>
    </header>

    <template v-if="loading">
      <div class="flex-1 flex items-center justify-center text-sandalwood/60">加载中…</div>
    </template>
    <template v-else-if="error || !herb">
      <div class="flex-1 flex items-center justify-center text-cinnabar">加载失败或药材不存在</div>
    </template>
    <template v-else>
      <!-- 上半部分：抽象线框示意（金棕色旋转，代表根茎/果实） -->
      <div class="w-full h-[42vh] min-h-[240px] bg-paper/90 border-b border-sandalwood/10 flex items-center justify-center">
        <div class="herb-wireframe-placeholder" aria-hidden="true" />
      </div>

      <!-- 下半部分：功效、用法用量、禁忌 -->
      <main class="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <section class="space-y-5">
          <div class="rounded-xl bg-paper-card shadow-paper p-5 border border-sandalwood/10">
            <h2 class="text-cinnabar font-serif font-semibold text-base mb-2 flex items-center gap-2">
              <span class="w-1 h-4 bg-cinnabar rounded" /> 性味归经
            </h2>
            <p class="text-sandalwood/90 text-sm leading-relaxed">
              {{ herb.nature }}；{{ herb.channel }}
            </p>
          </div>

          <div class="rounded-xl bg-paper-card shadow-paper p-5 border border-sandalwood/10">
            <h2 class="text-cinnabar font-serif font-semibold text-base mb-2 flex items-center gap-2">
              <span class="w-1 h-4 bg-cinnabar rounded" /> 功效
            </h2>
            <p class="text-sandalwood/90 text-sm leading-relaxed">{{ herb.efficacy }}</p>
          </div>

          <div class="rounded-xl bg-paper-card shadow-paper p-5 border border-sandalwood/10">
            <h2 class="text-bamboo font-serif font-semibold text-base mb-2 flex items-center gap-2">
              <span class="w-1 h-4 bg-bamboo rounded" /> 用法用量
            </h2>
            <p class="text-sandalwood/90 text-sm leading-relaxed">{{ herb.usage }}</p>
          </div>

          <div class="rounded-xl bg-paper-card shadow-paper p-5 border border-sandalwood/10">
            <h2 class="text-cinnabar font-serif font-semibold text-base mb-2 flex items-center gap-2">
              <span class="w-1 h-4 bg-cinnabar rounded" /> 使用禁忌
            </h2>
            <p class="text-sandalwood/90 text-sm leading-relaxed">{{ herb.taboo }}</p>
          </div>
        </section>
      </main>
    </template>
  </div>
</template>
