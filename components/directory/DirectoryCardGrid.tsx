import type { DirectoryCardViewModel } from '../../lib/directory/types'
import DirectoryCard from './DirectoryCard'

interface DirectoryCardGridProps {
  cards: DirectoryCardViewModel[]
}

export default function DirectoryCardGrid({ cards }: DirectoryCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <DirectoryCard key={card.id} card={card} />
      ))}
    </div>
  )
}
