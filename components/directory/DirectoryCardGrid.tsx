import type { DirectoryCardViewModel } from '../../lib/directory/types'
import DirectoryCard from './DirectoryCard'

interface DirectoryCardGridProps {
  cards: DirectoryCardViewModel[]
}

export default function DirectoryCardGrid({ cards }: DirectoryCardGridProps) {
  return (
    <div className="directory-card-grid">
      {cards.map((card) => (
        <DirectoryCard key={card.id} card={card} />
      ))}
    </div>
  )
}
