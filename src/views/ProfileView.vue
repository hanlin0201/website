<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/supabaseClient'
import HealthTagManager from '@/components/HealthTagManager.vue'

const router = useRouter()
const { user, fetchProfile } = useAuth()

const username = ref('')
const location = ref('')
const bio = ref('')
const avatarUrl = ref('')
const loading = ref(true)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

const DEFAULT_AVATAR = '/placeholder-herb.svg'
const AVATAR_BUCKET = 'avatars'
const avatarInput = ref(null)
const avatarUploading = ref(false)

function triggerAvatarInput() {
  avatarInput.value?.click()
}

async function onAvatarFileChange(e) {
  const file = e.target.files?.[0]
  if (!file || !user.value?.id) return
  if (!file.type.startsWith('image/')) {
    saveError.value = '请选择图片文件'
    return
  }
  saveError.value = ''
  avatarUploading.value = true
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${user.value.id}/avatar.${ext}`
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true })
  avatarUploading.value = false
  e.target.value = ''
  if (uploadError) {
    saveError.value = uploadError.message || '头像上传失败'
    return
  }
  const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  const publicUrl = urlData?.publicUrl
  if (!publicUrl) return
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.value.id)
  if (updateError) {
    saveError.value = updateError.message || '头像保存失败'
    return
  }
  avatarUrl.value = publicUrl
  await fetchProfile()
}

onMounted(async () => {
  if (!user.value?.id) {
    router.replace('/')
    return
  }
  loading.value = true
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.value.id)
    .maybeSingle()
  if (data) {
    username.value = data.username ?? ''
    location.value = data.location ?? ''
    bio.value = data.bio ?? ''
    avatarUrl.value = data.avatar_url ?? ''
  } else {
    await fetchProfile()
    username.value = ''
    location.value = ''
    bio.value = ''
    avatarUrl.value = ''
  }
  loading.value = false
})

async function save() {
  if (!user.value?.id) return
  saveError.value = ''
  saveSuccess.value = false
  saving.value = true
  const { error } = await supabase
    .from('profiles')
    .update({
      username: username.value.trim(),
      location: location.value.trim(),
      bio: bio.value.trim(),
    })
    .eq('id', user.value.id)
  saving.value = false
  if (error) {
    saveError.value = error.message || '保存失败'
    return
  }
  await fetchProfile()
  saveSuccess.value = true
  setTimeout(() => { saveSuccess.value = false }, 2000)
}

function goBack() {
  router.push('/')
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
      <h1 class="font-serif font-semibold text-sandalwood text-lg">个人中心</h1>
    </header>

    <template v-if="loading">
      <div class="flex-1 flex items-center justify-center text-sandalwood/60 gap-3">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sandalwood" />
        <span class="text-sm font-serif">加载中...</span>
      </div>
    </template>

    <template v-else>
      <div class="flex-1 px-4 py-6 max-w-xl mx-auto w-full">
        <!-- 头像：点击选择图片 -->
        <div class="flex justify-center mb-6">
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            class="hidden"
            aria-hidden="true"
            @change="onAvatarFileChange"
          />
          <button
            type="button"
            class="profile-avatar-wrap"
            :disabled="avatarUploading"
            @click="triggerAvatarInput"
          >
            <img
              :src="avatarUrl || DEFAULT_AVATAR"
              :alt="username || '头像'"
              class="profile-avatar-img"
              @error="(e) => (e.target.src = DEFAULT_AVATAR)"
            />
            <span v-if="avatarUploading" class="profile-avatar-loading">上传中…</span>
            <span v-else class="profile-avatar-hint">点击更换</span>
          </button>
        </div>

        <!-- 表单 -->
        <form class="space-y-4" @submit.prevent="save">
          <div>
            <label class="profile-label">昵称 (Username)</label>
            <input
              v-model="username"
              type="text"
              class="profile-input"
              placeholder="请输入昵称"
            />
          </div>
          <div>
            <label class="profile-label">所在地 (Location)</label>
            <input
              v-model="location"
              type="text"
              class="profile-input"
              placeholder="请输入所在地"
            />
          </div>
          <div>
            <label class="profile-label">个人简介 (Bio)</label>
            <textarea
              v-model="bio"
              class="profile-textarea"
              placeholder="请输入个人简介"
              rows="4"
            />
          </div>

          <p v-if="saveError" class="profile-error">{{ saveError }}</p>
          <p v-if="saveSuccess" class="profile-success">保存成功</p>

          <button
            type="submit"
            class="profile-btn"
            :disabled="saving"
          >
            {{ saving ? '保存中…' : 'Save Changes' }}
          </button>
        </form>

        <!-- 健康体质标签管理 -->
        <HealthTagManager />
      </div>
    </template>
  </div>
</template>

<style scoped>
.glass-search {
  background: rgba(253, 251, 247, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(139, 90, 43, 0.12);
}
.wood-overlay {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
}
.profile-label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #8B5A2B;
}
.profile-input,
.profile-textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-family: inherit;
  font-size: 0.9375rem;
  color: #5c3317;
  background: #fff;
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.profile-textarea {
  resize: vertical;
  min-height: 5rem;
}
.profile-input:focus,
.profile-textarea:focus {
  border-color: #8B5A2B;
  box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.12);
}
.profile-error {
  margin: 0;
  font-size: 0.8125rem;
  color: #C44E46;
}
.profile-success {
  margin: 0;
  font-size: 0.875rem;
  color: #5D7A47;
}
.profile-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background: #8B5A2B;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}
.profile-btn:hover:not(:disabled) {
  background: #7a4f26;
}
.profile-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.profile-avatar-wrap {
  position: relative;
  display: block;
  width: 6rem;
  height: 6rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid rgba(139, 90, 43, 0.2);
  background: rgba(139, 90, 43, 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.profile-avatar-wrap:hover:not(:disabled) {
  border-color: rgba(139, 90, 43, 0.4);
  box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.15);
}
.profile-avatar-wrap:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}
.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-avatar-hint,
.profile-avatar-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s;
}
.profile-avatar-wrap:hover .profile-avatar-hint,
.profile-avatar-wrap:hover .profile-avatar-loading,
.profile-avatar-loading {
  opacity: 1;
}
</style>
