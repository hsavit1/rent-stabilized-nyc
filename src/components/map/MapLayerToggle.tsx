export function MapLayerToggle({
  showSubway,
  onToggleSubway,
  showHcActive,
  onToggleHcActive,
  showHcInactive,
  onToggleHcInactive,
}: {
  showSubway: boolean
  onToggleSubway: (v: boolean) => void
  showHcActive: boolean
  onToggleHcActive: (v: boolean) => void
  showHcInactive: boolean
  onToggleHcInactive: (v: boolean) => void
}) {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg px-3 py-2.5 space-y-1">
      <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Housing Connect</div>
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 select-none">
        <input
          type="checkbox"
          checked={showHcActive}
          onChange={e => onToggleHcActive(e.target.checked)}
          className="accent-green-500 w-3.5 h-3.5"
        />
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e] shrink-0" />
        Active Lotteries
      </label>
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 select-none">
        <input
          type="checkbox"
          checked={showHcInactive}
          onChange={e => onToggleHcInactive(e.target.checked)}
          className="accent-gray-500 w-3.5 h-3.5"
        />
        <span className="inline-block w-2 h-2 rounded-full bg-gray-500 shrink-0" />
        Past Lotteries
      </label>
      <div className="!mt-2 pt-2 border-t border-gray-800">
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
    </div>
  )
}
