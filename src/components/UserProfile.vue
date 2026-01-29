<script setup>
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits(['close'])
const { user, profile, updateProfile, handleLogout } = useAuth()

const username = ref('')
const bio = ref('')
const saving = ref(false)
const saveError = ref('')

watch(
  profile,
  (p) => {
    username.value = p?.username ?? ''
    bio.value = p?.bio ?? ''
  },
  { immediate: true }
)

async function save() {
  saveError.value = ''
  saving.value = true
  const res = await updateProfile({ username: username.value.trim(), bio: bio.value.trim() })
  saving.value = false
  if (!res.ok) {
    saveError.value = res.error?.message ?? '保存失败'
    return
  }
}

async function logout() {
  await handleLogout()
  emit('close')
}
</script>

<template>
  <div class="user-profile-overlay">
    <div
      class="user-profile-backdrop"
      aria-hidden="true"
      @click="emit('close')"
    />
    <div class="user-profile-modal">
      <div class="user-profile-header">
        <h2 class="user-profile-title">个人中心</h2>
        <button
          type="button"
          class="user-profile-close"
          aria-label="关闭"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div v-if="user" class="user-profile-body">
        <p class="user-profile-email">{{ user.email }}</p>

        <label class="user-profile-label">用户名</label>
        <input
          v-model="username"
          type="text"
          class="user-profile-input"
          placeholder="请输入用户名"
        />

        <label class="user-profile-label">个人简介</label>
        <textarea
          v-model="bio"
          class="user-profile-textarea"
          placeholder="请输入个人简介"
          rows="4"
        />

        <p v-if="saveError" class="user-profile-error">{{ saveError }}</p>

        <div class="user-profile-actions">
          <button
            type="button"
            class="user-profile-btn user-profile-btn-primary"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? '保存中…' : '保存修改' }}
          </button>
          <button
            type="button"
            class="user-profile-btn user-profile-btn-outline"
            @click="logout"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.user-profile-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.user-profile-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  background: #FDFBF7;
  border: 1px solid rgba(139, 90, 43, 0.15);
  border-radius: 1rem;
  box-shadow: 0 12px 40px rgba(139, 90, 43, 0.15);
}

.user-profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(139, 90, 43, 0.1);
}

.user-profile-title {
  margin: 0;
  font-family: 'Noto Serif SC', SimSun, 宋体, serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: #8B5A2B;
}

.user-profile-close {
  padding: 0.25rem;
  color: rgba(139, 90, 43, 0.6);
  background: none;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.user-profile-close:hover {
  color: #8B5A2B;
  background: rgba(139, 90, 43, 0.08);
}

.user-profile-body {
  padding: 1.25rem;
}

.user-profile-email {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  color: rgba(139, 90, 43, 0.6);
}

.user-profile-label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #8B5A2B;
}

.user-profile-input,
.user-profile-textarea {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem 0.75rem;
  font-family: inherit;
  font-size: 0.9375rem;
  color: #5c3317;
  background: #fff;
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.user-profile-textarea {
  resize: vertical;
  min-height: 4.5rem;
}

.user-profile-input:focus,
.user-profile-textarea:focus {
  border-color: #8B5A2B;
  box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.12);
}

.user-profile-error {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  color: #C44E46;
}

.user-profile-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.user-profile-btn {
  flex: 1;
  padding: 0.625rem 1rem;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s, color 0.2s;
}

.user-profile-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.user-profile-btn-primary {
  color: #fff;
  background: #8B5A2B;
  border: none;
}

.user-profile-btn-primary:hover:not(:disabled) {
  background: #7a4f26;
}

.user-profile-btn-outline {
  color: #8B5A2B;
  background: transparent;
  border: 1px solid rgba(139, 90, 43, 0.3);
}

.user-profile-btn-outline:hover {
  background: rgba(139, 90, 43, 0.08);
}
</style>
