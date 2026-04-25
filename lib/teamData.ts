export interface TeamData {
  abbrev:            string
  name:              string
  league:            'NHL' | 'NFL' | 'MLB' | 'NBA'
  venueName:         string
  venueCapacity:     number
  venueYearOpened:   number
  yearFounded:       number
  championships:     number
  venueAddressStart: string
  colors:            string[]
}

// Clue order: capacity → year founded → championships → league → venue name → colors
export const CLUE_LABELS = [
  'Venue capacity',
  'Year team founded',
  'Championships won',
  'League',
  'Venue name',
  'Team colors',
]

export function getClueValue(team: TeamData, index: number): string {
  switch (index) {
    case 0: return team.venueCapacity.toLocaleString()
    case 1: return String(team.yearFounded)
    case 2: return String(team.championships)
    case 3: return team.league === 'NHL' ? 'National Hockey League'
                 : team.league === 'NFL' ? 'National Football League'
                 : team.league === 'MLB' ? 'Major League Baseball'
                 :                         'National Basketball Association'
    case 4: return team.venueName
    case 5: return '' // rendered as color swatches in the UI
    default: return ''
  }
}

// Returns today's date as YYYY-MM-DD in Eastern time (handles EDT/EST automatically)
export function getEasternDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
  }).format(new Date())
}

// Challenge epoch — day 1 is April 25 2026 Eastern time
const EPOCH_DATE = '2026-04-25'

export function getDayIndex(): number {
  const today = getEasternDateString()
  const [ey, em, ed] = EPOCH_DATE.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  const epochMs = Date.UTC(ey, em - 1, ed)
  const todayMs = Date.UTC(ty, tm - 1, td)
  return Math.max(0, Math.floor((todayMs - epochMs) / 86_400_000))
}

export function getChallengeNumber(): number { return getDayIndex() + 1 }
export function getTodaysTeam(): TeamData {
  const idx = getDayIndex()
  return ALL_TEAMS[idx % ALL_TEAMS.length]
}

