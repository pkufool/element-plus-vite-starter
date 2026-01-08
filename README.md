# element-plus-vite-starter

> A starter kit for Element Plus with Vite

- Preview: <https://vite-starter.element-plus.org>

This is an example of on-demand element-plus with [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components).

> If you want to import all, it may be so simple that no examples are needed. Just follow [quickstart | Docs](https://element-plus.org/zh-CN/guide/quickstart.html) and import them.

If you just want an on-demand import example `manually`, you can check [unplugin-element-plus/examples/vite](https://github.com/element-plus/unplugin-element-plus/tree/main/examples/vite).

If you want to a nuxt starter, see [element-plus-nuxt-starter](https://github.com/element-plus/element-plus-nuxt-starter/).

## Features

- ⚡️ [Vite](https://vitejs.dev/) - Lightning-fast build tool
- 🎨 [Element Plus](https://element-plus.org/) - Vue 3 UI library
- 🔐 **JWT Authentication** - Token-based authentication with route guards
- 🛡️ **Permission Control** - Protect routes and restrict access to authenticated users
- 📦 On-demand component loading
- 🎯 TypeScript support
- 🌓 Dark mode support

## Project setup

```bash
pnpm install

# npm install
# yarn install
```

### Compiles and hot-reloads for development

```bash
npm run dev
```

### Compiles and minifies for production

```bash
npm run build
```

## Usage

```bash
git clone https://github.com/element-plus/element-plus-vite-starter
cd element-plus-vite-starter
npm i
npm run dev
```

### Custom theme

See `src/styles/element/index.scss`.

## JWT Authentication & Permission Control

This starter template includes a complete JWT-based authentication system with route guards for protecting pages.

### Overview

The authentication system provides:

- JWT token validation and management
- Protected routes with automatic redirection
- Login/logout functionality
- User session persistence via localStorage
- Router guards for access control

### Quick Start

1. **Login to the application:**
   - Navigate to `/login`
   - Enter any username and password (demo mode)
   - A mock JWT token will be generated and stored

2. **Access protected pages:**
   - Visit `/dashboard` to see a protected page
   - Try visiting `/nav/4` which is also protected
   - Without authentication, you'll be redirected to login

3. **Logout:**
   - Click on your username in the header
   - Select "Logout" from the dropdown menu

### Architecture

#### Authentication Files

- **`src/composables/auth.ts`** - Core authentication logic
  - JWT token validation
  - Token storage/retrieval from localStorage
  - `useAuth()` composable for components

- **`src/modules/router-guard.ts`** - Route protection middleware
  - Global navigation guard
  - Checks `meta.requiresAuth` on routes
  - Redirects unauthenticated users to login

- **`src/pages/login.vue`** - Login page component
  - Login form UI
  - Mock JWT token generation (for demo)
  - Credential submission handler

#### Protecting Routes

To protect a route, add a `<route>` block with meta configuration:

```vue
<template>
  <div>Your protected content</div>
</template>

<route lang="yaml">
meta:
  requiresAuth: true
</route>
```

See examples in:

- `src/pages/dashboard.vue`
- `src/pages/nav/4.vue`

### Backend Integration

The frontend is ready to integrate with your backend API. Here's how to connect it:

#### 1. Replace Mock Token Generation

In `src/pages/login.vue`, replace the `generateMockToken()` function with a real API call:

```typescript
async function handleLogin() {
  loading.value = true
  try {
    // Call your backend API
    const response = await fetch('https://your-api.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: loginForm.value.username,
        password: loginForm.value.password,
      }),
    })

    const data = await response.json()

    if (data.token) {
      // Store the JWT token from backend
      const success = login(data.token)

      if (success) {
        ElMessage.success('Login successful!')
        const redirect = router.currentRoute.value.query.redirect as string
        await router.push(redirect || '/')
      }
    }
    else {
      ElMessage.error('Invalid credentials')
    }
  }
  catch (error) {
    ElMessage.error('Login failed. Please try again.')
  }
  finally {
    loading.value = false
  }
}
```

#### 2. Backend Requirements

Your backend should provide an authentication endpoint that:

1. **Accepts credentials** (username, password)
2. **Validates the credentials**
3. **Returns a JWT token** on success

Example response format:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### 3. JWT Token Structure

Your backend should generate JWT tokens with these recommended claims:

```json
{
  "sub": "user_id", // Subject (user identifier)
  "email": "user@example.com", // User email
  "role": "user", // User role (for authorization)
  "iat": 1516239022, // Issued at timestamp
  "exp": 1516242622 // Expiration timestamp (required)
}
```

#### 4. Securing API Requests

To send authenticated requests to your backend:

```typescript
import { getToken } from '~/composables/auth'

// Example API call with JWT token
async function fetchProtectedData() {
  const token = getToken()

  const response = await fetch('https://your-api.com/protected-endpoint', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  return response.json()
}
```

#### 5. Token Refresh (Optional)

For long-lived sessions, implement token refresh:

```typescript
// In your API interceptor or auth composable
async function refreshToken() {
  const currentToken = getToken()

  const response = await fetch('https://your-api.com/auth/refresh', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${currentToken}`,
    },
  })

  const data = await response.json()
  if (data.token) {
    login(data.token) // Update with new token
  }
}
```

### Security Considerations

1. **Token Storage**: Currently uses localStorage. Consider these alternatives:
   - httpOnly cookies (more secure, requires backend support)
   - sessionStorage (for single-tab sessions)

2. **HTTPS Only**: Always use HTTPS in production to prevent token interception

3. **Token Expiration**: Set reasonable expiration times (e.g., 1-24 hours)

4. **Refresh Tokens**: Implement refresh tokens for better UX and security

5. **CSRF Protection**: If using cookies, implement CSRF tokens

6. **Secret Key**: Your backend must use a strong secret key for signing JWTs

### API Integration Example

Here's a complete example of integrating with a real backend:

```typescript
// src/api/auth.ts
import { logout as clearToken, login as storeToken } from '~/composables/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.example.com'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    role: string
  }
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  return response.json()
}

