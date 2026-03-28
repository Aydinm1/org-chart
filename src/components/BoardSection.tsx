import type { ReactNode } from 'react'
import Card, { type CardProps } from './Card'

export type BoardContentAlign = 'left' | 'center'
export type BoardCardDensity = 'compact' | 'default'

interface BoardSectionProps {
  title: string
  description?: string
  cards: CardProps[]
  showTeamButtons?: boolean
  onShowMore?: (id?: string) => void
  leadingAction?: ReactNode
  contentAlign?: BoardContentAlign
  cardDensity?: BoardCardDensity
}

const BoardSection = ({
  title,
  description,
  cards,
  showTeamButtons = true,
  onShowMore,
  leadingAction,
  contentAlign = 'left',
  cardDensity = 'compact',
}: BoardSectionProps) => {
  const alignmentClass = contentAlign === 'center' ? 'justify-items-center' : 'justify-items-start'
  const densityClass = cardDensity === 'compact'
    ? 'gap-x-4 gap-y-5 sm:gap-x-5 sm:gap-y-6 lg:gap-x-6 lg:gap-y-7'
    : 'gap-x-6 gap-y-7 sm:gap-x-7 sm:gap-y-8'

  return (
    <section className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="m-0 text-2xl font-extrabold tracking-tight text-[#173942]">{title}</h2>
          {description ? (
            <p className="mt-2 mb-0 max-w-4xl text-sm leading-relaxed text-[#173942]/80">{description}</p>
          ) : null}
        </div>
        {leadingAction}
      </div>
      <div className="mt-7">
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 ${alignmentClass} ${densityClass}`}>
          {cards.map((card, index) => (
            <Card
              key={card.id ?? `${title}-${index}`}
              {...card}
              showTeamButton={showTeamButtons ? card.showTeamButton ?? true : false}
              onShowMore={onShowMore}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default BoardSection
