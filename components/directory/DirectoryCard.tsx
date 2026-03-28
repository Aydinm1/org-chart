import Link from 'next/link'
import type { DirectoryCardViewModel } from '../../lib/directory/types'

interface DirectoryCardProps {
  card: DirectoryCardViewModel
}

const cardBodyClasses =
  'directory-card flex h-full min-h-[310px] flex-col rounded-[22px] border border-[#d7c497] bg-[#1f5060] px-5 py-5 text-left shadow-[0_18px_34px_-24px_rgba(9,28,34,0.95)] transition-all duration-200'

export default function DirectoryCard({ card }: DirectoryCardProps) {
  const content = (
    <article
      className={`${cardBodyClasses} ${
        card.destinationGroupId ? 'hover:-translate-y-1 hover:shadow-[0_24px_42px_-24px_rgba(9,28,34,0.95)]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="m-0 text-[0.7rem] font-semibold tracking-[0.2em] text-[#f6e8bf] uppercase">
            {card.type === 'group' ? 'Group' : card.type === 'representative-group' ? 'Representative Group' : 'Person'}
          </p>
          {card.badge ? <p className="mt-2 text-sm font-medium text-[#d8b651]">{card.badge}</p> : null}
        </div>
        {card.destinationGroupId ? (
          <span className="rounded-full border border-white/20 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-white/78 uppercase">
            Open
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-start gap-4">
        {card.image ? (
          <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border border-[#f6e9c7]/35 bg-[#f0e8d8]">
            <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border border-[#f6e9c7]/35 bg-[#2b6679] text-xl font-bold text-[#f4e5b4]">
            {card.title.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="min-w-0">
          {card.subtitle ? <p className="m-0 text-sm font-medium text-[#d8b651]">{card.subtitle}</p> : null}
          <h2 className="mt-1 text-[1.35rem] leading-tight font-bold text-white">{card.title}</h2>
        </div>
      </div>

      {card.email || card.phone ? (
        <div className="mt-5 space-y-1 text-sm leading-relaxed text-white/88">
          {card.phone ? <p className="m-0">{card.phone}</p> : null}
          {card.email ? <p className="m-0 break-all">{card.email}</p> : null}
        </div>
      ) : null}

      {card.destinationGroupId ? (
        <div className="mt-auto pt-6">
          <p className="m-0 text-xs font-semibold tracking-[0.12em] text-[#f5e8c0] uppercase">
            Opens the {card.destinationGroupLabel ?? 'group'} page
          </p>
        </div>
      ) : null}
    </article>
  )

  if (!card.destinationGroupId) {
    return content
  }

  return (
    <Link href={`/groups/${card.destinationGroupId}`} className="block h-full">
      {content}
    </Link>
  )
}
