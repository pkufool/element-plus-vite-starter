import type { UserModule } from '~/types'
import { createLogto } from '@logto/vue'
import { setLogtoClient } from '~/composables/auth'
import { getLogtoConfig } from '~/config/logto'

/**
 * Logto Vue plugin module
 * Initializes the Logto SDK and makes it available throughout the app
 */
export const install: UserModule = ({ app }) => {
  const config = getLogtoConfig()

  // Only initialize if configuration is available
  if (!config.endpoint || !config.appId) {
    console.warn(
      'Logto configuration is missing. Authentication features will not work.',
    )
    console.warn(
      'Please copy .env.example to .env and configure your Logto settings.',
    )
    return
  }

  // Create Logto instance
  const logto = createLogto(config, {
    // Optional: configure prompt mode
    // 'consent' - always ask for user consent
    // 'login' - always show login page
    prompt: undefined,
  })

  // Install Logto plugin
  app.use(logto)

  // Make Logto client available to the auth composable
  // Note: The client will be available after the plugin is installed
  if (app.config.globalProperties.$logto) {
    setLogtoClient(app.config.globalProperties.$logto)
  }
}
