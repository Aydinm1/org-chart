import Link from 'next/link'
import type { DirectoryCardViewModel } from '../../lib/directory/types'

interface DirectoryCardProps {
  card: DirectoryCardViewModel
}

export default function DirectoryCard({ card }: DirectoryCardProps) {
  const roleText = card.type === 'representative-group'
    ? card.subtitle || 'Representative'
    : card.type === 'group'
      ? 'Group'
      : card.subtitle || 'Member'
  const titleText = card.type === 'representative-group'
    ? card.badge || card.destinationGroupLabel || 'Group'
    : card.type === 'group'
      ? card.badge || 'Directory Unit'
      : card.badge || ''
  const actionText = card.destinationGroupId ? 'Show Team' : 'View Person'
  const imageSrc = card.personId ? `/api/people/${card.personId}/photo` : card.image

  const content = (
    <article className="directory-card w-[260px] max-w-full">
      <div className="relative flex h-full min-h-[386px] flex-col items-center rounded-[18px] border-2 border-[var(--color-card-border)] bg-[var(--color-card-bg)] px-4 py-5 text-center shadow-[0_16px_30px_-22px_var(--color-card-shadow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_38px_-24px_var(--color-card-shadow-hover)]">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-10 rounded-b-full bg-gradient-to-b from-[var(--color-card-highlight)] to-transparent" />

        <header className="flex min-h-[52px] items-center justify-center">
          <p
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
            className="overflow-hidden text-ellipsis text-[0.98rem] font-semibold leading-tight tracking-[0.04em] text-white uppercase"
          >
            {roleText}
          </p>
        </header>

        {card.image ? (
          <div className="mt-3 h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full bg-[var(--color-card-avatar-bg)] ring-2 ring-[var(--color-card-avatar-ring)]">
            <img src={imageSrc ?? card.image ?? undefined} alt={card.title} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="mt-3 flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full bg-[var(--color-card-avatar-bg)] text-2xl font-bold text-[var(--color-card-avatar-text)] ring-2 ring-[var(--color-card-avatar-ring)]">
            {card.title.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="mt-3 text-center">
          {titleText ? <p className="m-0 text-[0.96rem] font-medium text-[var(--color-card-kicker)]">{titleText}</p> : null}
          <p className="m-0 text-[1.4rem] font-bold leading-tight text-[var(--color-card-title)]">{card.title}</p>
        </div>

        {card.email || card.phone ? (
          <div className="mt-3 text-center text-[0.95rem] leading-snug text-[var(--color-card-contact)]">
          {card.phone ? <p className="m-0">{card.phone}</p> : null}
          {card.email ? <p className="m-0 break-all">{card.email}</p> : null}
          </div>
        ) : null}

        <div className="mt-auto flex min-h-10 w-full items-end justify-center pt-3">
          {card.destinationGroupId ? (
            <span className="rounded-full bg-[var(--color-card-action-bg)] px-6 py-2 text-[11px] font-bold tracking-[0.08em] text-[var(--color-card-action-text)] uppercase transition-all duration-200">
              {actionText}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )

  if (!card.destinationGroupId) {
    return content
  }

  return (
    <Link href={`/groups/${card.destinationGroupId}`} prefetch className="block h-full w-[260px] max-w-full">
      {content}
    </Link>
  )
}
