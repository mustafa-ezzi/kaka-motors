export function AmbientBackground() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-0 h-[62vh] w-[min(52vw,40rem)] rounded-full bg-ice/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 z-0 h-[58vh] w-[min(46vw,36rem)] rounded-full bg-glow/50 blur-[150px]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-[40%] top-[30%] z-0 h-[28vh] w-[min(28vw,20rem)] rounded-full bg-scarlet/10 blur-[120px]"
      />
    </>
  )
}
