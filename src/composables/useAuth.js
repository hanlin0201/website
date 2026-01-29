/**
 * 门禁、会话与个人资料（useAuth）
 * - user / profile 状态
 * - 登录 / 注册 / 登出 / 游客 / profiles 读写
 * - 隐形埋点 logUserHistory
 */

import { ref, computed } from 'vue'
import { supabase } from '@/supabaseClient'
import * as auth from '@/auth'

const user = ref(null)
const profile = ref(null)
const isGuest = ref(false)

export function useAuth() {
  const gatePassed = computed(() => isGuest.value || !!user.value)

  async function handleLogin(email, password) {
    const res = await auth.handleLogin(email, password)
    if (res.ok && res.user) {
      user.value = res.user
      isGuest.value = false
      await fetchProfile()
    }
    return res
  }

  async function handleRegister(email, password) {
    const res = await auth.handleRegister(email, password)
    if (res.ok && res.user) {
      user.value = res.user
      isGuest.value = false
      await fetchProfile()
    }
    return res
  }

  async function fetchProfile() {
    if (!user.value?.id) return
    const { data } = await supabase
      .from('profiles')
      .select('username, bio, avatar_url')
      .eq('id', user.value.id)
      .maybeSingle()
    profile.value = data
      ? { username: data.username ?? '', bio: data.bio ?? '', avatar_url: data.avatar_url ?? '' }
      : { username: '', bio: '', avatar_url: '' }
  }

  async function updateProfile(updates) {
    if (!user.value?.id) return { ok: false }
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.value.id, ...updates }, { onConflict: 'id' })
    if (error) return { ok: false, error }
    await fetchProfile()
    return { ok: true }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
    isGuest.value = true
  }

  function setGuestMode() {
    user.value = null
    profile.value = null
    isGuest.value = true
  }

  function logUserHistory(content) {
    if (!user.value?.id) return
    auth.logUserHistory(user.value.id, content)
  }

  return {
    user,
    profile,
    isGuest,
    gatePassed,
    handleLogin,
    handleRegister,
    fetchProfile,
    updateProfile,
    handleLogout,
    setGuestMode,
    logUserHistory,
  }
}
