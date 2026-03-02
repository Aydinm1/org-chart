import PageGraphic from './PageGraphic'

const PageHeader = () => {
  return (
    <header className="w-full bg-[#f7f4ea]/90">
      <PageGraphic position="top" />
      <div className="mx-auto flex w-full max-w-[1800px] items-center gap-4 px-6 py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#c9a43e] bg-[#1e4f5c] text-xl font-extrabold text-[#f5e8c0]">
          CB
        </div>
        <div>
          <p className="m-0 text-xs font-semibold tracking-[0.2em] text-[#6e5b2d] uppercase">Org Chart</p>
          <h1 className="m-0 text-3xl font-extrabold text-[#173942]">Midwest Institutions</h1>
        </div>
      </div>
    </header>
  )
}

export default PageHeader
