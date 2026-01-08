<script setup lang="ts">
/**
 * Protected Navigation Page Example
 * This page is protected and requires authentication to access
 */
</script>

<template>
  <div class="protected-page">
    <el-card>
      <template #header>
        <h2>Navigation 4 - Protected</h2>
      </template>

      <el-alert
        title="Protected Route"
        type="warning"
        :closable="false"
        show-icon
      >
        <p>This is a protected navigation page.</p>
        <p>You can only access it when logged in.</p>
      </el-alert>

      <div style="margin-top: 20px;">
        <p>This demonstrates how to protect existing pages by adding the route meta configuration.</p>
      </div>
    </el-card>
  </div>
</template>

<route lang="yaml">
meta:
  requiresAuth: true
</route>

<style scoped>
.protected-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.protected-page h2 {
  margin: 0;
}

.protected-page p {
  margin: 4px 0;
  line-height: 1.6;
}
</style>
