export function getStreetEasySearchUrl(address: string, zip: string): string {
  const query = encodeURIComponent(`${address}, NY ${zip}`)
  return `https://streeteasy.com/search?search=${query}`
}

export function getDHCRSearchUrl(): string {
  return 'https://apps.hcr.ny.gov/BuildingSearch/'
}

export function getGoogleMapsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
}

export function getStreetViewUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
}

const STREET_TYPES = [
  'STREET', 'AVENUE', 'ROAD', 'PLACE', 'DRIVE', 'BOULEVARD', 'COURT',
  'LANE', 'WAY', 'TERRACE', 'PLAZA', 'PARKWAY', 'CIRCLE', 'TURNPIKE',
  'HIGHWAY', 'EXPRESSWAY', 'CONCOURSE', 'WALK', 'SLIP', 'LOOP', 'ALLEY',
  'PATH', 'ROW', 'SQUARE', 'CRESCENT',
] as const

const DIRECTION_PREFIXES = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'N', 'S', 'E', 'W'] as const

const BOROUGH_TO_COUNTY: Record<string, string> = {
  'Manhattan': 'NEW YORK',
  'Brooklyn': 'KINGS',
  'Bronx': 'BRONX',
  'Queens': 'QUEENS',
  'Staten Island': 'RICHMOND',
}

export interface ParsedAddress {
  houseNumber: string
  directionPrefix: string
  streetName: string
  streetType: string
  county: string
}

export function parseDHCRAddress(address: string, borough: string): ParsedAddress {
  const parts = address.trim().toUpperCase().split(/\s+/)

  // Extract house number (first part, e.g. "35-37" or "100")
  let houseNumber = ''
  let rest = parts
  if (parts.length > 0 && /^\d/.test(parts[0])) {
    houseNumber = parts[0]
    rest = parts.slice(1)
  }

  // Check for direction prefix
  let directionPrefix = ''
  if (rest.length > 1 && (DIRECTION_PREFIXES as readonly string[]).includes(rest[0])) {
    directionPrefix = rest[0]
    rest = rest.slice(1)
  }

  // Check if last word is a street type
  let streetType = ''
  if (rest.length > 1 && (STREET_TYPES as readonly string[]).includes(rest[rest.length - 1])) {
    streetType = rest[rest.length - 1]
    rest = rest.slice(0, -1)
  }

  const streetName = rest.join(' ')
  const county = BOROUGH_TO_COUNTY[borough] || borough.toUpperCase()

  return { houseNumber, directionPrefix, streetName, streetType, county }
}

/**
 * Opens the DHCR Building Search page in a new window with building data
 * encoded in window.name (which persists across cross-origin navigations).
 * The user then clicks the bookmarklet to auto-fill the form.
 */
export function openDHCRWithData(address: string, borough: string): void {
  const parsed = parseDHCRAddress(address, borough)
  const data = JSON.stringify({
    _rsnyc: true,
    n: parsed.houseNumber,
    s: parsed.streetName,
    t: parsed.streetType,
    c: parsed.county,
    dp: parsed.directionPrefix,
  })
  const w = window.open('', '_blank')
  if (w) {
    w.name = data
    w.location.href = 'https://apps.hcr.ny.gov/BuildingSearch/'
  }
}

/**
 * Returns a javascript: URI bookmarklet that reads building data from
 * window.name and fills in the DHCR form fields by matching label text.
 */
export function getDHCRBookmarkletCode(): string {
  // Keep as ES5, no template literals — needs to run in any browser context
  const code = [
    '(function(){',
    'try{',
    'var d=JSON.parse(window.name);',
    'if(!d||!d._rsnyc){alert("No auto-fill data. Open DHCR from rent-stabilized-nyc first.");return}',
    'function S(lt,v){',
      'if(!v)return;',
      'var ls=document.querySelectorAll("label");',
      'for(var i=0;i<ls.length;i++){',
        'if(ls[i].textContent.trim().replace(":","").indexOf(lt)>-1){',
          'var id=ls[i].getAttribute("for");',
          'if(!id)continue;',
          'var el=document.getElementById(id);',
          'if(!el)continue;',
          'if(el.tagName==="SELECT"){',
            'for(var j=0;j<el.options.length;j++){',
              'if(el.options[j].text.toUpperCase().trim()===v.toUpperCase().trim()||el.options[j].value.toUpperCase().trim()===v.toUpperCase().trim()){',
                'el.selectedIndex=j;break',
              '}',
            '}',
          '}else{el.value=v}',
          'return',
        '}',
      '}',
    '}',
    'S("Street House Number",d.n);',
    'S("Street Name",d.s);',
    'S("Street Type",d.t);',
    'S("County",d.c);',
    'if(d.dp)S("Street Direction Prefix",d.dp);',
    'window.name="";',
    'var b=document.createElement("div");',
    'b.style.cssText="position:fixed;top:0;left:0;right:0;background:#f59e0b;color:#000;text-align:center;padding:10px;z-index:9999;font:bold 14px sans-serif";',
    'b.textContent="Form auto-filled from NYC Rent Stabilized!";',
    'document.body.appendChild(b);',
    'setTimeout(function(){b.remove()},3000)',
    '}catch(e){alert("No auto-fill data found. Open DHCR from rent-stabilized-nyc first.")}',
    '})()',
  ].join('')

  return 'javascript:' + encodeURIComponent(code)
}
