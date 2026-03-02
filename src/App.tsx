import { useEffect, useMemo, useState } from 'react'
import './App.css'
import background from './assets/background.png'
import BoardSection from './components/BoardSection'
import PageFooter from './components/PageFooter'
import PageHeader from './components/PageHeader'
import { fetchAirtablePeopleCards, getCardsByGroup, type GroupedCard } from './lib/airtablePeople'

function App() {
  const [cards, setCards] = useState<GroupedCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadCards = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const nextCards = await fetchAirtablePeopleCards()
        if (!cancelled) {
          setCards(nextCards)
        }
      } catch (unknownError) {
        if (!cancelled) {
          setError(unknownError instanceof Error ? unknownError.message : 'Failed to load Airtable data.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadCards()

    return () => {
      cancelled = true
    }
  }, [])

  const cardsByGroup = useMemo(() => {
    return getCardsByGroup(cards)
  }, [cards])

  return (
    <main
      className="flex min-h-screen w-full flex-col"
      style={{
        backgroundImage: `url(${background})`,
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left',
        backgroundSize: 'auto',
      }}
    >
      <PageHeader />
      {isLoading ? (
        <div className="mx-auto w-full max-w-[1800px] px-6 py-10 text-[#173942]">Loading Airtable records...</div>
      ) : null}
      {error ? (
        <div className="mx-auto w-full max-w-[1800px] px-6 pb-6 text-red-700">Airtable error: {error}</div>
      ) : null}
      <BoardSection title="Central Boards" cards={cardsByGroup['Central Boards']} />
      <BoardSection title="Members & Portfolios" cards={cardsByGroup['Members & Portfolios']} />
      <BoardSection title="Adjunct Members" cards={cardsByGroup['Adjunct Members']} />
      <PageFooter />
    </main>
  )
}

export default App
