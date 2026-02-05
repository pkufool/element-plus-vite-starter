import type { UserModule } from '~/types'
import { getLogtoClient, initAuth } from '~/composables/auth'

/**
 * Router guard module for authentication
 * This module sets up navigation guards to protect routes that require authentication
 *
 * Usage in route meta:
 * - Add `meta: { requiresAuth: true }` to any route that should be protected
 * - Unauthenticated users will be redirected to the login page
 */
export const install: UserModule = ({ router }) => {
  // Initialize auth state when router is ready
  router.isReady().then(async () => {
    await initAuth()
  })

  /**
   * Global navigation guard
   * Checks if the route requires authentication and validates the user session
   */
  router.beforeEach(async (to, _from, next) => {
    // Skip auth check for callback page
    if (to.path === '/callback') {
      next()
      return
    }

    // Check if the route requires authentication
    const requiresAuth = to.meta.requiresAuth as boolean

    if (requiresAuth) {
      const logtoClient = getLogtoClient()

      if (!logtoClient) {
        console.error('Logto client not initialized')
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }

      try {
        const isAuthenticated = await logtoClient.isAuthenticated()

        if (!isAuthenticated) {
          // Validate redirect parameter to prevent open redirect vulnerabilities
          // Only allow internal paths (starting with /)
          let redirectPath = to.fullPath
          if (!redirectPath.startsWith('/')) {
            redirectPath = '/'
          }

          // Redirect to login page, save the intended destination
          next({
            path: '/login',
            query: { redirect: redirectPath },
          })
          return
        }
      }
      catch (error) {
        console.error('Authentication check error:', error)
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
    }

    // Allow navigation
    next()
  })
}
