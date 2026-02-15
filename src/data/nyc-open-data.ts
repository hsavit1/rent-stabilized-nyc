import { queryOptions } from '@tanstack/react-query'

const SOCRATA_BASE = 'https://data.cityofnewyork.us/resource'

async function socrataFetch<T>(dataset: string, params: Record<string, string>): Promise<T[]> {
  const url = new URL(`${SOCRATA_BASE}/${dataset}.json`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Socrata ${dataset}: ${res.status}`)
  return res.json()
}

/** Parse a 10-digit BBL into boro, block, lot (strips leading zeros) */
function parseBbl(bbl: string) {
  const boroid = bbl.charAt(0)
  const block = bbl.slice(1, 6).replace(/^0+/, '')
  const lot = bbl.slice(6, 10).replace(/^0+/, '')
  return { boroid, block, lot }
}

// --- HPD Violations ---

export interface HpdViolation {
  violationid: string
  inspectiondate: string
  novdescription: string
  class: string
  currentstatus: string
}

export function hpdViolationsOptions(bbl: string) {
  return queryOptions({
    queryKey: ['hpd-violations', bbl],
    queryFn: () =>
      socrataFetch<HpdViolation>('wvxf-dwi5', {
        $where: `bbl='${bbl}'`,
        $order: 'inspectiondate DESC',
        $limit: '200',
        $select: 'violationid,inspectiondate,novdescription,class,currentstatus',
      }),
    enabled: !!bbl,
  })
}

// --- HPD Registrations + Contacts ---

export interface HpdRegistration {
  registrationid: string
  registrationenddate: string
  boroid: string
  block: string
  lot: string
}

export interface HpdContact {
  registrationcontactid: string
  registrationid: string
  type: string
  contactdescription: string
  corporationname: string
  firstname: string
  lastname: string
  businesshousenumber: string
  businessstreetname: string
  businessapartment: string
  businesscity: string
  businessstate: string
  businesszip: string
}

async function fetchHpdRegistrationsWithContacts(bbl: string) {
  const { boroid, block, lot } = parseBbl(bbl)
  const registrations = await socrataFetch<HpdRegistration>('tesw-yqqr', {
    $where: `boroid='${boroid}' AND block='${block}' AND lot='${lot}'`,
    $order: 'registrationenddate DESC',
    $limit: '5',
  })

  if (registrations.length === 0) return { registrations: [], contacts: [] }

  const regIds = registrations.map(r => r.registrationid)
  const whereClause = regIds.map(id => `registrationid='${id}'`).join(' OR ')

  const contacts = await socrataFetch<HpdContact>('feu5-w2e2', {
    $where: whereClause,
    $limit: '100',
  })

  return { registrations, contacts }
}

export function hpdRegistrationsOptions(bbl: string) {
  return queryOptions({
    queryKey: ['hpd-registrations', bbl],
    queryFn: () => fetchHpdRegistrationsWithContacts(bbl),
    enabled: !!bbl,
  })
}

// --- Housing Connect Lotteries ---

export interface HousingConnectBuilding {
  lottery_id: string
  address_bbl: string
}

export interface HousingConnectLottery {
  lottery_id: string
  lottery_name: string
  lottery_status: string
  development_type: string
  lottery_start_date: string
  lottery_end_date: string
  unit_count: string
  unit_distribution_studio: string
  unit_distribution_1bed: string
  unit_distribution_2bed: string
  unit_distribution_3bed: string
  unit_distribution_4bed: string
  borough: string
  postcode: string
}

async function fetchHousingConnectLotteries(bbl: string) {
  const buildings = await socrataFetch<HousingConnectBuilding>('nibs-na6y', {
    $where: `address_bbl='${bbl}'`,
    $limit: '50',
    $select: 'lottery_id,address_bbl',
  })

  if (buildings.length === 0) return []

  const uniqueIds = [...new Set(buildings.map(b => b.lottery_id))]
  const inClause = uniqueIds.map(id => `'${id}'`).join(',')

  const lotteries = await socrataFetch<HousingConnectLottery>('vy5i-a666', {
    $where: `lottery_id in(${inClause})`,
    $limit: '50',
  })

  return lotteries
}

export function housingConnectOptions(bbl: string) {
  return queryOptions({
    queryKey: ['housing-connect', bbl],
    queryFn: () => fetchHousingConnectLotteries(bbl),
    enabled: !!bbl,
  })
}

// --- DOB Permits ---

export interface DobPermit {
  filing_date: string
  job_type: string
  filing_status: string
  applicant_first_name: string
  applicant_last_name: string
}

export function dobPermitsOptions(bbl: string) {
  return queryOptions({
    queryKey: ['dob-permits', bbl],
    queryFn: () =>
      socrataFetch<DobPermit>('w9ak-ipjd', {
        $where: `bbl='${bbl}'`,
        $order: 'filing_date DESC',
        $limit: '100',
        $select: 'filing_date,job_type,filing_status,applicant_first_name,applicant_last_name',
      }),
    enabled: !!bbl,
  })
}
