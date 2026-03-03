import type { ReactNode } from 'react'
import Card, { type CardProps } from './Card'

interface BoardSectionProps {
  title: string
  cards: CardProps[]
  showTeamButtons?: boolean
  onShowMore?: (id?: string) => void
  leadingAction?: ReactNode
}

const BoardSection = ({ title, cards, showTeamButtons = true, onShowMore, leadingAction }: BoardSectionProps) => {
  return (
    <section className="w-full border-t-4 border-[#c9a43e] bg-transparent">
      <div className="mx-auto w-full max-w-[1800px] px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="m-0 text-2xl font-extrabold text-[#173942]">{title}</h2>
          {leadingAction}
        </div>
        <div className="mt-6 rounded-xl border border-[#c9a43e]/45 p-4 bg-transparent">
          <div className="grid grid-cols-1 justify-items-center gap-x-2 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {cards.map((card, index) => (
              <Card
                key={card.id ?? `${title}-${index}`}
                {...card}
                showTeamButton={showTeamButtons}
                onShowMore={onShowMore}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BoardSection
