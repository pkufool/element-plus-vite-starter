/**
 * Logto Configuration
 *
 * This file contains the configuration for Logto authentication.
 * Make sure to set the environment variables in your .env file.
 *
 * To get started with Logto:
 * 1. Sign up at https://logto.io/
 * 2. Create a new application in the Logto Console
 * 3. Get your endpoint and app ID from the console
 * 4. Set the redirect URIs in your Logto app settings
 * 5. Copy .env.example to .env and fill in your values
 */

export interface LogtoConfig {
  endpoint: string
  appId: string
  resources?: string[]
  scopes?: string[]
}

/**
 * Get Logto configuration from environment variables
 */
export function getLogtoConfig(): LogtoConfig {
  const endpoint = import.meta.env.VITE_LOGTO_ENDPOINT
  const appId = import.meta.env.VITE_LOGTO_APP_ID

  if (!endpoint || !appId) {
    console.error(
      'Logto configuration is missing. Please check your .env file.',
    )
    console.error('Required variables: VITE_LOGTO_ENDPOINT, VITE_LOGTO_APP_ID')
  }

  return {
    endpoint: endpoint || '',
    appId: appId || '',
    // Request OpenID standard scopes and user profile
    scopes: ['openid', 'profile', 'email', 'offline_access'],
  }
}

/**
 * Get redirect URIs from environment variables
 */
export function getLogtoRedirectUris() {
  return {
    redirectUri:
      import.meta.env.VITE_LOGTO_REDIRECT_URI || `${window.location.origin}/callback`,
    postLogoutRedirectUri:
      import.meta.env.VITE_LOGTO_POST_LOGOUT_REDIRECT_URI
        || window.location.origin,
  }
}
