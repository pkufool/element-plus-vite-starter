import type { UserModule } from '~/types'
import { getToken, initAuth, isTokenValid } from '~/composables/auth'

/**
 * Router guard module for authentication
 * This module sets up navigation guards to protect routes that require authentication
 *
 * Usage in route meta:
 * - Add `meta: { requiresAuth: true }` to any route that should be protected
 * - Unauthenticated users will be redirected to the login page
 */
export const install: UserModule = ({ router }) => {
  // Initialize auth state from localStorage when app starts
  initAuth()

  /**
   * Global navigation guard
   * Checks if the route requires authentication and validates the JWT token
   */
  router.beforeEach((to, _from, next) => {
    // Check if the route requires authentication
    const requiresAuth = to.meta.requiresAuth as boolean

    if (requiresAuth) {
      const token = getToken()

      // Check if user has a valid token
      if (!token || !isTokenValid(token)) {
        // Redirect to login page, save the intended destination
        next({
          path: '/login',
          query: { redirect: to.fullPath },
        })
        return
      }
    }

    // Allow navigation
    next()
  })
}
