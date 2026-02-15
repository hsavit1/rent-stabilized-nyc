import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const csvPath = join(__dirname, '../../data/rentstab_joined.csv')
const csv2Path = join(__dirname, '../../data/rentstab_v2_2018_2023.csv')
const dataDir = join(__dirname, '../public/data')
const srcDataDir = join(__dirname, '../src/data')

mkdirSync(dataDir, { recursive: true })
mkdirSync(srcDataDir, { recursive: true })

const boroughMap = {
  MN: 'Manhattan',
  BX: 'Bronx',
  BK: 'Brooklyn',
  QN: 'Queens',
  SI: 'Staten Island',
}

// Proper CSV line parser that handles quoted fields with commas
function parseCSVLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++ // skip escaped quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current)
  return fields
}

// Parse v2 (2018-2023) data
const raw2 = readFileSync(csv2Path, 'utf-8')
const lines2 = raw2.split('\n').filter(l => l.trim())
const header2 = lines2[0].split(',')
const col2 = (name) => header2.indexOf(name)
const v2Map = new Map()

for (let i = 1; i < lines2.length; i++) {
  const fields = lines2[i].split(',')
  const ucbbl = fields[col2('ucbbl')]?.trim()
  if (!ucbbl) continue
  let latestUnits = null
  let latestYear = null
  for (const year of ['2023', '2022', '2021', '2020', '2019', '2018']) {
    const val = parseInt(fields[col2(`uc${year}`)])
    if (!isNaN(val) && val > 0) {
      latestUnits = val
      latestYear = year
      break
    }
  }
  v2Map.set(ucbbl, { latestUnits, latestYear })
}

console.log(`Loaded ${v2Map.size} records from v2 (2018-2023) data`)

// Parse main CSV
const raw = readFileSync(csvPath, 'utf-8')
const lines = raw.split('\n').filter(l => l.trim())
const header = parseCSVLine(lines[0])
const col = (name) => header.indexOf(name)

// Verify expected columns
console.log(`Columns: ${header.length}`)
console.log(`zipcode col: ${col('zipcode')}, address col: ${col('address')}, ownername col: ${col('ownername')}`)

const buildings = []
let skippedNoBorough = 0
let skippedNoAddress = 0
let skippedBadZip = 0

for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVLine(lines[i])

  // Verify we got the right number of columns (±1 for trailing comma)
  if (fields.length < 59) continue

  const borough = fields[col('borough')]?.trim()
  const address = fields[col('address')]?.trim()
  const owner = fields[col('ownername')]?.trim()
  const zipcode = fields[col('zipcode')]?.trim()
  const lat = parseFloat(fields[col('lat')])
  const lon = parseFloat(fields[col('lon')])
  const yearBuilt = parseInt(fields[col('yearbuilt')]) || null
  const numFloors = parseInt(fields[col('numfloors')]) || null
  const unitsRes = parseInt(fields[col('unitsres')]) || null
  const unitsTotal = parseInt(fields[col('unitstotal')]) || null
  const ucbbl = fields[col('ucbbl')]?.trim()

  if (!borough || !boroughMap[borough]) { skippedNoBorough++; continue }
  if (!address) { skippedNoAddress++; continue }

  // Validate zipcode (should be 5 digits)
  const validZip = /^\d{5}$/.test(zipcode) ? zipcode : ''
  if (zipcode && !validZip) skippedBadZip++

  // Validate yearBuilt
  const validYear = yearBuilt && yearBuilt >= 1800 && yearBuilt <= 2025 ? yearBuilt : null

  // Get stabilized units — prefer v2 (2018-2023), fall back to original
  let stabilizedUnits = null
  let dataYear = null
  const v2Data = v2Map.get(ucbbl)
  if (v2Data?.latestUnits) {
    stabilizedUnits = v2Data.latestUnits
    dataYear = v2Data.latestYear
  } else {
    for (const year of ['2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007']) {
      const val = parseInt(fields[col(`${year}uc`)])
      if (!isNaN(val) && val > 0) {
        stabilizedUnits = val
        dataYear = year
        break
      }
    }
  }

  let abatement = ''
  for (const year of ['2017', '2016', '2015', '2014']) {
    const val = fields[col(`${year}abat`)]?.trim()
    if (val) { abatement = val; break }
  }

  buildings.push({
    i: ucbbl || `${i}`,
    b: boroughMap[borough],
    a: address,
    o: owner || '',
    z: validZip,
    la: isNaN(lat) ? null : Math.round(lat * 10000) / 10000,
    lo: isNaN(lon) ? null : Math.round(lon * 10000) / 10000,
    yb: validYear,
    fl: numFloors,
    ur: unitsRes,
    ut: unitsTotal,
    su: stabilizedUnits,
    dy: dataYear,
    ab: abatement,
  })
}

buildings.sort((a, b) => a.b.localeCompare(b.b) || a.a.localeCompare(b.a))

console.log(`\nSkipped: ${skippedNoBorough} no borough, ${skippedNoAddress} no address, ${skippedBadZip} bad zipcodes fixed`)

// Generate stats
const stats = {
  totalBuildings: buildings.length,
  totalStabilizedUnits: buildings.reduce((s, b) => s + (b.su || 0), 0),
  byBorough: {},
  topZipcodes: [],
  yearBuiltDistribution: {},
}

const zipData = {}
for (const b of buildings) {
  if (!stats.byBorough[b.b]) stats.byBorough[b.b] = { buildings: 0, units: 0 }
  stats.byBorough[b.b].buildings++
  stats.byBorough[b.b].units += b.su || 0

  if (b.z) {
    if (!zipData[b.z]) zipData[b.z] = { buildings: 0, units: 0, borough: b.b }
    zipData[b.z].buildings++
    zipData[b.z].units += b.su || 0
  }

  if (b.yb) {
    const decade = Math.floor(b.yb / 10) * 10
    stats.yearBuiltDistribution[decade] = (stats.yearBuiltDistribution[decade] || 0) + 1
  }
}

stats.topZipcodes = Object.entries(zipData)
  .sort((a, b) => b[1].units - a[1].units)
  .slice(0, 25)
  .map(([zip, data]) => ({ zipcode: zip, ...data }))

// Write per-borough JSON files
const boroughs = ['Manhattan', 'Bronx', 'Brooklyn', 'Queens', 'Staten Island']
for (const boro of boroughs) {
  const boroBuildings = buildings.filter(b => b.b === boro)
  const slug = boro.toLowerCase().replace(' ', '-')
  writeFileSync(join(dataDir, `${slug}.json`), JSON.stringify(boroBuildings))
  console.log(`  ${boro}: ${boroBuildings.length} buildings (${(JSON.stringify(boroBuildings).length / 1024).toFixed(0)} KB)`)
}

writeFileSync(join(srcDataDir, 'stats.json'), JSON.stringify(stats, null, 2))
writeFileSync(join(dataDir, 'all.json'), JSON.stringify(buildings))

console.log(`\nTotal: ${buildings.length} buildings, ${stats.totalStabilizedUnits.toLocaleString()} stabilized units`)
console.log(`All data: ${(JSON.stringify(buildings).length / 1024 / 1024).toFixed(1)} MB`)
console.log('\nTop 10 zipcodes:')
stats.topZipcodes.slice(0, 10).forEach(z =>
  console.log(`  ${z.zipcode} (${z.borough}): ${z.units.toLocaleString()} units in ${z.buildings} buildings`))
