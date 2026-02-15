export function MapLayerToggle({
  showSubway,
  onToggle,
}: {
  showSubway: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg px-3 py-2">
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 select-none">
        <input
          type="checkbox"
          checked={showSubway}
          onChange={e => onToggle(e.target.checked)}
          className="accent-amber-500 w-3.5 h-3.5"
        />
        Subway Lines
      </label>
    </div>
  )
}
