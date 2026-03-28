import { useEffect, useState } from 'react'
import './App.css'
import background from './assets/background.png'
import BoardLayout, { type BoardLayoutSection } from './components/BoardLayout'
import PageFooter from './components/PageFooter'
import PageHeader from './components/PageHeader'
import { buildHomeSections, buildSectionsFromGroupIds, fetchOrgData, type OrgData } from './lib/airtablePeople'

interface TeamViewState {
  sourcePersonName: string
  sections: BoardLayoutSection[]
  hasAnyValidSubgroups: boolean
}

function App() {
  const [orgData, setOrgData] = useState<OrgData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamView, setTeamView] = useState<TeamViewState | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadOrgData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const nextOrgData = await fetchOrgData()
        if (!cancelled) {
          setOrgData(nextOrgData)
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

    void loadOrgData()

    return () => {
      cancelled = true
    }
  }, [])

  const handleShowMore = (id?: string) => {
    if (!id || !orgData) {
      return
    }

    const selectedPerson = orgData.graph.peopleById.get(id)
    if (!selectedPerson) {
      return
    }

    const subgroupSections = buildSectionsFromGroupIds(orgData.graph, selectedPerson.subgroupIds)
    const hasAnyValidSubgroups = selectedPerson.subgroupIds.some((subgroupId) => orgData.graph.groupsById.has(subgroupId))
    const sectionsWithConfig: BoardLayoutSection[] = subgroupSections.map((section) => ({
      ...section,
      showTeamButtons: false,
    }))

    setTeamView({
      sourcePersonName: selectedPerson.name || 'Selected Person',
      sections: sectionsWithConfig,
      hasAnyValidSubgroups,
    })
  }

  const homeSections: BoardLayoutSection[] = orgData
    ? buildHomeSections(orgData.graph, orgData.rootGroupId).map((section) => ({
      ...section,
      onShowMore: handleShowMore,
    }))
    : []

  const isTeamViewActive = Boolean(teamView)
  const teamSections = teamView?.sections ?? []
  const teamSourcePersonName = teamView?.sourcePersonName ?? 'Selected Person'
  const hasAnyValidSubgroups = teamView?.hasAnyValidSubgroups ?? false
  const hasAnyTeamCards = teamSections.some((section) => section.cards.length > 0)
  const noHomeSections = !isLoading && !error && orgData && homeSections.length === 0

  return (
    <main
      className="relative flex min-h-screen w-full flex-col overflow-x-clip"
      style={{
        backgroundColor: '#f0ece1',
        backgroundImage: `radial-gradient(1200px 520px at 8% -8%, rgba(201, 164, 62, 0.2), transparent 60%), radial-gradient(920px 520px at 96% 12%, rgba(23, 57, 66, 0.14), transparent 62%), url(${background})`,
        backgroundRepeat: 'no-repeat, no-repeat, repeat',
        backgroundPosition: 'top left, top right, top left',
        backgroundSize: 'auto, auto, auto',
      }}
    >
      <PageHeader />
      {isLoading ? (
        <div className="mx-auto w-full max-w-[1800px] px-6 py-10 text-[#173942]">Loading Airtable records...</div>
      ) : null}
      {error ? (
        <div className="mx-auto w-full max-w-[1800px] px-6 pb-6 text-red-700">Airtable error: {error}</div>
      ) : null}

      {isTeamViewActive ? (
        <>
          <div className="mx-auto w-full max-w-[1780px] px-6 pt-8 sm:px-8 lg:px-10">
            <button
              type="button"
              onClick={() => setTeamView(null)}
              className="rounded-full border border-[#c9a43e] bg-[#fffaf0]/80 px-4 py-2 text-xs font-bold tracking-[0.12em] text-[#173942] uppercase shadow-[0_10px_18px_-14px_rgba(9,28,34,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff2d1]"
            >
              Back
            </button>
          </div>
          <BoardLayout
            sections={teamSections}
            contentAlign="center"
            cardDensity="compact"
            showDividers={false}
          />
          {!hasAnyValidSubgroups ? (
            <div className="mx-auto w-full max-w-[1800px] px-6 pb-6 text-[#173942]">
              No matching subgroup records were found for {teamSourcePersonName}.
            </div>
          ) : null}
          {teamSections.length === 0 ? (
            <div className="mx-auto w-full max-w-[1800px] px-6 pb-6 text-[#173942]">
              No subgroups are available for {teamSourcePersonName}.
            </div>
          ) : null}
          {!hasAnyTeamCards && teamSections.length > 0 ? (
            <div className="mx-auto w-full max-w-[1800px] px-6 pb-6 text-[#173942]">
              No people are currently listed in these subgroups.
            </div>
          ) : null}
        </>
      ) : (
        <>
          <BoardLayout
            sections={homeSections}
            contentAlign="left"
            cardDensity="compact"
            showDividers
          />
          {noHomeSections ? (
            <div className="mx-auto w-full max-w-[1800px] px-6 pb-6 text-[#173942]">
              No child groups were found under the root group.
            </div>
          ) : null}
        </>
      )}
      <PageFooter />
    </main>
  )
}

export default App
