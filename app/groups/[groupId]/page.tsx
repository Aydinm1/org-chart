import { notFound } from 'next/navigation'
import DirectoryPage from '../../../components/directory/DirectoryPage'
import { loadGroupPage } from '../../../lib/directory/page-builder'

export const revalidate = 300

interface GroupPageProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupId } = await params
  const pageModel = await loadGroupPage(groupId)

  if (!pageModel) {
    notFound()
  }

  return <DirectoryPage page={pageModel} />
}
