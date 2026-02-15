import { BOROUGHS } from '../../data/boroughs'

interface MapLegendProps {
  buildingCount: number
  showHousingConnect?: boolean
  housingConnectCount?: number
}

export function MapLegend({ buildingCount, showHousingConnect, housingConnectCount }: MapLegendProps) {
  return (
    <div className="absolute bottom-6 left-4 z-[1000] bg-gray-900/95 border border-gray-800 rounded-xl p-4 backdrop-blur-sm">
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
        Boroughs
      </div>
      <div className="space-y-1.5">
        {BOROUGHS.map(b => (
          <div key={b.slug} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: b.color }}
            />
            <span className="text-sm text-gray-300">{b.name}</span>
          </div>
        ))}
      </div>
      {showHousingConnect && (
        <div className="mt-2 pt-2 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-green-500 shadow-[0_0_4px_#22c55e]" />
            <span className="text-sm text-green-400">Housing Connect</span>
          </div>
          {housingConnectCount != null && housingConnectCount > 0 && (
            <div className="text-xs text-gray-500 ml-[18px]">
              {housingConnectCount.toLocaleString()} buildings with lotteries
            </div>
          )}
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          <span className="text-white font-medium">{buildingCount.toLocaleString()}</span> buildings shown
        </div>
      </div>
    </div>
  )
}