// ─── All teams ────────────────────────────────────────────────────────────────
export const ALL_TEAMS: TeamData[] = [

  // ── NHL (32) ──────────────────────────────────────────────────────────────
  { abbrev:'ANA', name:'Anaheim Ducks',           league:'NHL', venueName:'Honda Center',               venueCapacity:17174, venueYearOpened:1993, yearFounded:1993, championships:1,  venueAddressStart:'2695 E Katella Ave',             colors:['#F47A38','#B9975B','#C8C9C7','#000000'] },
  { abbrev:'BOS', name:'Boston Bruins',            league:'NHL', venueName:'TD Garden',                  venueCapacity:17850, venueYearOpened:1995, yearFounded:1924, championships:6,  venueAddressStart:'100 Legends Way',                colors:['#FFB81C','#000000'] },
  { abbrev:'BUF', name:'Buffalo Sabres',           league:'NHL', venueName:'KeyBank Center',             venueCapacity:19070, venueYearOpened:1996, yearFounded:1970, championships:0,  venueAddressStart:'1 Seymour H Knox III Plaza',     colors:['#003087','#FCB514','#FFFFFF'] },
  { abbrev:'CGY', name:'Calgary Flames',           league:'NHL', venueName:'Scotiabank Saddledome',      venueCapacity:19289, venueYearOpened:1983, yearFounded:1972, championships:1,  venueAddressStart:'555 Saddledome Rise SE',          colors:['#C8102E','#F1BE48','#111111'] },
  { abbrev:'CAR', name:'Carolina Hurricanes',      league:'NHL', venueName:'PNC Arena',                  venueCapacity:18680, venueYearOpened:1999, yearFounded:1972, championships:1,  venueAddressStart:'1400 Edwards Mill Rd',            colors:['#CC0000','#000000','#A2AAAD'] },
  { abbrev:'CHI', name:'Chicago Blackhawks',       league:'NHL', venueName:'United Center',              venueCapacity:19717, venueYearOpened:1994, yearFounded:1926, championships:6,  venueAddressStart:'1901 W Madison St',              colors:['#CF0A2C','#000000','#FFD100'] },
  { abbrev:'COL', name:'Colorado Avalanche',       league:'NHL', venueName:'Ball Arena',                 venueCapacity:18007, venueYearOpened:1999, yearFounded:1979, championships:3,  venueAddressStart:'1000 Chopper Circle',            colors:['#6F263D','#236192','#A2AAAD','#000000'] },
  { abbrev:'CBJ', name:'Columbus Blue Jackets',    league:'NHL', venueName:'Nationwide Arena',           venueCapacity:19500, venueYearOpened:2000, yearFounded:2000, championships:0,  venueAddressStart:'200 W Nationwide Blvd',          colors:['#002654','#CE1126','#A4A9AD'] },
  { abbrev:'DAL', name:'Dallas Stars',             league:'NHL', venueName:'American Airlines Center',   venueCapacity:18532, venueYearOpened:2001, yearFounded:1967, championships:1,  venueAddressStart:'2500 Victory Ave',               colors:['#006847','#8F8F8C','#000000'] },
  { abbrev:'DET', name:'Detroit Red Wings',        league:'NHL', venueName:'Little Caesars Arena',       venueCapacity:19515, venueYearOpened:2017, yearFounded:1926, championships:11, venueAddressStart:'2645 Woodward Ave',              colors:['#CE1126','#FFFFFF'] },
  { abbrev:'EDM', name:'Edmonton Oilers',          league:'NHL', venueName:'Rogers Place',               venueCapacity:18347, venueYearOpened:2016, yearFounded:1979, championships:5,  venueAddressStart:'10220 104 Ave NW',               colors:['#FF4C00','#041E42'] },
  { abbrev:'FLA', name:'Florida Panthers',         league:'NHL', venueName:'Amerant Bank Arena',         venueCapacity:19250, venueYearOpened:1998, yearFounded:1993, championships:1,  venueAddressStart:'1 Panther Pkwy',                 colors:['#041E42','#C8102E','#B9975B'] },
  { abbrev:'LAK', name:'Los Angeles Kings',        league:'NHL', venueName:'Crypto.com Arena',           venueCapacity:18230, venueYearOpened:1999, yearFounded:1967, championships:2,  venueAddressStart:'1111 S Figueroa St',             colors:['#111111','#A2AAAD'] },
  { abbrev:'MIN', name:'Minnesota Wild',           league:'NHL', venueName:'Xcel Energy Center',         venueCapacity:17954, venueYearOpened:2000, yearFounded:2000, championships:0,  venueAddressStart:'199 W Kellogg Blvd',             colors:['#154734','#A6192E','#EAAA00','#236192'] },
  { abbrev:'MTL', name:'Montréal Canadiens',       league:'NHL', venueName:'Bell Centre',                venueCapacity:21302, venueYearOpened:1996, yearFounded:1909, championships:24, venueAddressStart:'1909 Ave des Canadiens',          colors:['#AF1E2D','#192168'] },
  { abbrev:'NSH', name:'Nashville Predators',      league:'NHL', venueName:'Bridgestone Arena',          venueCapacity:17113, venueYearOpened:1996, yearFounded:1998, championships:0,  venueAddressStart:'501 Broadway',                   colors:['#FFB81C','#041E42'] },
  { abbrev:'NJD', name:'New Jersey Devils',        league:'NHL', venueName:'Prudential Center',          venueCapacity:16514, venueYearOpened:2007, yearFounded:1974, championships:3,  venueAddressStart:'25 Lafayette St',                colors:['#CE1126','#000000'] },
  { abbrev:'NYI', name:'New York Islanders',       league:'NHL', venueName:'UBS Arena',                  venueCapacity:17113, venueYearOpened:2021, yearFounded:1972, championships:4,  venueAddressStart:'1 UBS Arena Blvd',               colors:['#00539B','#F47D30'] },
  { abbrev:'NYR', name:'New York Rangers',         league:'NHL', venueName:'Madison Square Garden',      venueCapacity:18006, venueYearOpened:1968, yearFounded:1926, championships:4,  venueAddressStart:'4 Pennsylvania Plaza',           colors:['#0038A8','#CE1126','#FFFFFF'] },
  { abbrev:'OTT', name:'Ottawa Senators',          league:'NHL', venueName:'Canadian Tire Centre',       venueCapacity:18652, venueYearOpened:1996, yearFounded:1992, championships:0,  venueAddressStart:'1000 Palladium Dr',              colors:['#C52032','#C69214','#000000'] },
  { abbrev:'PHI', name:'Philadelphia Flyers',      league:'NHL', venueName:'Wells Fargo Center',         venueCapacity:19543, venueYearOpened:1996, yearFounded:1967, championships:2,  venueAddressStart:'3601 S Broad St',                colors:['#F74902','#000000'] },
  { abbrev:'PIT', name:'Pittsburgh Penguins',      league:'NHL', venueName:'PPG Paints Arena',           venueCapacity:18387, venueYearOpened:1999, yearFounded:1967, championships:5,  venueAddressStart:'1001 Fifth Ave',                 colors:['#000000','#FCB514','#CFC493'] },
  { abbrev:'SEA', name:'Seattle Kraken',           league:'NHL', venueName:'Climate Pledge Arena',       venueCapacity:17100, venueYearOpened:2021, yearFounded:2021, championships:0,  venueAddressStart:'334 1st Ave N',                  colors:['#001628','#99D9D9','#355464','#68A2B9','#E9072B'] },
  { abbrev:'SJS', name:'San Jose Sharks',          league:'NHL', venueName:'SAP Center',                 venueCapacity:17562, venueYearOpened:1993, yearFounded:1991, championships:0,  venueAddressStart:'525 W Santa Clara St',           colors:['#006D75','#EA7200','#000000'] },
  { abbrev:'STL', name:'St. Louis Blues',          league:'NHL', venueName:'Enterprise Center',          venueCapacity:18096, venueYearOpened:1994, yearFounded:1967, championships:1,  venueAddressStart:'1401 Clark Ave',                 colors:['#002F87','#FCB514','#041E42'] },
  { abbrev:'TBL', name:'Tampa Bay Lightning',      league:'NHL', venueName:'Amalie Arena',               venueCapacity:19092, venueYearOpened:1996, yearFounded:1992, championships:3,  venueAddressStart:'401 Channelside Dr',             colors:['#002868','#FFFFFF'] },
  { abbrev:'TOR', name:'Toronto Maple Leafs',      league:'NHL', venueName:'Scotiabank Arena',           venueCapacity:18819, venueYearOpened:1999, yearFounded:1917, championships:13, venueAddressStart:'40 Bay St',                      colors:['#00205B','#FFFFFF'] },
  { abbrev:'UTA', name:'Utah Mammoth',              league:'NHL', venueName:'Delta Center',               venueCapacity:18306, venueYearOpened:1991, yearFounded:2024, championships:0,  venueAddressStart:'301 S Temple',                   colors:['#010101','#69B3E7','#A77C50','#6C6F70'] },
  { abbrev:'VAN', name:'Vancouver Canucks',        league:'NHL', venueName:'Rogers Arena',               venueCapacity:18910, venueYearOpened:1995, yearFounded:1970, championships:0,  venueAddressStart:'800 Griffiths Way',              colors:['#00843D','#041C2C','#99999A'] },
  { abbrev:'VGK', name:'Vegas Golden Knights',     league:'NHL', venueName:'T-Mobile Arena',             venueCapacity:17500, venueYearOpened:2016, yearFounded:2017, championships:1,  venueAddressStart:'3780 S Las Vegas Blvd',          colors:['#B4975A','#333F48','#010101'] },
  { abbrev:'WSH', name:'Washington Capitals',      league:'NHL', venueName:'Capital One Arena',          venueCapacity:18573, venueYearOpened:1997, yearFounded:1974, championships:1,  venueAddressStart:'601 F St NW',                    colors:['#041E42','#C8102E','#A2AAAD'] },
  { abbrev:'WPG', name:'Winnipeg Jets',            league:'NHL', venueName:'Canada Life Centre',         venueCapacity:15321, venueYearOpened:2004, yearFounded:2011, championships:0,  venueAddressStart:'345 Graham Ave',                 colors:['#041E42','#004C97','#AC162C','#FFFFFF'] },

  // ── NFL (32) ──────────────────────────────────────────────────────────────
  { abbrev:'ARI', name:'Arizona Cardinals',        league:'NFL', venueName:'State Farm Stadium',         venueCapacity:63400,  venueYearOpened:2006, yearFounded:1898, championships:0,  venueAddressStart:'1 Cardinals Dr',                 colors:['#97233F','#000000','#FFB612'] },
  { abbrev:'ATL', name:'Atlanta Falcons',          league:'NFL', venueName:'Mercedes-Benz Stadium',      venueCapacity:71000,  venueYearOpened:2017, yearFounded:1966, championships:0,  venueAddressStart:'1 AMB Dr NW',                    colors:['#A71930','#000000','#A5ACAF'] },
  { abbrev:'BAL', name:'Baltimore Ravens',         league:'NFL', venueName:'M&T Bank Stadium',           venueCapacity:71008,  venueYearOpened:1998, yearFounded:1996, championships:2,  venueAddressStart:'1101 Russell St',                colors:['#241773','#000000','#9E7C0C'] },
  { abbrev:'BUF', name:'Buffalo Bills',            league:'NFL', venueName:'Highmark Stadium',           venueCapacity:71608,  venueYearOpened:1973, yearFounded:1960, championships:0,  venueAddressStart:'1 Bills Dr',                     colors:['#00338D','#C60C30'] },
  { abbrev:'CAR', name:'Carolina Panthers',        league:'NFL', venueName:'Bank of America Stadium',    venueCapacity:74867,  venueYearOpened:1996, yearFounded:1993, championships:0,  venueAddressStart:'800 S Mint St',                  colors:['#0085CA','#101820','#BFC0BF'] },
  { abbrev:'CHI', name:'Chicago Bears',            league:'NFL', venueName:'Soldier Field',              venueCapacity:61500,  venueYearOpened:1924, yearFounded:1920, championships:1,  venueAddressStart:'1410 S Museum Campus Dr',        colors:['#0B162A','#C83803'] },
  { abbrev:'CIN', name:'Cincinnati Bengals',       league:'NFL', venueName:'Paycor Stadium',             venueCapacity:65515,  venueYearOpened:2000, yearFounded:1968, championships:0,  venueAddressStart:'1 Paycor Stadium',               colors:['#FB4F14','#000000'] },
  { abbrev:'CLE', name:'Cleveland Browns',         league:'NFL', venueName:'Huntington Bank Field',      venueCapacity:67431,  venueYearOpened:1999, yearFounded:1946, championships:0,  venueAddressStart:'100 Alfred Lerner Way',          colors:['#311D00','#FF3C00'] },
  { abbrev:'DAL', name:'Dallas Cowboys',           league:'NFL', venueName:'AT&T Stadium',               venueCapacity:80000,  venueYearOpened:2009, yearFounded:1960, championships:5,  venueAddressStart:'1 AT&T Way',                     colors:['#003594','#041E42','#869397'] },
  { abbrev:'DEN', name:'Denver Broncos',           league:'NFL', venueName:'Empower Field at Mile High', venueCapacity:76125,  venueYearOpened:2001, yearFounded:1960, championships:3,  venueAddressStart:'1701 Mile High Stadium Circle',  colors:['#FB4F14','#002244'] },
  { abbrev:'DET', name:'Detroit Lions',            league:'NFL', venueName:'Ford Field',                 venueCapacity:65000,  venueYearOpened:2002, yearFounded:1930, championships:0,  venueAddressStart:'2000 Brush St',                  colors:['#0076B6','#B0B7BC','#000000'] },
  { abbrev:'GB',  name:'Green Bay Packers',        league:'NFL', venueName:'Lambeau Field',              venueCapacity:81441,  venueYearOpened:1957, yearFounded:1919, championships:4,  venueAddressStart:'1265 Lombardi Ave',              colors:['#203731','#FFB612'] },
  { abbrev:'HOU', name:'Houston Texans',           league:'NFL', venueName:'NRG Stadium',                venueCapacity:72220,  venueYearOpened:2002, yearFounded:2002, championships:0,  venueAddressStart:'1 NRG Pkwy',                     colors:['#03202F','#A71930'] },
  { abbrev:'IND', name:'Indianapolis Colts',       league:'NFL', venueName:'Lucas Oil Stadium',          venueCapacity:67000,  venueYearOpened:2008, yearFounded:1953, championships:2,  venueAddressStart:'500 S Capitol Ave',              colors:['#002C5F','#A2AAAD'] },
  { abbrev:'JAX', name:'Jacksonville Jaguars',     league:'NFL', venueName:'EverBank Stadium',           venueCapacity:67164,  venueYearOpened:1995, yearFounded:1995, championships:0,  venueAddressStart:'1 EverBank Stadium Dr',          colors:['#101820','#D7A22A','#006778'] },
  { abbrev:'KC',  name:'Kansas City Chiefs',       league:'NFL', venueName:'GEHA Field at Arrowhead',    venueCapacity:76416,  venueYearOpened:1972, yearFounded:1960, championships:4,  venueAddressStart:'1 Arrowhead Dr',                 colors:['#E31837','#FFB81C'] },
  { abbrev:'LV',  name:'Las Vegas Raiders',        league:'NFL', venueName:'Allegiant Stadium',          venueCapacity:65000,  venueYearOpened:2020, yearFounded:1960, championships:3,  venueAddressStart:'3333 Al Davis Way',              colors:['#000000','#A5ACAF'] },
  { abbrev:'LAC', name:'Los Angeles Chargers',     league:'NFL', venueName:'SoFi Stadium',               venueCapacity:70240,  venueYearOpened:2020, yearFounded:1960, championships:0,  venueAddressStart:'1001 Stadium Dr',                colors:['#0080C6','#FFC20E'] },
  { abbrev:'LAR', name:'Los Angeles Rams',         league:'NFL', venueName:'SoFi Stadium',               venueCapacity:70240,  venueYearOpened:2020, yearFounded:1936, championships:2,  venueAddressStart:'1001 Stadium Dr',                colors:['#003594','#FFA300'] },
  { abbrev:'MIA', name:'Miami Dolphins',           league:'NFL', venueName:'Hard Rock Stadium',          venueCapacity:64767,  venueYearOpened:1987, yearFounded:1966, championships:2,  venueAddressStart:'347 Don Shula Dr',               colors:['#008E97','#FC4C02','#005778'] },
  { abbrev:'MIN', name:'Minnesota Vikings',        league:'NFL', venueName:'U.S. Bank Stadium',          venueCapacity:66860,  venueYearOpened:2016, yearFounded:1961, championships:0,  venueAddressStart:'401 Chicago Ave',                colors:['#4F2683','#FFC62F'] },
  { abbrev:'NE',  name:'New England Patriots',     league:'NFL', venueName:'Gillette Stadium',           venueCapacity:65878,  venueYearOpened:2002, yearFounded:1960, championships:6,  venueAddressStart:'1 Patriot Place',                colors:['#002244','#C60C30','#B0B7BC'] },
  { abbrev:'NO',  name:'New Orleans Saints',       league:'NFL', venueName:'Caesars Superdome',          venueCapacity:73208,  venueYearOpened:1975, yearFounded:1967, championships:1,  venueAddressStart:'1500 Sugar Bowl Dr',             colors:['#D3BC8D','#101820'] },
  { abbrev:'NYG', name:'New York Giants',          league:'NFL', venueName:'MetLife Stadium',            venueCapacity:82500,  venueYearOpened:2010, yearFounded:1925, championships:4,  venueAddressStart:'1 MetLife Stadium Dr',           colors:['#0B2265','#A71930','#A5ACAF'] },
  { abbrev:'NYJ', name:'New York Jets',            league:'NFL', venueName:'MetLife Stadium',            venueCapacity:82500,  venueYearOpened:2010, yearFounded:1960, championships:1,  venueAddressStart:'1 MetLife Stadium Dr',           colors:['#125740','#000000'] },
  { abbrev:'PHI', name:'Philadelphia Eagles',      league:'NFL', venueName:'Lincoln Financial Field',    venueCapacity:69796,  venueYearOpened:2003, yearFounded:1933, championships:2,  venueAddressStart:'1 Lincoln Financial Field Way',  colors:['#004C54','#A5ACAF','#ACC0C6','#000000'] },
  { abbrev:'PIT', name:'Pittsburgh Steelers',      league:'NFL', venueName:'Acrisure Stadium',           venueCapacity:68400,  venueYearOpened:2001, yearFounded:1933, championships:6,  venueAddressStart:'100 Art Rooney Ave',             colors:['#FFB612','#101820'] },
  { abbrev:'SF',  name:'San Francisco 49ers',      league:'NFL', venueName:"Levi's Stadium",             venueCapacity:68500,  venueYearOpened:2014, yearFounded:1946, championships:5,  venueAddressStart:'4900 Marie P DeBartolo Way',     colors:['#AA0000','#B3995D'] },
  { abbrev:'SEA', name:'Seattle Seahawks',         league:'NFL', venueName:'Lumen Field',                venueCapacity:68740,  venueYearOpened:2002, yearFounded:1976, championships:1,  venueAddressStart:'800 Occidental Ave S',           colors:['#002244','#69BE28','#A5ACAF'] },
  { abbrev:'TB',  name:'Tampa Bay Buccaneers',     league:'NFL', venueName:'Raymond James Stadium',      venueCapacity:65890,  venueYearOpened:1998, yearFounded:1976, championships:2,  venueAddressStart:'4201 N Dale Mabry Hwy',          colors:['#D50A0A','#FF7900','#0A0A08','#B1BABF'] },
  { abbrev:'TEN', name:'Tennessee Titans',         league:'NFL', venueName:'Nissan Stadium',             venueCapacity:69143,  venueYearOpened:1999, yearFounded:1960, championships:0,  venueAddressStart:'1 Titans Way',                   colors:['#0C2340','#4B92DB','#C8102E'] },
  { abbrev:'WAS', name:'Washington Commanders',    league:'NFL', venueName:'Northwest Stadium',          venueCapacity:67617,  venueYearOpened:1997, yearFounded:1932, championships:3,  venueAddressStart:'1600 FedEx Way',                 colors:['#5A1414','#FFB612'] },

  // ── MLB (30) ──────────────────────────────────────────────────────────────
  { abbrev:'ARI', name:'Arizona Diamondbacks',     league:'MLB', venueName:'Chase Field',                venueCapacity:48519,  venueYearOpened:1998, yearFounded:1998, championships:1,  venueAddressStart:'401 E Jefferson St',             colors:['#A71930','#E3D4AD','#000000'] },
  { abbrev:'ATL', name:'Atlanta Braves',           league:'MLB', venueName:'Truist Park',                venueCapacity:41084,  venueYearOpened:2017, yearFounded:1876, championships:4,  venueAddressStart:'755 Battery Ave SE',             colors:['#CE1141','#13274F'] },
  { abbrev:'BAL', name:'Baltimore Orioles',        league:'MLB', venueName:'Oriole Park at Camden Yards',venueCapacity:44970,  venueYearOpened:1992, yearFounded:1894, championships:3,  venueAddressStart:'333 W Camden St',                colors:['#DF4601','#000000'] },
  { abbrev:'BOS', name:'Boston Red Sox',           league:'MLB', venueName:'Fenway Park',                venueCapacity:37755,  venueYearOpened:1912, yearFounded:1901, championships:9,  venueAddressStart:'4 Jersey St',                    colors:['#BD3039','#0D2B56'] },
  { abbrev:'CHC', name:'Chicago Cubs',             league:'MLB', venueName:'Wrigley Field',              venueCapacity:41649,  venueYearOpened:1914, yearFounded:1876, championships:3,  venueAddressStart:'1060 W Addison St',              colors:['#0E3386','#CC3433'] },
  { abbrev:'CWS', name:'Chicago White Sox',        league:'MLB', venueName:'Guaranteed Rate Field',      venueCapacity:40615,  venueYearOpened:1991, yearFounded:1900, championships:3,  venueAddressStart:'333 W 35th St',                  colors:['#27251F','#C4CED4'] },
  { abbrev:'CIN', name:'Cincinnati Reds',          league:'MLB', venueName:'Great American Ball Park',   venueCapacity:42319,  venueYearOpened:2003, yearFounded:1882, championships:5,  venueAddressStart:'100 Joe Nuxhall Way',            colors:['#C6011F','#000000'] },
  { abbrev:'CLE', name:'Cleveland Guardians',      league:'MLB', venueName:'Progressive Field',          venueCapacity:34830,  venueYearOpened:1994, yearFounded:1894, championships:2,  venueAddressStart:'2401 Ontario St',                colors:['#00385D','#E31937'] },
  { abbrev:'COL', name:'Colorado Rockies',         league:'MLB', venueName:'Coors Field',                venueCapacity:50144,  venueYearOpened:1995, yearFounded:1993, championships:0,  venueAddressStart:'2001 Blake St',                  colors:['#33006F','#C4CED4','#000000'] },
  { abbrev:'DET', name:'Detroit Tigers',           league:'MLB', venueName:'Comerica Park',              venueCapacity:41083,  venueYearOpened:2000, yearFounded:1894, championships:4,  venueAddressStart:'2100 Woodward Ave',              colors:['#0C2340','#FA4616'] },
  { abbrev:'HOU', name:'Houston Astros',           league:'MLB', venueName:'Minute Maid Park',           venueCapacity:41168,  venueYearOpened:2000, yearFounded:1962, championships:2,  venueAddressStart:'501 Crawford St',                colors:['#002D62','#EB6E1F'] },
  { abbrev:'KC',  name:'Kansas City Royals',       league:'MLB', venueName:'Kauffman Stadium',           venueCapacity:37903,  venueYearOpened:1973, yearFounded:1969, championships:2,  venueAddressStart:'1 Royal Way',                    colors:['#004687','#C09A5B'] },
  { abbrev:'LAA', name:'Los Angeles Angels',       league:'MLB', venueName:'Angel Stadium',              venueCapacity:45517,  venueYearOpened:1966, yearFounded:1961, championships:1,  venueAddressStart:'2000 E Gene Autry Way',          colors:['#BA0021','#003263'] },
  { abbrev:'LAD', name:'Los Angeles Dodgers',      league:'MLB', venueName:'Dodger Stadium',             venueCapacity:56000,  venueYearOpened:1962, yearFounded:1883, championships:7,  venueAddressStart:'1000 Vin Scully Ave',            colors:['#005A9C','#EF3E42'] },
  { abbrev:'MIA', name:'Miami Marlins',            league:'MLB', venueName:'loanDepot Park',             venueCapacity:36742,  venueYearOpened:2012, yearFounded:1993, championships:2,  venueAddressStart:'501 Marlins Way',                colors:['#00A3E0','#EF3340','#FF6600','#000000'] },
  { abbrev:'MIL', name:'Milwaukee Brewers',        league:'MLB', venueName:'American Family Field',      venueCapacity:41900,  venueYearOpened:2001, yearFounded:1969, championships:0,  venueAddressStart:'1 Brewers Way',                  colors:['#12284B','#FFC52F'] },
  { abbrev:'MIN', name:'Minnesota Twins',          league:'MLB', venueName:'Target Field',               venueCapacity:38544,  venueYearOpened:2010, yearFounded:1901, championships:3,  venueAddressStart:'1 Twins Way',                    colors:['#002B5C','#D31145','#B9975B'] },
  { abbrev:'NYM', name:'New York Mets',            league:'MLB', venueName:'Citi Field',                 venueCapacity:41922,  venueYearOpened:2009, yearFounded:1962, championships:2,  venueAddressStart:'41 Seaver Way',                  colors:['#002D72','#FF5910'] },
  { abbrev:'NYY', name:'New York Yankees',         league:'MLB', venueName:'Yankee Stadium',             venueCapacity:46537,  venueYearOpened:2009, yearFounded:1901, championships:27, venueAddressStart:'1 E 161st St',                   colors:['#003087','#E4002B'] },
  { abbrev:'OAK', name:'Athletics',                league:'MLB', venueName:'Sutter Health Park',         venueCapacity:14014,  venueYearOpened:1999, yearFounded:1901, championships:9,  venueAddressStart:'400 Ballpark Dr',                colors:['#003831','#EFB21E'] },
  { abbrev:'PHI', name:'Philadelphia Phillies',    league:'MLB', venueName:'Citizens Bank Park',         venueCapacity:42901,  venueYearOpened:2004, yearFounded:1883, championships:2,  venueAddressStart:'1 Citizens Bank Way',            colors:['#E81828','#002D72'] },
  { abbrev:'PIT', name:'Pittsburgh Pirates',       league:'MLB', venueName:'PNC Park',                   venueCapacity:38747,  venueYearOpened:2001, yearFounded:1882, championships:5,  venueAddressStart:'115 Federal St',                 colors:['#27251F','#FDB827'] },
  { abbrev:'SD',  name:'San Diego Padres',         league:'MLB', venueName:'Petco Park',                 venueCapacity:40209,  venueYearOpened:2004, yearFounded:1969, championships:0,  venueAddressStart:'100 Park Blvd',                  colors:['#2F241D','#FFC425','#7F411C'] },
  { abbrev:'SF',  name:'San Francisco Giants',     league:'MLB', venueName:'Oracle Park',                venueCapacity:41915,  venueYearOpened:2000, yearFounded:1883, championships:8,  venueAddressStart:'24 Willie Mays Plaza',           colors:['#FD5A1E','#27251F'] },
  { abbrev:'SEA', name:'Seattle Mariners',         league:'MLB', venueName:'T-Mobile Park',              venueCapacity:47929,  venueYearOpened:1999, yearFounded:1977, championships:0,  venueAddressStart:'1250 1st Ave S',                 colors:['#0C2C56','#005C5C','#C4CED4'] },
  { abbrev:'STL', name:'St. Louis Cardinals',      league:'MLB', venueName:'Busch Stadium',              venueCapacity:44383,  venueYearOpened:2006, yearFounded:1882, championships:11, venueAddressStart:'700 Clark Ave',                  colors:['#C41E3A','#0C2340','#FEDB00'] },
  { abbrev:'TB',  name:'Tampa Bay Rays',           league:'MLB', venueName:'Tropicana Field',            venueCapacity:25025,  venueYearOpened:1990, yearFounded:1998, championships:0,  venueAddressStart:'1 Tropicana Dr',                 colors:['#092C5C','#8FBCE6','#F5D130'] },
  { abbrev:'TEX', name:'Texas Rangers',            league:'MLB', venueName:'Globe Life Field',           venueCapacity:40518,  venueYearOpened:2020, yearFounded:1961, championships:1,  venueAddressStart:'734 Stadium Dr',                 colors:['#003278','#C0111F'] },
  { abbrev:'TOR', name:'Toronto Blue Jays',        league:'MLB', venueName:'Rogers Centre',              venueCapacity:49286,  venueYearOpened:1989, yearFounded:1977, championships:2,  venueAddressStart:'1 Blue Jays Way',                colors:['#134A8E','#1D2D5C','#E8291C'] },
  { abbrev:'WSH', name:'Washington Nationals',     league:'MLB', venueName:'Nationals Park',             venueCapacity:41339,  venueYearOpened:2008, yearFounded:1969, championships:1,  venueAddressStart:'1500 S Capitol St SE',           colors:['#AB0003','#14225A','#BC9B6A'] },

  // ── NBA (30) ──────────────────────────────────────────────────────────────
  { abbrev:'ATL', name:'Atlanta Hawks',            league:'NBA', venueName:'State Farm Arena',           venueCapacity:18118,  venueYearOpened:1999, yearFounded:1946, championships:1,  venueAddressStart:'1 State Farm Dr',                colors:['#E03A3E','#C1D32F','#26282A'] },
  { abbrev:'BOS', name:'Boston Celtics',           league:'NBA', venueName:'TD Garden',                  venueCapacity:19156,  venueYearOpened:1995, yearFounded:1946, championships:18, venueAddressStart:'100 Legends Way',                colors:['#007A33','#BA9653','#963821','#000000'] },
  { abbrev:'BKN', name:'Brooklyn Nets',            league:'NBA', venueName:'Barclays Center',            venueCapacity:17732,  venueYearOpened:2012, yearFounded:1967, championships:0,  venueAddressStart:'620 Atlantic Ave',               colors:['#000000','#FFFFFF'] },
  { abbrev:'CHA', name:'Charlotte Hornets',        league:'NBA', venueName:'Spectrum Center',            venueCapacity:19077,  venueYearOpened:2005, yearFounded:1988, championships:0,  venueAddressStart:'333 E Trade St',                 colors:['#1D1160','#00788C','#A1A1A4'] },
  { abbrev:'CHI', name:'Chicago Bulls',            league:'NBA', venueName:'United Center',              venueCapacity:20917,  venueYearOpened:1994, yearFounded:1966, championships:6,  venueAddressStart:'1901 W Madison St',              colors:['#CE1141','#000000'] },
  { abbrev:'CLE', name:'Cleveland Cavaliers',      league:'NBA', venueName:'Rocket Mortgage FieldHouse', venueCapacity:19432,  venueYearOpened:1994, yearFounded:1970, championships:1,  venueAddressStart:'1 Center Ct',                    colors:['#860038','#FDBB30','#002D62'] },
  { abbrev:'DAL', name:'Dallas Mavericks',         league:'NBA', venueName:'American Airlines Center',   venueCapacity:19200,  venueYearOpened:2001, yearFounded:1980, championships:1,  venueAddressStart:'2500 Victory Ave',               colors:['#00538C','#002B5E','#B8C4CA'] },
  { abbrev:'DEN', name:'Denver Nuggets',           league:'NBA', venueName:'Ball Arena',                 venueCapacity:19520,  venueYearOpened:1999, yearFounded:1967, championships:1,  venueAddressStart:'1000 Chopper Circle',            colors:['#0E2240','#FEC524','#8B2131','#1D428A'] },
  { abbrev:'DET', name:'Detroit Pistons',          league:'NBA', venueName:'Little Caesars Arena',       venueCapacity:20491,  venueYearOpened:2017, yearFounded:1941, championships:3,  venueAddressStart:'2645 Woodward Ave',              colors:['#C8102E','#1D42BA','#BEC0C2'] },
  { abbrev:'GSW', name:'Golden State Warriors',    league:'NBA', venueName:'Chase Center',               venueCapacity:18064,  venueYearOpened:2019, yearFounded:1946, championships:7,  venueAddressStart:'1 Warriors Way',                 colors:['#1D428A','#FFC72C'] },
  { abbrev:'HOU', name:'Houston Rockets',          league:'NBA', venueName:'Toyota Center',              venueCapacity:18055,  venueYearOpened:2003, yearFounded:1967, championships:2,  venueAddressStart:'1510 Polk St',                   colors:['#CE1141','#000000'] },
  { abbrev:'IND', name:'Indiana Pacers',           league:'NBA', venueName:'Gainbridge Fieldhouse',      venueCapacity:17923,  venueYearOpened:1999, yearFounded:1967, championships:0,  venueAddressStart:'125 S Pennsylvania St',          colors:['#002D62','#FDBB30','#BEC0C2'] },
  { abbrev:'LAC', name:'Los Angeles Clippers',     league:'NBA', venueName:'Intuit Dome',                venueCapacity:18000,  venueYearOpened:2024, yearFounded:1970, championships:0,  venueAddressStart:'3900 W Century Blvd',            colors:['#C8102E','#1D428A','#BEC0C2'] },
  { abbrev:'LAL', name:'Los Angeles Lakers',       league:'NBA', venueName:'Crypto.com Arena',           venueCapacity:19079,  venueYearOpened:1999, yearFounded:1947, championships:17, venueAddressStart:'1111 S Figueroa St',             colors:['#552583','#FDB927'] },
  { abbrev:'MEM', name:'Memphis Grizzlies',        league:'NBA', venueName:'FedExForum',                 venueCapacity:17794,  venueYearOpened:2004, yearFounded:1995, championships:0,  venueAddressStart:'191 Beale St',                   colors:['#5D76A9','#12173F','#F5B112','#00B2A9'] },
  { abbrev:'MIA', name:'Miami Heat',               league:'NBA', venueName:'Kaseya Center',              venueCapacity:19600,  venueYearOpened:1999, yearFounded:1988, championships:3,  venueAddressStart:'601 Biscayne Blvd',              colors:['#98002E','#F9A01B','#000000'] },
  { abbrev:'MIL', name:'Milwaukee Bucks',          league:'NBA', venueName:'Fiserv Forum',               venueCapacity:17341,  venueYearOpened:2018, yearFounded:1968, championships:2,  venueAddressStart:'1111 Vel R Phillips Ave',        colors:['#00471B','#EEE1C6','#0077C0'] },
  { abbrev:'MIN', name:'Minnesota Timberwolves',   league:'NBA', venueName:'Target Center',              venueCapacity:18978,  venueYearOpened:1990, yearFounded:1989, championships:0,  venueAddressStart:'600 First Ave N',                colors:['#0C2340','#236192','#9EA2A2','#78BE20'] },
  { abbrev:'NOP', name:'New Orleans Pelicans',     league:'NBA', venueName:'Smoothie King Center',       venueCapacity:17805,  venueYearOpened:1999, yearFounded:2002, championships:0,  venueAddressStart:'1501 Dave Dixon Dr',             colors:['#0C2340','#C8102E','#85714D'] },
  { abbrev:'NYK', name:'New York Knicks',          league:'NBA', venueName:'Madison Square Garden',      venueCapacity:19812,  venueYearOpened:1968, yearFounded:1946, championships:2,  venueAddressStart:'4 Pennsylvania Plaza',           colors:['#006BB6','#F58426','#BEC0C2'] },
  { abbrev:'OKC', name:'Oklahoma City Thunder',    league:'NBA', venueName:'Paycom Center',              venueCapacity:18203,  venueYearOpened:2002, yearFounded:2008, championships:1,  venueAddressStart:'100 W Reno Ave',                 colors:['#007AC1','#EF3B24','#002D62','#FDBB30'] },
  { abbrev:'ORL', name:'Orlando Magic',            league:'NBA', venueName:'Kia Center',                 venueCapacity:18846,  venueYearOpened:2010, yearFounded:1989, championships:0,  venueAddressStart:'400 W Church St',                colors:['#0077C0','#C4CED4','#000000'] },
  { abbrev:'PHI', name:'Philadelphia 76ers',       league:'NBA', venueName:'Wells Fargo Center',         venueCapacity:20478,  venueYearOpened:1996, yearFounded:1946, championships:3,  venueAddressStart:'3601 S Broad St',                colors:['#006BB6','#ED174C','#002B5C'] },
  { abbrev:'PHX', name:'Phoenix Suns',             league:'NBA', venueName:'Footprint Center',           venueCapacity:17071,  venueYearOpened:1992, yearFounded:1968, championships:0,  venueAddressStart:'201 E Jefferson St',             colors:['#1D1160','#E56020','#000000','#F9AD1B'] },
  { abbrev:'POR', name:'Portland Trail Blazers',   league:'NBA', venueName:'Moda Center',                venueCapacity:19393,  venueYearOpened:1995, yearFounded:1970, championships:1,  venueAddressStart:'1 N Center Court St',            colors:['#E03A3E','#000000'] },
  { abbrev:'SAC', name:'Sacramento Kings',         league:'NBA', venueName:'Golden 1 Center',            venueCapacity:17583,  venueYearOpened:2016, yearFounded:1945, championships:1,  venueAddressStart:'500 David J Stern Walk',         colors:['#5A2D81','#63727A','#000000'] },
  { abbrev:'SAS', name:'San Antonio Spurs',        league:'NBA', venueName:'Frost Bank Center',          venueCapacity:18418,  venueYearOpened:2002, yearFounded:1967, championships:5,  venueAddressStart:'1 AT&T Center Pkwy',             colors:['#C4CED4','#000000','#FFFFFF'] },
  { abbrev:'TOR', name:'Toronto Raptors',          league:'NBA', venueName:'Scotiabank Arena',           venueCapacity:19800,  venueYearOpened:1999, yearFounded:1995, championships:1,  venueAddressStart:'40 Bay St',                      colors:['#CE1141','#000000','#A1A1A4','#B4975A'] },
  { abbrev:'UTA', name:'Utah Jazz',                league:'NBA', venueName:'Delta Center',               venueCapacity:18306,  venueYearOpened:1991, yearFounded:1974, championships:0,  venueAddressStart:'301 S Temple',                   colors:['#002B5C','#00471B','#F9A01B'] },
  { abbrev:'WAS', name:'Washington Wizards',       league:'NBA', venueName:'Capital One Arena',          venueCapacity:20356,  venueYearOpened:1997, yearFounded:1961, championships:1,  venueAddressStart:'601 F St NW',                    colors:['#002B5C','#E31837','#C4CED4'] },
]
