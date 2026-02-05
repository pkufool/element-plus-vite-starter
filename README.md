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
- 🔐 **Logto Authentication** - Modern OAuth 2.0 and OIDC authentication service
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

## Logto Authentication Integration

This starter template now includes **Logto** authentication - a modern, developer-friendly authentication service that handles OAuth 2.0, OpenID Connect (OIDC), and provides comprehensive user management.

### Features

- 🔐 **Secure Authentication** - OAuth 2.0 and OIDC flows handled by Logto
- 🚀 **Easy Setup** - Just configure environment variables and you're ready
- 👤 **User Management** - Built-in user profiles, social logins, and more
- 🔑 **JWT Tokens** - Industry-standard token-based authentication
- 🛡️ **Protected Routes** - Router guards automatically check authentication
- 📱 **Multi-Platform** - Works for web, mobile, and more

### Quick Start with Logto

#### 1. Create a Logto Account

1. Visit [Logto.io](https://logto.io/) and sign up for free
2. Create a new application in the Logto Console
3. Choose "Traditional Web App" as the application type
4. Get your **Endpoint** and **App ID** from the application settings

#### 2. Configure Environment Variables

Copy the example environment file and fill in your Logto credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Logto credentials:

```env
# Your Logto endpoint (from Logto Console)
VITE_LOGTO_ENDPOINT=https://your-app.logto.app

# Your Logto application ID (from Logto Console)
VITE_LOGTO_APP_ID=your-app-id

# Redirect URI after successful authentication
VITE_LOGTO_REDIRECT_URI=http://localhost:5173/callback

# URI to redirect after logout
VITE_LOGTO_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
```

#### 3. Configure Redirect URIs in Logto

In your Logto application settings, add these redirect URIs:

**Sign-in redirect URIs:**

- Development: `http://localhost:5173/callback`
- Production: `https://yourdomain.com/callback`

**Post sign-out redirect URIs:**

- Development: `http://localhost:5173`
- Production: `https://yourdomain.com`

#### 4. Run the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and click "Sign In" to test Logto authentication!

### How It Works

#### Authentication Flow

1. **User clicks "Sign In"** → Redirects to Logto's authentication page
2. **User authenticates** → Logto validates credentials (or social login)
3. **Redirect to callback** → Logto redirects back to `/callback` with authorization code
4. **Handle callback** → App exchanges code for tokens and creates session
5. **Access protected routes** → User can now access protected pages

#### Architecture

**Key Files:**

- **`src/config/logto.ts`** - Logto configuration and environment variables
- **`src/composables/auth.ts`** - Authentication composable with Logto integration
- **`src/modules/logto.ts`** - Logto Vue plugin initialization
- **`src/modules/router-guard.ts`** - Router guard for protected routes
- **`src/pages/login.vue`** - Sign-in page with Logto redirect
- **`src/pages/callback.vue`** - Handles OAuth callback from Logto

#### Protecting Routes

To protect a route, add `meta: { requiresAuth: true }`:

```vue
<template>
  <div>Your protected content</div>
</template>

<route lang="yaml">
meta:
  requiresAuth: true
</route>
```

Examples:

- `src/pages/dashboard.vue` - Protected dashboard
- `src/pages/nav/4.vue` - Protected navigation page

#### Using Authentication in Components

```vue
<script setup lang="ts">
import { useAuth } from '~/composables'

const { isAuthenticated, signIn, signOut, getUserInfo } = useAuth()

// Get user information
const userInfo = await getUserInfo()
console.log(userInfo) // { sub, username, email, name, picture, ... }
</script>
```

### Advanced Configuration

#### Custom Scopes

Add custom scopes in `src/config/logto.ts`:

```typescript
export function getLogtoConfig(): LogtoConfig {
  return {
    endpoint: import.meta.env.VITE_LOGTO_ENDPOINT || '',
    appId: import.meta.env.VITE_LOGTO_APP_ID || '',
    scopes: [
      'openid',
      'profile',
      'email',
      'offline_access',
      'custom_scope', // Add your custom scopes
    ],
  }
}
```

#### Role-Based Access Control

Extend the router guard in `src/modules/router-guard.ts`:

```typescript
router.beforeEach(async (to, _from, next) => {
  const requiresAuth = to.meta.requiresAuth as boolean
  const requiredRole = to.meta.role as string

  if (requiresAuth) {
    const logtoClient = getLogtoClient()
    const isAuthenticated = await logtoClient.isAuthenticated()

    if (!isAuthenticated) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    // Check role if specified
    if (requiredRole) {
      const userInfo = await logtoClient.fetchUserInfo()
      if (userInfo.role !== requiredRole) {
        next({ path: '/forbidden' })
        return
      }
    }
  }

  next()
})
```

Then use it in routes:

```vue
<route lang="yaml">
meta:
  requiresAuth: true
  role: admin
</route>
```

#### API Requests with Access Token

```typescript
import { useAuth } from '~/composables'

const { getToken } = useAuth()

async function fetchProtectedData() {
  const accessToken = getToken()

  const response = await fetch('https://your-api.com/protected', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  return response.json()
}
```

### Production Deployment

#### Environment Variables

Update your production environment variables:

```env
VITE_LOGTO_ENDPOINT=https://your-production-app.logto.app
VITE_LOGTO_APP_ID=your-production-app-id
VITE_LOGTO_REDIRECT_URI=https://yourdomain.com/callback
VITE_LOGTO_POST_LOGOUT_REDIRECT_URI=https://yourdomain.com
```

#### Configure Redirect URIs

Add your production domain to Logto's redirect URI settings in the Console.

#### CORS Configuration

If your API is on a different domain, configure CORS in your backend to allow:

- `Origin`: Your frontend domain
- `Access-Control-Allow-Credentials`: true

### Troubleshooting

**Issue**: "Logto configuration is missing"

- **Solution**: Make sure `.env` file exists with correct values
- **Solution**: Restart dev server after changing `.env` file

**Issue**: "Redirect URI mismatch"

- **Solution**: Add the exact redirect URI to Logto Console (including protocol, domain, and path)
- **Solution**: Check that `VITE_LOGTO_REDIRECT_URI` matches the configured URI

**Issue**: Authentication works locally but not in production

- **Solution**: Update production environment variables
- **Solution**: Add production redirect URIs to Logto Console
- **Solution**: Ensure HTTPS is enabled in production

**Issue**: User info is empty or null

- **Solution**: Request additional scopes in `src/config/logto.ts`
- **Solution**: Check that scopes are configured in Logto Console

### Resources

- [Logto Documentation](https://docs.logto.io/)
- [Logto Vue SDK](https://docs.logto.io/docs/recipes/integrate-logto/vue/)
- [Logto Console](https://console.logto.io/)
- [OAuth 2.0 Explained](https://oauth.net/2/)
- [OpenID Connect](https://openid.net/connect/)
