<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { User } from 'lucide-vue-next'
import AiCompanion from '@/components/AiCompanion.vue'
import LoginOverlay from '@/components/LoginOverlay.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, gatePassed } = useAuth()

const forceShowLogin = ref(false)
const showLoginOverlay = computed(() => !gatePassed.value || forceShowLogin.value)

function openAuthPanel() {
  if (user.value) {
    router.push('/profile')
  } else {
    forceShowLogin.value = true
  }
}
</script>

<template>
  <div class="min-h-screen bg-paper">
    <RouterView />
    <AiCompanion />

    <!-- 门禁 / 从头像打开的登录 -->
    <LoginOverlay
      v-if="showLoginOverlay"
      :dismissible="gatePassed"
      @close="forceShowLogin = false"
    />

    <!-- 右上角头像入口：已过门禁后显示，已登录跳转 /profile，未登录打开登录遮罩 -->
    <button
      v-if="gatePassed"
      type="button"
      class="fixed top-4 right-4 z-[9998] flex h-10 w-10 items-center justify-center rounded-full bg-sandalwood/10 text-sandalwood border border-sandalwood/20 hover:bg-sandalwood/15 transition-colors"
      aria-label="用户"
      @click="openAuthPanel"
    >
      <User class="h-5 w-5" />
    </button>
  </div>
</template>
