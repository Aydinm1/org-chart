'use client'

import { useRouter } from 'next/navigation'

interface DirectoryBackButtonProps {
  fallbackHref: string
  label: string
}

export default function DirectoryBackButton({ fallbackHref, label }: DirectoryBackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(fallbackHref)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="directory-back-button rounded-full px-4 py-2 text-xs font-bold uppercase"
    >
      {label}
    </button>
  )
}
