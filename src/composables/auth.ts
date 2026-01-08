import { jwtDecode } from 'jwt-decode'
import { computed, ref } from 'vue'

/**
 * Authentication composable for managing user authentication state
 * Uses JWT tokens stored in localStorage for session persistence
 */

const TOKEN_KEY = 'auth_token'

// Reactive authentication state
const token = ref<string | null>(null)
const isAuthenticated = computed(() => !!token.value)

/**
 * Interface representing the decoded JWT payload
 * Extend this interface based on your backend's JWT structure
 */
interface JWTPayload {
  sub?: string // Subject (user ID)
  exp?: number // Expiration timestamp
  iat?: number // Issued at timestamp
  email?: string
  role?: string
  [key: string]: any
}

/**
 * Initialize auth state from localStorage
 * Should be called when the app starts
 */
export function initAuth() {
  const storedToken = localStorage.getItem(TOKEN_KEY)
  if (storedToken) {
    // Set token first, then validate
    // This avoids duplicate decoding since isTokenValid will decode it once
    if (isTokenValid(storedToken)) {
      token.value = storedToken
    }
    else {
      // Clear invalid token
      localStorage.removeItem(TOKEN_KEY)
    }
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
 * Login with a JWT token
 * In production, you would call your backend API to get this token
 * @param newToken - The JWT token received from the backend
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
 * Logout and clear authentication state
 */
export function logout() {
  token.value = null
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Get the current JWT token
 * @returns The current token or null if not authenticated
 */
export function getToken(): string | null {
  return token.value
}

/**
 * Get decoded token payload
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
 * Composable for using authentication in components
 * @returns Authentication state and methods
 */
export function useAuth() {
  return {
    token: computed(() => token.value),
    isAuthenticated,
    login,
    logout,
    getToken,
    getDecodedToken,
  }
}
