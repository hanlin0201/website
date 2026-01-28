<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from 'lucide-vue-next'
import HerbCard from '@/components/HerbCard.vue'
import { useHerbList } from '@/composables/useHerbData'

const TAGS = ['全部', '清热', '补气', '安神', '活血', '健脾', '明目', '养心', '解毒']

const { herbs, loading, error, load } = useHerbList()
const keyword = ref('')
const activeTag = ref('全部')

const filteredHerbs = computed(() => {
  let list = herbs.value
  if (keyword.value.trim()) {
    const k = keyword.value.trim().toLowerCase()
    list = list.filter(h =>
      h.name.toLowerCase().includes(k) ||
      (h.namePinyin || '').toLowerCase().includes(k) ||
      (h.tags || []).some(t => t.includes(k))
    )
  }
  if (activeTag.value !== '全部') {
    list = list.filter(h => (h.tags || []).includes(activeTag.value))
  }
  return list
})

onMounted(() => load())
</script>

<template>
  <div class="min-h-screen pb-24">
    <!-- 吸顶搜索栏：玻璃拟态 + 木纹覆盖 -->
    <header class="sticky top-0 z-20 glass-search wood-overlay px-4 py-3">
      <div class="max-w-4xl mx-auto">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sandalwood/60" />
          <input
            v-model="keyword"
            type="search"
            placeholder="搜索药材名称、拼音或功效…"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sandalwood/20 bg-white/80 text-sandalwood placeholder-sandalwood/50 focus:outline-none focus:ring-2 focus:ring-sandalwood/30 focus:border-sandalwood/40"
          />
        </div>
      </div>

      <!-- 横向滚动胶囊标签 -->
      <div class="mt-3 -mx-4 overflow-x-auto scrollbar-hide">
        <div class="flex gap-2 px-4 min-w-max">
          <button
            v-for="tag in TAGS"
            :key="tag"
            type="button"
            :class="[
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeTag === tag
                ? 'bg-sandalwood text-white'
                : 'bg-sandalwood/10 text-sandalwood hover:bg-sandalwood/20'
            ]"
            @click="activeTag = tag"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      <!-- 加载与错误 -->
      <div v-if="loading" class="text-center py-16 text-sandalwood/70">加载中…</div>
      <div v-else-if="error" class="text-center py-16 text-cinnabar">加载失败，请重试</div>

      <!-- 瀑布流：手机 2 列，桌面 4 列 -->
      <div v-else class="masonry-columns">
        <div
          v-for="herb in filteredHerbs"
          :key="herb.id"
          class="masonry-item"
        >
          <HerbCard :herb="herb" />
        </div>
      </div>

      <div
        v-if="!loading && !error && filteredHerbs.length === 0"
        class="text-center py-16 text-sandalwood/60"
      >
        暂无匹配的药材
      </div>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
/* 瀑布流：列布局，手机 2 列，桌面 4 列 */
.masonry-columns {
  column-count: 2;
  column-gap: 1rem;
}
@media (min-width: 768px) {
  .masonry-columns {
    column-count: 4;
  }
}
.masonry-item {
  break-inside: avoid;
  margin-bottom: 1rem;
}
</style>
