import PageGraphic from './PageGraphic'

const PageHeader = () => {
  return (
    <header className="relative w-full border-b border-[#dccca7] bg-[#f7f4ea]/92 shadow-[0_14px_30px_-28px_rgba(23,57,66,0.9)] backdrop-blur-[1px]">
      <PageGraphic position="top" />
      <div className="mx-auto flex w-full max-w-[1800px] items-center gap-4 px-6 py-8 sm:py-9">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#c9a43e] bg-[#1e4f5c] text-xl font-extrabold text-[#f5e8c0] shadow-[0_12px_22px_-14px_rgba(9,28,34,0.95)]">
          CB
        </div>
        <div>
          <p className="m-0 text-xs font-semibold tracking-[0.2em] text-[#6e5b2d] uppercase">Directory</p>
          <h1 className="m-0 text-3xl font-extrabold tracking-tight text-[#173942]">Midwest Institutions</h1>
        </div>
      </div>
    </header>
  )
}

export default PageHeader
