<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { signIn } from '~/composables/auth'
import { getLogtoRedirectUris } from '~/config/logto'

/**
 * Login page component
 * Provides Logto-powered authentication
 *
 * This page redirects users to Logto's sign-in page.
 * After successful authentication, users will be redirected back to /callback
 * which will handle the authentication flow and redirect to the intended page.
 */

const loading = ref(false)

/**
 * Handle Logto sign-in
 * Redirects to Logto's authentication page
 */
async function handleLogtoSignIn() {
  loading.value = true

  try {
    const { redirectUri } = getLogtoRedirectUris()
    await signIn(redirectUri)
  }
  catch (error) {
    console.error('Sign in error:', error)
    ElMessage.error('Failed to initiate sign-in. Please try again.')
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>Sign In</h2>
          <p class="subtitle">
            Sign in with Logto to access protected pages
          </p>
        </div>
      </template>

      <div class="login-content">
        <el-button
          type="primary"
          :loading="loading"
          size="large"
          style="width: 100%"
          @click="handleLogtoSignIn"
        >
          {{ loading ? 'Redirecting...' : 'Sign in with Logto' }}
        </el-button>
      </div>

      <el-divider />

      <div class="info-section">
        <el-alert
          title="Logto Authentication"
          type="info"
          :closable="false"
          show-icon
        >
          <p>This application uses Logto for secure authentication.</p>
          <p>Click the button above to sign in with your Logto account.</p>
        </el-alert>

        <div class="setup-info">
          <h4>For Developers:</h4>
          <p>To set up Logto authentication:</p>
          <ol>
            <li>Create a Logto account at <a href="https://logto.io" target="_blank">logto.io</a></li>
            <li>Create a new application in the Logto Console</li>
            <li>Copy <code>.env.example</code> to <code>.env</code></li>
            <li>Fill in your Logto endpoint and app ID</li>
            <li>Configure redirect URIs in your Logto app settings</li>
          </ol>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 500px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: var(--ep-text-color-primary);
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--ep-text-color-secondary);
}

.login-content {
  padding: 20px 0;
}

.info-section {
  margin-top: 16px;
}

.info-section p {
  margin: 4px 0;
  font-size: 13px;
}

.setup-info {
  margin-top: 20px;
  padding: 16px;
  background-color: var(--ep-fill-color-light);
  border-radius: 4px;
}

.setup-info h4 {
  margin: 0 0 12px 0;
  color: var(--ep-text-color-primary);
}

.setup-info p {
  margin: 8px 0;
  font-size: 13px;
}

.setup-info ol {
  margin: 8px 0;
  padding-left: 20px;
}

.setup-info li {
  margin: 6px 0;
  font-size: 13px;
}

.setup-info a {
  color: var(--ep-color-primary);
  text-decoration: none;
}

.setup-info a:hover {
  text-decoration: underline;
}

.setup-info code {
  padding: 2px 6px;
  background-color: var(--ep-fill-color);
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}
</style>
