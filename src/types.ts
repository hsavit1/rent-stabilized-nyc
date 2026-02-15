export interface Building {
  i: string   // id (ucbbl)
  b: string   // borough
  a: string   // address
  o: string   // owner
  z: string   // zipcode
  la: number | null  // latitude
  lo: number | null  // longitude
  yb: number | null  // year built
  fl: number | null  // floors
  ur: number | null  // residential units
  ut: number | null  // total units
  su: number | null  // stabilized units
  dy: string | null  // data year
  ab: string         // abatement
}

export interface BoroughStats {
  buildings: number
  units: number
}

export interface ZipcodeStats {
  zipcode: string
  buildings: number
  units: number
  borough: string
}

export interface Stats {
  totalBuildings: number
  totalStabilizedUnits: number
  byBorough: Record<string, BoroughStats>
  topZipcodes: ZipcodeStats[]
  yearBuiltDistribution: Record<string, number>
}
