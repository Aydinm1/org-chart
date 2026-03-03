import { useEffect, useMemo, useState } from 'react'
import './App.css'
import background from './assets/background.png'
import BoardSection from './components/BoardSection'
import PageFooter from './components/PageFooter'
import PageHeader from './components/PageHeader'
import { fetchAirtablePeopleRecords, getCardsByGroup, type PersonRecord } from './lib/airtablePeople'

interface FellowsViewState {
  sectionTitle: string
  cards: PersonRecord[]
}

function App() {
  const [people, setPeople] = useState<PersonRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fellowsView, setFellowsView] = useState<FellowsViewState | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadCards = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const nextCards = await fetchAirtablePeopleRecords()
        if (!cancelled) {
          setPeople(nextCards)
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

  const peopleById = useMemo(() => {
    return new Map(people.map((person) => [person.id, person]))
  }, [people])

  const cardsByGroup = useMemo(() => {
    return getCardsByGroup(people)
  }, [people])

  const handleShowMore = (id?: string) => {
    if (!id) {
      return
    }

    const selectedPerson = peopleById.get(id)
    if (!selectedPerson) {
      return
    }

    const linkedPeople = selectedPerson.peopleUnderIds
      .map((linkedId) => peopleById.get(linkedId))
      .filter((person): person is PersonRecord => Boolean(person))
      .sort((left, right) => {
        if (left.orderValue === null && right.orderValue === null) {
          return left.name.localeCompare(right.name)
        }

        if (left.orderValue === null) {
          return 1
        }

        if (right.orderValue === null) {
          return -1
        }

        if (left.orderValue !== right.orderValue) {
          return left.orderValue - right.orderValue
        }

        return left.name.localeCompare(right.name)
      })

    const sectionTitleFromLinkedRecords = linkedPeople.find((person) => person.group)?.group
    setFellowsView({
      sectionTitle: sectionTitleFromLinkedRecords || 'Fellows',
      cards: linkedPeople,
    })
  }

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
      {fellowsView ? (
        <>
          <BoardSection
            title={fellowsView.sectionTitle}
            cards={fellowsView.cards}
            showTeamButtons={false}
            leadingAction={(
              <button
                type="button"
                onClick={() => setFellowsView(null)}
                className="rounded-full border border-[#c9a43e] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#173942] hover:bg-[#f7f4ea]"
              >
                Back to Org Chart
              </button>
            )}
          />
          {fellowsView.cards.length === 0 ? (
            <div className="mx-auto w-full max-w-[1800px] px-6 pb-6 text-[#173942]">
              No fellows found in linked records for this person.
            </div>
          ) : null}
        </>
      ) : (
        <>
          <BoardSection
            title="Central Boards"
            cards={cardsByGroup['Central Boards']}
            onShowMore={handleShowMore}
          />
          <BoardSection
            title="Members & Portfolios"
            cards={cardsByGroup['Members & Portfolios']}
            onShowMore={handleShowMore}
          />
          <BoardSection
            title="Adjunct Members"
            cards={cardsByGroup['Adjunct Members']}
            onShowMore={handleShowMore}
          />
        </>
      )}
      <PageFooter />
    </main>
  )
}

export default App
