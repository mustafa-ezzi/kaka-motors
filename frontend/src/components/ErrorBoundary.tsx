import { Component, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="shell flex min-h-[70vh] flex-col justify-center pt-28">
          <p className="eyebrow">Studio interrupted</p>
          <h1 className="display mt-4 text-4xl">Something stalled on the floor.</h1>
          <p className="mt-4 max-w-md text-white/70">Refresh the page. If it keeps happening, the studio has already been told.</p>
        </section>
      )
    }
    return this.props.children
  }
}
