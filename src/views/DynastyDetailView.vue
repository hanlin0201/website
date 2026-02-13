<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { getDynastyById, getAdjacentDynasties } from '@/constants/dynasties.js'
import DefaultDynastyDetail from '@/components/dynasty/DefaultDynastyDetail.vue'
import ShangguDynastyDetail from '@/components/dynasty/ShangguDynastyDetail.vue'

const route = useRoute()
const router = useRouter()

const dynasty = ref(null)
const adjacent = ref({ prev: null, next: null })
const shangguPageIndex = ref(0)

function loadDynasty(id) {
  dynasty.value = getDynastyById(id)
  adjacent.value = getAdjacentDynasties(id)
  nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}

watch(
  () => route.params.id,
  (newId) => {
    if (newId) loadDynasty(newId)
  },
  { immediate: true }
)

function goBack() {
  // 统一返回首页的历史模块并保持卷轴展开，不回到上一朝代；用 replace 避免历史栈堆积
  router.replace({ path: '/', query: { history: 'open' } })
}

function goToDynasty(id) {
  router.push({ name: 'DynastyDetail', params: { id } })
}
</script>

<template>
  <div v-if="dynasty" class="dynasty-detail" :class="{ 'dynasty-detail--shanggu': dynasty.id === 'shanggu' }">
    <div class="bg-texture"></div>
    <header
      v-show="dynasty.id !== 'shanggu' || shangguPageIndex > 0"
      class="dynasty-header"
    >
      <button class="back-btn" @click="goBack" aria-label="返回">
        <ArrowLeft :size="20" />
      </button>
      <h1 class="header-title">{{ dynasty.name }}</h1>
      <div class="header-placeholder"></div>
    </header>

    <ShangguDynastyDetail
      v-if="dynasty.id === 'shanggu'"
      :dynasty="dynasty"
      :adjacent="adjacent"
      @go-to-dynasty="goToDynasty"
      @page-change="shangguPageIndex = $event"
    />
    <DefaultDynastyDetail
      v-else
      :dynasty="dynasty"
      :adjacent="adjacent"
      @go-to-dynasty="goToDynasty"
    />
  </div>

  <div v-else class="dynasty-not-found">
    <span class="text-3xl">📜</span>
    <p>未找到该朝代的记录</p>
    <button @click="router.push('/')" class="back-link">返回首页</button>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');

.dynasty-detail {
  --primary: #8B5E3C;
  --primary-dark: #5D4037;
  --accent-red: #C44E46;
  --accent-green: #5D7A47;
  --bg: #FDFBF7;
  --card-bg: rgba(255, 255, 255, 0.88);
  --text-main: #2c2c2c;
  --text-secondary: #777;
  --radius: 16px;

  font-family: 'Noto Serif SC', 'SimSun', 宋体, serif;
  min-height: 100vh;
  background: var(--bg);
  position: relative;
  overflow-x: hidden;
}

.bg-texture {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}

.dynasty-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: rgba(253, 251, 247, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(139, 90, 43, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--primary-dark);
  cursor: pointer;
  transition: background 0.2s;
}
.back-btn:hover {
  background: rgba(139, 94, 60, 0.1);
}

.header-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--primary-dark);
  letter-spacing: 3px;
  margin: 0;
}

.header-placeholder {
  width: 36px;
}

.dynasty-detail--shanggu .dynasty-header {
  background: rgba(30, 25, 22, 0.75);
  border-bottom-color: rgba(255,255,255,0.08);
}
.dynasty-detail--shanggu .back-btn { color: rgba(255,255,255,0.9); }
.dynasty-detail--shanggu .back-btn:hover { background: rgba(255,255,255,0.1); }
.dynasty-detail--shanggu .header-title { color: rgba(255,255,255,0.95); }

.dynasty-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 12px;
  font-family: 'Noto Serif SC', serif;
  color: #8B5A2B;
}

.back-link {
  font-size: 0.9rem;
  color: #8B5A2B;
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
</style>
