<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { handleSignInCallback } from '~/composables/auth'

/**
 * Callback page for handling Logto authentication redirects
 *
 * After successful authentication, Logto redirects users back to this page.
 * This page processes the authentication callback and redirects to the intended destination.
 */

const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // Handle the sign-in callback from Logto
    const success = await handleSignInCallback()

    if (success) {
      ElMessage.success('Successfully signed in!')

      // Get the redirect path from query params (set by router guard)
      const redirectPath = router.currentRoute.value.query.redirect as string

      // Redirect to the intended destination or home page
      setTimeout(() => {
        router.push(redirectPath || '/')
      }, 500)
    }
    else {
      error.value = 'Failed to complete sign-in. Please try again.'
      loading.value = false
    }
  }
  catch (err) {
    console.error('Callback error:', err)
    error.value = 'An error occurred during sign-in. Please try again.'
    loading.value = false
    ElMessage.error('Sign-in failed. Please try again.')
  }
})
</script>

<template>
  <div class="callback-container">
    <el-card class="callback-card" shadow="hover">
      <div v-if="loading" class="callback-content">
        <el-icon class="is-loading" size="48">
          <i-ep-loading />
        </el-icon>
        <h2>Completing sign-in...</h2>
        <p>Please wait while we finish setting up your session.</p>
      </div>

      <div v-else-if="error" class="callback-content">
        <el-result icon="error" title="Sign-in Failed">
          <template #sub-title>
            <p>{{ error }}</p>
          </template>
          <template #extra>
            <el-button type="primary" @click="router.push('/login')">
              Back to Login
            </el-button>
          </template>
        </el-result>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

.callback-card {
  width: 100%;
  max-width: 500px;
}

.callback-content {
  padding: 40px 20px;
  text-align: center;
}

.callback-content h2 {
  margin: 20px 0 10px 0;
  font-size: 24px;
  color: var(--ep-text-color-primary);
}

.callback-content p {
  margin: 0;
  font-size: 14px;
  color: var(--ep-text-color-secondary);
}

.is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
