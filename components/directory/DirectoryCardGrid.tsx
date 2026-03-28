import type { DirectoryCardViewModel } from '../../lib/directory/types'
import DirectoryCard from './DirectoryCard'

interface DirectoryCardGridProps {
  cards: DirectoryCardViewModel[]
}

export default function DirectoryCardGrid({ cards }: DirectoryCardGridProps) {
  return (
    <div className="grid grid-cols-1 justify-items-start gap-x-4 gap-y-5 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-6 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-7 xl:grid-cols-5">
      {cards.map((card) => (
        <DirectoryCard key={card.id} card={card} />
      ))}
    </div>
  )
}
