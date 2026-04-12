const normalizeBasePath = (value: string | undefined) => {
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

export const getBasePath = () => normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)

export const withBasePath = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const basePath = getBasePath()
  return basePath ? `${basePath}${normalizedPath}` : normalizedPath
}
