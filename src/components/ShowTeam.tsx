const ShowTeam = () => {
  return (
    <div
      className="rounded-2xl px-8 py-6 w-72 text-white text-center text-sm"
      style={{ backgroundColor: '#1e4d5c', border: '2px solid #c9a84c' }}
    >
      <p className="font-extrabold uppercase tracking-wide text-base mb-2" style={{ color: '#c9a84c' }}>
        Team Members
      </p>
      <p className="text-white/70">No team members listed yet.</p>
    </div>
  )
}

export default ShowTeam
