/** Purely decorative backdrop: stars, banded sun, horizon, scrolling grid, CRT lines. */
export function Scene() {
  return (
    <div className="scene" aria-hidden="true">
      <div className="scene__stars" />
      <div className="scene__sun" />
      <div className="scene__horizon" />
      <div className="scene__grid" />
      <div className="scene__scanlines" />
    </div>
  )
}
