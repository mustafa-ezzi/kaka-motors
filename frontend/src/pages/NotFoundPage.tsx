import { ButtonLink } from '../components/ButtonLink'
import { Seo } from '../components/Seo'

export function NotFoundPage() {
  return (
    <section className="shell flex min-h-[80vh] flex-col justify-center pt-28">
      <Seo title="Signal lost — Kaka Motors" description="That route is not on the floor." path="/404" />
      <p className="eyebrow">404</p>
      <h1 className="display mt-4 text-[clamp(3rem,8vw,6rem)]">Signal lost.</h1>
      <p className="mt-4 max-w-md text-white/65">
        That route is not on the floor. Return to the studio and start again.
      </p>
      <div className="mt-8">
        <ButtonLink href="/">Back to the studio</ButtonLink>
      </div>
    </section>
  )
}