export async function logoutUser(): Promise<void> {
  // Optional: notify backend of logout
  const token = getToken()
  if (token) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  clearToken()
}
```

### Customization

#### Extend JWT Payload

Update the `JWTPayload` interface in `src/composables/auth.ts`:

```typescript
interface JWTPayload {
  sub?: string
  exp?: number
  iat?: number
  email?: string
  role?: string
  // Add your custom claims:
  permissions?: string[]
  organization?: string
  [key: string]: any
}
```

#### Add Role-Based Access Control

Extend the router guard in `src/modules/router-guard.ts`:

```typescript
router.beforeEach((to, _from, next) => {
  const requiresAuth = to.meta.requiresAuth as boolean
  const requiredRole = to.meta.role as string

  if (requiresAuth) {
    const token = getToken()
    if (!token || !isTokenValid(token)) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    // Check role if specified
    if (requiredRole) {
      const decoded = getDecodedToken()
      if (decoded?.role !== requiredRole) {
        next({ path: '/forbidden' })
        return
      }
    }
  }

  next()
})
```

Then use it in route definitions:

```vue
<route lang="yaml">
meta:
  requiresAuth: true
  role: admin
</route>
```

### Troubleshooting

**Issue**: "Invalid token" error on page refresh

- **Solution**: Ensure token expiration is set properly. Check browser localStorage for the `auth_token` key.

**Issue**: Redirected to login when token should be valid

- **Solution**: Verify token expiration timestamp. Check browser console for validation errors.

**Issue**: Can't access protected routes

- **Solution**: Make sure you're logged in and the route has `meta: { requiresAuth: true }` in its route block.

### Demo Credentials

In demo mode (without backend):

- **Username**: Any value
- **Password**: Any value

The system will generate a mock JWT token valid for 24 hours.
