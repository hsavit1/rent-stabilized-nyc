export function MapLayerToggle({
  showSubway,
  onToggleSubway,
  showHousingConnect,
  onToggleHousingConnect,
}: {
  showSubway: boolean
  onToggleSubway: (v: boolean) => void
  showHousingConnect: boolean
  onToggleHousingConnect: (v: boolean) => void
}) {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg px-3 py-2 space-y-1.5">
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 select-none">
        <input
          type="checkbox"
          checked={showHousingConnect}
          onChange={e => onToggleHousingConnect(e.target.checked)}
          className="accent-green-500 w-3.5 h-3.5"
        />
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 shrink-0" />
        Housing Connect Lotteries
      </label>
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 select-none">
        <input
          type="checkbox"
          checked={showSubway}
          onChange={e => onToggleSubway(e.target.checked)}
          className="accent-amber-500 w-3.5 h-3.5"
        />
        Subway Lines
      </label>
    </div>
  )
}
