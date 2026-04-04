import type { DirectoryCardViewModel } from '../../lib/directory/types'
import DirectoryCard from './DirectoryCard'

interface DirectoryCardGridProps {
  cards: DirectoryCardViewModel[]
}

export default function DirectoryCardGrid({ cards }: DirectoryCardGridProps) {
  return (
    <div className="grid grid-cols-1 justify-items-center gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-7 xl:grid-cols-4 2xl:grid-cols-5">
      {cards.map((card) => (
        <DirectoryCard key={card.id} card={card} />
      ))}
    </div>
  )
}
