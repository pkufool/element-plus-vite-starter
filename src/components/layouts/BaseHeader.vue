<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { repository } from '~/../package.json'

import { toggleDark, useAuth } from '~/composables'

const router = useRouter()
const { isAuthenticated, logout, getDecodedToken } = useAuth()

/**
 * Handle user logout
 */
function handleLogout() {
  logout()
  ElMessage.success('Logged out successfully')
  router.push('/login')
}

/**
 * Get username from token
 */
function getUsername(): string {
  const token = getDecodedToken()
  const username = token?.sub || 'User'
  return username || 'U' // Fallback to 'U' if empty
}
</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal" :ellipsis="false" router>
    <el-menu-item index="/">
      <div class="flex items-center justify-center gap-2">
        <div class="text-xl" i-ep-element-plus />
        <span>Element Plus</span>
      </div>
    </el-menu-item>
    <el-sub-menu index="2">
      <template #title>
        Workspace
      </template>
      <el-menu-item index="2-1">
        item one
      </el-menu-item>
      <el-menu-item index="2-2">
        item two
      </el-menu-item>
      <el-menu-item index="2-3">
        item three
      </el-menu-item>
      <el-sub-menu index="2-4">
        <template #title>
          item four
        </template>
        <el-menu-item index="2-4-1">
          item one
        </el-menu-item>
        <el-menu-item index="2-4-2">
          item two
        </el-menu-item>
        <el-menu-item index="2-4-3">
          item three
        </el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-menu-item index="3" disabled>
      Info
    </el-menu-item>
    <el-menu-item index="4">
      Orders
    </el-menu-item>

    <!-- Authentication Menu Items -->
    <el-menu-item v-if="!isAuthenticated" index="/login">
      <el-button type="primary" size="small">
        Login
      </el-button>
    </el-menu-item>

    <el-sub-menu v-else index="auth">
      <template #title>
        <el-space :size="8">
          <el-avatar :size="24" style="background-color: var(--ep-color-primary)">
            {{ getUsername()[0].toUpperCase() }}
          </el-avatar>
          <span>{{ getUsername() }}</span>
        </el-space>
      </template>
      <el-menu-item index="/dashboard">
        Dashboard
      </el-menu-item>
      <el-menu-item @click="handleLogout">
        Logout
      </el-menu-item>
    </el-sub-menu>

    <el-menu-item h="full" @click="toggleDark()">
      <button
        class="w-full cursor-pointer border-none bg-transparent"
        style="height: var(--ep-menu-item-height)"
      >
        <i inline-flex i="dark:ep-moon ep-sunny" />
      </button>
    </el-menu-item>

    <el-menu-item h="full">
      <a class="size-full flex items-center justify-center" :href="repository.url" target="_blank">
        <div i-ri-github-fill />
      </a>
    </el-menu-item>
  </el-menu>
</template>

<style lang="scss">
.el-menu-demo {
  &.ep-menu--horizontal > .ep-menu-item:nth-child(1) {
    margin-right: auto;
  }
}
</style>
