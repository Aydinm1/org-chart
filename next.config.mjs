/** @type {import('next').NextConfig} */
const normalizeBasePath = (value) => {
  if (!value) {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') {
    return ''
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '')
  return withoutTrailingSlash.startsWith('/') ? withoutTrailingSlash : `/${withoutTrailingSlash}`
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)

const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  ...(basePath ? { basePath } : {}),
  ...(process.env.NEXT_OUTPUT_MODE ? { output: process.env.NEXT_OUTPUT_MODE } : {}),
}

export default nextConfig
