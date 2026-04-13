import AccountMenu from '../../components/auth/AccountMenu'
import UsersTable from '../../components/admin/UsersTable'
import { getCurrentUser } from '../../lib/auth/server'

export default async function AdminPage() {
  const currentUser = await getCurrentUser()

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-white)_22%,transparent),transparent_24%),linear-gradient(180deg,var(--color-bg)_0%,var(--color-bg-deep)_100%)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <section className="min-w-0 flex-1 overflow-hidden rounded-[32px] border border-[color:var(--color-border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-white)_74%,var(--color-cream)),color-mix(in_srgb,var(--color-white)_24%,var(--color-cream)))] px-6 py-7 shadow-[0_28px_70px_-44px_color-mix(in_srgb,var(--color-teal)_32%,transparent)] sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-accent)]">
                  Admin Console
                </p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[color:var(--color-ink)] sm:text-5xl">
                  Manage Directory Access
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--color-ink-soft)] sm:text-base">
                  Review account access, adjust roles, and keep the admin user roster current without
                  touching the public directory experience.
                </p>
              </div>
            </div>
          </section>
          {currentUser ? (
            <div className="shrink-0 pt-3">
              <AccountMenu currentUser={currentUser} />
            </div>
          ) : null}
        </div>

        <UsersTable />
      </div>
    </main>
  )
}
