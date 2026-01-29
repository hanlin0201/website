<script setup>
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const props = defineProps({ dismissible: { type: Boolean, default: false } })
const emit = defineEmits(['close'])

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const isRegister = ref(false)

const { handleLogin, handleRegister, setGuestMode } = useAuth()

const canSubmit = computed(() => !!email.value.trim() && !!password.value)

async function handleSubmit() {
  if (!canSubmit.value || loading.value) return
  errorMsg.value = ''
  loading.value = true
  const res = isRegister.value
    ? await handleRegister(email.value.trim(), password.value)
    : await handleLogin(email.value.trim(), password.value)
  loading.value = false
  if (res.ok) {
    emit('close')
    return
  }
  errorMsg.value = res.error?.message || (isRegister.value ? '注册失败，请重试' : '登录失败，请重试')
}

function handleGuest() {
  setGuestMode()
  emit('close')
}
</script>

<template>
  <div id="login-overlay" class="login-overlay">
    <div
      class="login-overlay-backdrop"
      aria-hidden="true"
      @click="dismissible && $emit('close')"
    />
    <div class="login-overlay-card">
      <div class="login-overlay-card-head">
        <h2 class="login-overlay-title">欢迎使用 · 中药材百科</h2>
        <button
          v-if="dismissible"
          type="button"
          class="login-overlay-close"
          aria-label="关闭"
          @click="$emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      <p class="login-overlay-desc">登录后可同步您的咨询记录</p>

      <div class="login-overlay-toggle">
        <button
          type="button"
          :class="['login-overlay-tab', { active: !isRegister }]"
          @click="isRegister = false; errorMsg = ''"
        >
          登录
        </button>
        <button
          type="button"
          :class="['login-overlay-tab', { active: isRegister }]"
          @click="isRegister = true; errorMsg = ''"
        >
          注册
        </button>
      </div>

      <form class="login-overlay-form" @submit.prevent="handleSubmit">
        <input
          v-model="email"
          type="email"
          placeholder="邮箱"
          class="login-overlay-input"
          autocomplete="email"
        />
        <input
          v-model="password"
          type="password"
          placeholder="密码"
          class="login-overlay-input"
          :autocomplete="isRegister ? 'new-password' : 'current-password'"
        />
        <p v-if="errorMsg" class="login-overlay-error">{{ errorMsg }}</p>
        <button
          type="submit"
          class="login-overlay-btn-primary"
          :disabled="!canSubmit || loading"
        >
          {{ loading ? '处理中…' : (isRegister ? '注册' : '登录') }}
        </button>
      </form>

      <button type="button" class="login-overlay-guest" @click="handleGuest">
        以游客身份试用 (Guest Mode)
      </button>
    </div>
  </div>
</template>
