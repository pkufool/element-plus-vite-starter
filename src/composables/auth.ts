import type { LogtoClient } from '@logto/vue'
import { jwtDecode } from 'jwt-decode'
import { computed, ref } from 'vue'

/**
 * Authentication composable for managing user authentication state
 * Now integrated with Logto authentication service
 */

const TOKEN_KEY = 'logto_access_token'
const ID_TOKEN_KEY = 'logto_id_token'

// Reactive authentication state
const token = ref<string | null>(null)
const idToken = ref<string | null>(null)
const isAuthenticated = computed(() => !!token.value)

// Logto client instance (will be set when Logto is initialized)
let logtoClient: LogtoClient | null = null

/**
 * Interface representing the decoded JWT payload
 * Extend this interface based on your Logto configuration
 */
interface JWTPayload {
  sub?: string // Subject (user ID)
  exp?: number // Expiration timestamp
  iat?: number // Issued at timestamp
  email?: string
  username?: string
  name?: string
  picture?: string
  [key: string]: any
}

/**
 * Set the Logto client instance
 * @param client - The Logto client instance from the plugin
 */
export function setLogtoClient(client: LogtoClient) {
  logtoClient = client
}

/**
 * Get the Logto client instance
 * @returns The Logto client instance or null if not initialized
 */
export function getLogtoClient(): LogtoClient | null {
  return logtoClient
}

/**
 * Initialize auth state from Logto SDK
 * Should be called when the app starts
 */
export async function initAuth() {
  if (!logtoClient) {
    console.warn('Logto client not initialized yet')
    return
  }

  try {
    // Check if user is authenticated via Logto
    const isAuthed = await logtoClient.isAuthenticated()

    if (isAuthed) {
      // Get access token from Logto
      const accessToken = await logtoClient.getAccessToken()
      const idTokenValue = await logtoClient.getIdToken()

      if (accessToken) {
        token.value = accessToken
        localStorage.setItem(TOKEN_KEY, accessToken)
      }

      if (idTokenValue) {
        idToken.value = idTokenValue
        localStorage.setItem(ID_TOKEN_KEY, idTokenValue)
      }
    }
    else {
      // Clear tokens if not authenticated
      token.value = null
      idToken.value = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ID_TOKEN_KEY)
    }
  }
  catch (error) {
    console.error('Error initializing auth:', error)
  }
}

/**
 * Validate JWT token format and expiration
 * @param tokenToValidate - The JWT token string to validate
 * @returns true if token is valid and not expired
 */
export function isTokenValid(tokenToValidate: string): boolean {
  if (!tokenToValidate)
    return false

  try {
    const decoded = jwtDecode<JWTPayload>(tokenToValidate)

    // Check if token has expired
    if (decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000)
      return decoded.exp > currentTime
    }

    // If no expiration, consider it valid (not recommended in production)
    return true
  }
  catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

/**
 * Sign in with Logto
 * Redirects to Logto's sign-in page
 */
export async function signIn(redirectUri?: string) {
  if (!logtoClient) {
    console.error('Logto client not initialized')
    return
  }

  try {
    await logtoClient.signIn(redirectUri || `${window.location.origin}/callback`)
  }
  catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

/**
 * Handle Logto callback after authentication
 * Should be called on the callback page
 */
export async function handleSignInCallback() {
  if (!logtoClient) {
    console.error('Logto client not initialized')
    return false
  }

  try {
    await logtoClient.handleSignInCallback(window.location.href)
    await initAuth()
    return true
  }
  catch (error) {
    console.error('Sign in callback error:', error)
    return false
  }
}

/**
 * Sign out from Logto
 * Clears local state and redirects to Logto's sign-out page
 */
export async function signOut(postLogoutRedirectUri?: string) {
  if (!logtoClient) {
    console.error('Logto client not initialized')
    return
  }

  try {
    // Clear local state
    token.value = null
    idToken.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ID_TOKEN_KEY)

    // Sign out from Logto
    await logtoClient.signOut(postLogoutRedirectUri || window.location.origin)
  }
  catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

/**
 * Legacy login function for backward compatibility
 * @deprecated Use signIn() instead for Logto authentication
 */
export function login(newToken: string) {
  if (isTokenValid(newToken)) {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
    return true
  }
  return false
}

/**
 * Legacy logout function for backward compatibility
 * @deprecated Use signOut() instead for Logto authentication
 */
export function logout() {
  token.value = null
  idToken.value = null
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ID_TOKEN_KEY)
}

/**
 * Get the current access token
 * @returns The current access token or null if not authenticated
 */
export function getToken(): string | null {
  return token.value
}

/**
 * Get the current ID token
 * @returns The current ID token or null if not authenticated
 */
export function getIdToken(): string | null {
  return idToken.value
}

/**
 * Get decoded token payload from access token
 * @returns Decoded JWT payload or null if no valid token
 */
export function getDecodedToken(): JWTPayload | null {
  if (!token.value)
    return null

  try {
    return jwtDecode<JWTPayload>(token.value)
  }
  catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Get decoded ID token payload
 * @returns Decoded ID token payload or null if no valid token
 */
export function getDecodedIdToken(): JWTPayload | null {
  if (!idToken.value)
    return null

  try {
    return jwtDecode<JWTPayload>(idToken.value)
  }
  catch (error) {
    console.error('Error decoding ID token:', error)
    return null
  }
}

/**
 * Get user information from Logto
 * @returns User information or null if not authenticated
 */
export async function getUserInfo() {
  if (!logtoClient) {
    console.error('Logto client not initialized')
    return null
  }

  try {
    const isAuthed = await logtoClient.isAuthenticated()
    if (!isAuthed) {
      return null
    }

    // First try to get user info from Logto's fetchUserInfo
    try {
      const userInfo = await logtoClient.fetchUserInfo()
      return userInfo
    }
    catch {
      // Fallback to decoding ID token if fetchUserInfo fails
      return getDecodedIdToken()
    }
  }
  catch (error) {
    console.error('Error getting user info:', error)
    return null
  }
}

/**
 * Composable for using authentication in components
 * @returns Authentication state and methods
 */
export function useAuth() {
  return {
    token: computed(() => token.value),
    idToken: computed(() => idToken.value),
    isAuthenticated,
    signIn,
    signOut,
    handleSignInCallback,
    getUserInfo,
    getToken,
    getIdToken,
    getDecodedToken,
    getDecodedIdToken,
    // Legacy methods for backward compatibility
    login,
    logout,
  }
}
