import Link from 'next/link'

interface DirectoryBackButtonProps {
  fallbackHref: string
  label: string
}

export default function DirectoryBackButton({ fallbackHref, label }: DirectoryBackButtonProps) {
  return (
    <Link
      href={fallbackHref}
      prefetch
      className="directory-back-button rounded-full px-4 py-2 text-xs font-bold uppercase"
    >
      {label}
    </Link>
  )
}
