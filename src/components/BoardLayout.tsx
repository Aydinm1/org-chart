import type { ReactNode } from 'react'
import BoardSection, { type BoardCardDensity, type BoardContentAlign } from './BoardSection'
import type { CardProps } from './Card'

export interface BoardLayoutSection {
  key: string
  title: string
  description?: string
  cards: CardProps[]
  showTeamButtons?: boolean
  onShowMore?: (id?: string) => void
  leadingAction?: ReactNode
}

interface BoardLayoutProps {
  sections: BoardLayoutSection[]
  contentAlign?: BoardContentAlign
  cardDensity?: BoardCardDensity
  showDividers?: boolean
}

const boardShellClasses = 'mx-auto w-full max-w-[1780px] px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14'
const boardContentClasses = 'board-surface relative overflow-hidden rounded-[28px] border border-[#decfa9] bg-[#F8F4EA]/92 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12'
const boardDividerClasses = 'mx-auto h-px w-full rounded-full bg-gradient-to-r from-transparent via-[#c9a43e]/65 to-transparent'

const BoardLayout = ({
  sections,
  contentAlign = 'left',
  cardDensity = 'compact',
  showDividers = true,
}: BoardLayoutProps) => {
  return (
    <div className={boardShellClasses}>
      <div className={boardContentClasses}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#fff7e6]/75 to-transparent" />
        <div className="relative space-y-12 sm:space-y-14">
          {sections.map((section, index) => (
            <div key={section.key}>
              <BoardSection
                title={section.title}
                description={section.description}
                cards={section.cards}
                showTeamButtons={section.showTeamButtons}
                onShowMore={section.onShowMore}
                leadingAction={section.leadingAction}
                contentAlign={contentAlign}
                cardDensity={cardDensity}
              />
              {showDividers && index < sections.length - 1 ? (
                <div className={`mt-12 ${boardDividerClasses}`} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BoardLayout
