# vue-tlias-management

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Connect to the Backend

The Axios client sends requests to `/api`. During development, Vite forwards these
requests to `http://localhost:8080` and removes the `/api` prefix. For example,
`/api/depts` is forwarded to `http://localhost:8080/depts`.

To use a backend running at a different address, add a `.env.development.local`
file in the project root:

```env
VITE_API_PROXY_TARGET=http://localhost:8080
```

Replace the URL with the backend's address and restart the Vite dev server.
The request interceptor also forwards the logged-in user's token in the `token`
request header.

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
