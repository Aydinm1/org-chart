import { notFound } from 'next/navigation'
import DirectoryPage from '../../../components/directory/DirectoryPage'
import { loadGroupPage } from '../../../lib/directory/page-builder'

export const dynamic = 'force-dynamic'

interface GroupPageProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupId } = await params
  let pageModel = null

  try {
    pageModel = await loadGroupPage(groupId)
  } catch {
    notFound()
  }

  if (!pageModel) {
    notFound()
  }

  return <DirectoryPage page={pageModel} />
}
