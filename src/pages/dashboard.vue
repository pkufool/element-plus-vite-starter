<script setup lang="ts">
import { useAuth } from '~/composables/auth'

/**
 * Protected Dashboard Page
 * This page requires authentication to access
 * See route meta configuration below
 */

const { getDecodedToken } = useAuth()
const userInfo = getDecodedToken()
</script>

<template>
  <div class="dashboard-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>Protected Dashboard</h2>
          <el-tag type="success" size="large">
            Authenticated
          </el-tag>
        </div>
      </template>

      <div class="content">
        <el-alert
          title="Success!"
          type="success"
          :closable="false"
          show-icon
        >
          <p>You have successfully accessed this protected page.</p>
          <p>This page requires JWT authentication to access.</p>
        </el-alert>

        <el-divider />

        <h3>User Information</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Username">
            {{ userInfo?.sub || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="Email">
            {{ userInfo?.email || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="Role">
            {{ userInfo?.role || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="Token Issued At">
            {{ userInfo?.iat ? new Date(userInfo.iat * 1000).toLocaleString() : 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="Token Expires At">
            {{ userInfo?.exp ? new Date(userInfo.exp * 1000).toLocaleString() : 'N/A' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="info-section">
          <h3>Implementation Details</h3>
          <el-space direction="vertical" :size="12" style="width: 100%">
            <el-card shadow="never">
              <template #header>
                <strong>Route Protection</strong>
              </template>
              <p>This route is protected by setting <code>meta: { requiresAuth: true }</code> in the route definition.</p>
            </el-card>

            <el-card shadow="never">
              <template #header>
                <strong>JWT Validation</strong>
              </template>
              <p>The router guard checks for a valid JWT token before allowing access. If the token is missing or expired, users are redirected to the login page.</p>
            </el-card>

            <el-card shadow="never">
              <template #header>
                <strong>Token Storage</strong>
              </template>
              <p>JWT tokens are stored in localStorage and automatically loaded when the app starts.</p>
            </el-card>
          </el-space>
        </div>
      </div>
    </el-card>
  </div>
</template>

<route lang="yaml">
meta:
  requiresAuth: true
</route>

<style scoped>
.dashboard-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
}

.content {
  text-align: left;
}

.content h3 {
  margin-top: 16px;
  margin-bottom: 12px;
  color: var(--ep-text-color-primary);
}

.content p {
  margin: 4px 0;
  line-height: 1.6;
}

.content code {
  padding: 2px 6px;
  background-color: var(--ep-fill-color-light);
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
}

.info-section {
  margin-top: 20px;
}
</style>
