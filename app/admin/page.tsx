import Link from 'next/link'
import ChangePasswordButton from '../../components/auth/ChangePasswordButton'
import LogoutButton from '../../components/auth/LogoutButton'
import UsersTable from '../../components/admin/UsersTable'

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-white)_22%,transparent),transparent_24%),linear-gradient(180deg,var(--color-bg)_0%,var(--color-bg-deep)_100%)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-[color:var(--color-border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-white)_74%,var(--color-cream)),color-mix(in_srgb,var(--color-white)_24%,var(--color-cream)))] px-6 py-7 shadow-[0_28px_70px_-44px_color-mix(in_srgb,var(--color-teal)_32%,transparent)] sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
            <div className="flex items-center gap-3 self-start lg:self-auto">
              <Link
                href="/edit"
                className="inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-white/80 px-5 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white"
              >
                Open Editor
              </Link>
              <ChangePasswordButton />
              <LogoutButton />
            </div>
          </div>
        </section>

        <UsersTable />
      </div>
    </main>
  )
}
