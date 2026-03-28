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
      className="rounded-full border border-[#c9a43e] bg-[#fffaf0]/80 px-4 py-2 text-xs font-bold tracking-[0.12em] text-[#173942] uppercase shadow-[0_10px_18px_-14px_rgba(9,28,34,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff2d1]"
    >
      {label}
    </button>
  )
}
