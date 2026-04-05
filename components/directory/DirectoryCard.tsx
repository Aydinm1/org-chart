import Link from 'next/link'
import type { DirectoryCardViewModel } from '../../lib/directory/types'

interface DirectoryCardProps {
  card: DirectoryCardViewModel
}

const getInitials = (value: string) => {
  const tokens = value
    .split(/[\s()/-]+/)
    .map((token) => token.trim())
    .filter(Boolean)

  if (tokens.length >= 2) {
    return `${tokens[0][0] ?? ''}${tokens[1][0] ?? ''}`.toUpperCase()
  }

  return value.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase()
}

export default function DirectoryCard({ card }: DirectoryCardProps) {
  const isOverviewGroupCard = card.type === 'group'
  const roleText = card.type === 'representative-group'
    ? card.subtitle || 'Representative'
    : isOverviewGroupCard
      ? 'Institution'
      : card.subtitle || 'Member'
  const titleText = card.type === 'representative-group'
    ? card.badge || card.destinationGroupLabel || 'Group'
    : isOverviewGroupCard
      ? card.badge || 'Directory'
      : card.badge || ''
  const actionText = card.destinationGroupId ? 'View directory' : 'View person'
  const imageSrc = card.personId ? `/api/people/${card.personId}/photo` : card.image

  const content = (
    <article className="directory-card w-full max-w-[248px]">
      <div className={`relative flex h-full flex-col rounded-[18px] border-2 border-[var(--color-card-border)] bg-[var(--color-card-bg)] px-4 py-4 shadow-[0_16px_30px_-22px_var(--color-card-shadow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_38px_-24px_var(--color-card-shadow-hover)] ${
        isOverviewGroupCard ? 'min-h-[236px] items-start text-left' : 'min-h-[316px] items-center text-center'
      }`}>
        <div className={`pointer-events-none absolute top-0 h-8 rounded-b-full bg-gradient-to-b from-[var(--color-card-highlight)] to-transparent ${
          isOverviewGroupCard ? 'inset-x-6' : 'inset-x-7'
        }`} />

        <header className={`flex min-h-[40px] ${isOverviewGroupCard ? 'items-start justify-start' : 'items-center justify-center'} w-full`}>
          <p
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
            className="overflow-hidden text-ellipsis text-[0.84rem] font-semibold leading-tight tracking-[0.04em] text-white uppercase"
          >
            {roleText}
          </p>
        </header>

        {card.image ? (
          <div className={`shrink-0 overflow-hidden rounded-full bg-[var(--color-card-avatar-bg)] ring-2 ring-[var(--color-card-avatar-ring)] ${
            isOverviewGroupCard ? 'mt-1.5 h-[60px] w-[60px]' : 'mt-2.5 h-[72px] w-[72px]'
          }`}>
            <img src={imageSrc ?? card.image ?? undefined} alt={card.title} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--color-card-avatar-bg)] font-bold text-[var(--color-card-avatar-text)] ring-2 ring-[var(--color-card-avatar-ring)] ${
            isOverviewGroupCard ? 'mt-1.5 h-[60px] w-[60px] text-[1rem]' : 'mt-2.5 h-[72px] w-[72px] text-xl'
          }`}>
            {getInitials(card.title)}
          </div>
        )}

        <div className={`mt-2.5 ${isOverviewGroupCard ? 'w-full text-left' : 'text-center'}`}>
          {titleText ? <p className="m-0 text-[0.82rem] font-medium text-[var(--color-card-kicker)]">{titleText}</p> : null}
          <p className={`m-0 font-bold leading-tight text-[var(--color-card-title)] ${isOverviewGroupCard ? 'max-w-[13ch] text-[1.26rem]' : 'text-[1.18rem]'}`}>
            {card.title}
          </p>
        </div>

        {card.email || card.phone ? (
          <div className={`mt-2.5 text-[0.87rem] leading-snug text-[var(--color-card-contact)] ${isOverviewGroupCard ? 'w-full text-left' : 'text-center'}`}>
            {card.phone ? <p className="m-0">{card.phone}</p> : null}
            {card.email ? <p className="m-0 break-all">{card.email}</p> : null}
          </div>
        ) : null}

        {isOverviewGroupCard ? (
          <div className="mt-3 w-full border-t border-white/12 pt-2.5">
            <p className="m-0 max-w-[15rem] text-[0.82rem] leading-[1.45] text-[var(--color-card-contact)]/84">
              Leadership, committees, and local directory sections.
            </p>
          </div>
        ) : null}

        <div className={`mt-auto flex min-h-8 w-full items-end pt-2.5 ${isOverviewGroupCard ? 'justify-between' : 'justify-center'}`}>
          {isOverviewGroupCard ? (
            <span className="text-[0.73rem] font-medium tracking-[0.02em] text-[var(--color-card-contact)]/72">
              Institution directory
            </span>
          ) : null}
          {card.destinationGroupId ? (
            <span className="rounded-full bg-[var(--color-card-action-bg)] px-5 py-1.5 text-[10px] font-bold tracking-[0.08em] text-[var(--color-card-action-text)] uppercase transition-all duration-200">
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
    <Link href={`/groups/${card.destinationGroupId}`} prefetch className="block h-full w-full max-w-[248px]">
      {content}
    </Link>
  )
}
