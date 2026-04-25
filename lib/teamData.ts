export interface TeamData {
  abbrev:             string
  name:               string
  league:             'NHL' | 'NFL' | 'MLB' | 'NBA'
  venueName:          string
  venueCapacity:      number
  venueYearOpened:    number
  championships:      number
  venueAddressStart:  string
}

// Clue order: capacity → year opened → championships → address → league → venue name
export const CLUE_LABELS = [
  'Venue capacity',
  'Year venue opened',
  'Championships won',
  'Venue address (partial)',
  'League',
  'Venue name',
]

export function getClueValue(team: TeamData, index: number): string {
  switch (index) {
    case 0: return team.venueCapacity.toLocaleString()
    case 1: return String(team.venueYearOpened)
    case 2: return String(team.championships)
    case 3: return team.venueAddressStart
    case 4: return team.league === 'NHL' ? 'National Hockey League'
                 : team.league === 'NFL' ? 'National Football League'
                 : team.league === 'MLB' ? 'Major League Baseball'
                 :                         'National Basketball Association'
    case 5: return team.venueName
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
  { abbrev:'ANA', name:'Anaheim Ducks',           league:'NHL', venueName:'Honda Center',               venueCapacity:17174, venueYearOpened:1993, championships:1,  venueAddressStart:'2695 E Katella Ave' },
  { abbrev:'BOS', name:'Boston Bruins',            league:'NHL', venueName:'TD Garden',                  venueCapacity:17850, venueYearOpened:1995, championships:6,  venueAddressStart:'100 Legends Way' },
  { abbrev:'BUF', name:'Buffalo Sabres',           league:'NHL', venueName:'KeyBank Center',             venueCapacity:19070, venueYearOpened:1996, championships:0,  venueAddressStart:'1 Seymour H Knox III Plaza' },
  { abbrev:'CGY', name:'Calgary Flames',           league:'NHL', venueName:'Scotiabank Saddledome',      venueCapacity:19289, venueYearOpened:1983, championships:1,  venueAddressStart:'555 Saddledome Rise SE' },
  { abbrev:'CAR', name:'Carolina Hurricanes',      league:'NHL', venueName:'PNC Arena',                  venueCapacity:18680, venueYearOpened:1999, championships:1,  venueAddressStart:'1400 Edwards Mill Rd' },
  { abbrev:'CHI', name:'Chicago Blackhawks',       league:'NHL', venueName:'United Center',              venueCapacity:19717, venueYearOpened:1994, championships:6,  venueAddressStart:'1901 W Madison St' },
  { abbrev:'COL', name:'Colorado Avalanche',       league:'NHL', venueName:'Ball Arena',                 venueCapacity:18007, venueYearOpened:1999, championships:3,  venueAddressStart:'1000 Chopper Circle' },
  { abbrev:'CBJ', name:'Columbus Blue Jackets',    league:'NHL', venueName:'Nationwide Arena',           venueCapacity:19500, venueYearOpened:2000, championships:0,  venueAddressStart:'200 W Nationwide Blvd' },
  { abbrev:'DAL', name:'Dallas Stars',             league:'NHL', venueName:'American Airlines Center',   venueCapacity:18532, venueYearOpened:2001, championships:1,  venueAddressStart:'2500 Victory Ave' },
  { abbrev:'DET', name:'Detroit Red Wings',        league:'NHL', venueName:'Little Caesars Arena',       venueCapacity:19515, venueYearOpened:2017, championships:11, venueAddressStart:'2645 Woodward Ave' },
  { abbrev:'EDM', name:'Edmonton Oilers',          league:'NHL', venueName:'Rogers Place',               venueCapacity:18347, venueYearOpened:2016, championships:5,  venueAddressStart:'10220 104 Ave NW' },
  { abbrev:'FLA', name:'Florida Panthers',         league:'NHL', venueName:'Amerant Bank Arena',         venueCapacity:19250, venueYearOpened:1998, championships:1,  venueAddressStart:'1 Panther Pkwy' },
  { abbrev:'LAK', name:'Los Angeles Kings',        league:'NHL', venueName:'Crypto.com Arena',           venueCapacity:18230, venueYearOpened:1999, championships:2,  venueAddressStart:'1111 S Figueroa St' },
  { abbrev:'MIN', name:'Minnesota Wild',           league:'NHL', venueName:'Xcel Energy Center',         venueCapacity:17954, venueYearOpened:2000, championships:0,  venueAddressStart:'199 W Kellogg Blvd' },
  { abbrev:'MTL', name:'Montréal Canadiens',       league:'NHL', venueName:'Bell Centre',                venueCapacity:21302, venueYearOpened:1996, championships:24, venueAddressStart:'1909 Ave des Canadiens' },
  { abbrev:'NSH', name:'Nashville Predators',      league:'NHL', venueName:'Bridgestone Arena',          venueCapacity:17113, venueYearOpened:1996, championships:0,  venueAddressStart:'501 Broadway' },
  { abbrev:'NJD', name:'New Jersey Devils',        league:'NHL', venueName:'Prudential Center',          venueCapacity:16514, venueYearOpened:2007, championships:3,  venueAddressStart:'25 Lafayette St' },
  { abbrev:'NYI', name:'New York Islanders',       league:'NHL', venueName:'UBS Arena',                  venueCapacity:17113, venueYearOpened:2021, championships:4,  venueAddressStart:'1 UBS Arena Blvd' },
  { abbrev:'NYR', name:'New York Rangers',         league:'NHL', venueName:'Madison Square Garden',      venueCapacity:18006, venueYearOpened:1968, championships:4,  venueAddressStart:'4 Pennsylvania Plaza' },
  { abbrev:'OTT', name:'Ottawa Senators',          league:'NHL', venueName:'Canadian Tire Centre',       venueCapacity:18652, venueYearOpened:1996, championships:0,  venueAddressStart:'1000 Palladium Dr' },
  { abbrev:'PHI', name:'Philadelphia Flyers',      league:'NHL', venueName:'Wells Fargo Center',         venueCapacity:19543, venueYearOpened:1996, championships:2,  venueAddressStart:'3601 S Broad St' },
  { abbrev:'PIT', name:'Pittsburgh Penguins',      league:'NHL', venueName:'PPG Paints Arena',           venueCapacity:18387, venueYearOpened:1999, championships:5,  venueAddressStart:'1001 Fifth Ave' },
  { abbrev:'SEA', name:'Seattle Kraken',           league:'NHL', venueName:'Climate Pledge Arena',       venueCapacity:17100, venueYearOpened:2021, championships:0,  venueAddressStart:'334 1st Ave N' },
  { abbrev:'SJS', name:'San Jose Sharks',          league:'NHL', venueName:'SAP Center',                 venueCapacity:17562, venueYearOpened:1993, championships:0,  venueAddressStart:'525 W Santa Clara St' },
  { abbrev:'STL', name:'St. Louis Blues',          league:'NHL', venueName:'Enterprise Center',          venueCapacity:18096, venueYearOpened:1994, championships:1,  venueAddressStart:'1401 Clark Ave' },
  { abbrev:'TBL', name:'Tampa Bay Lightning',      league:'NHL', venueName:'Amalie Arena',               venueCapacity:19092, venueYearOpened:1996, championships:3,  venueAddressStart:'401 Channelside Dr' },
  { abbrev:'TOR', name:'Toronto Maple Leafs',      league:'NHL', venueName:'Scotiabank Arena',           venueCapacity:18819, venueYearOpened:1999, championships:13, venueAddressStart:'40 Bay St' },
  { abbrev:'UTA', name:'Utah Mammoth',              league:'NHL', venueName:'Delta Center',               venueCapacity:18306, venueYearOpened:1991, championships:0,  venueAddressStart:'301 S Temple' },
  { abbrev:'VAN', name:'Vancouver Canucks',        league:'NHL', venueName:'Rogers Arena',               venueCapacity:18910, venueYearOpened:1995, championships:0,  venueAddressStart:'800 Griffiths Way' },
  { abbrev:'VGK', name:'Vegas Golden Knights',     league:'NHL', venueName:'T-Mobile Arena',             venueCapacity:17500, venueYearOpened:2016, championships:1,  venueAddressStart:'3780 S Las Vegas Blvd' },
  { abbrev:'WSH', name:'Washington Capitals',      league:'NHL', venueName:'Capital One Arena',          venueCapacity:18573, venueYearOpened:1997, championships:1,  venueAddressStart:'601 F St NW' },
  { abbrev:'WPG', name:'Winnipeg Jets',            league:'NHL', venueName:'Canada Life Centre',         venueCapacity:15321, venueYearOpened:2004, championships:0,  venueAddressStart:'345 Graham Ave' },

  // ── NFL (32) ──────────────────────────────────────────────────────────────
  { abbrev:'ARI', name:'Arizona Cardinals',        league:'NFL', venueName:'State Farm Stadium',         venueCapacity:63400, venueYearOpened:2006, championships:0,  venueAddressStart:'1 Cardinals Dr' },
  { abbrev:'ATL', name:'Atlanta Falcons',          league:'NFL', venueName:'Mercedes-Benz Stadium',      venueCapacity:71000, venueYearOpened:2017, championships:0,  venueAddressStart:'1 AMB Dr NW' },
  { abbrev:'BAL', name:'Baltimore Ravens',         league:'NFL', venueName:'M&T Bank Stadium',           venueCapacity:71008, venueYearOpened:1998, championships:2,  venueAddressStart:'1101 Russell St' },
  { abbrev:'BUF', name:'Buffalo Bills',            league:'NFL', venueName:'Highmark Stadium',           venueCapacity:71608, venueYearOpened:1973, championships:0,  venueAddressStart:'1 Bills Dr' },
  { abbrev:'CAR', name:'Carolina Panthers',        league:'NFL', venueName:'Bank of America Stadium',    venueCapacity:74867, venueYearOpened:1996, championships:0,  venueAddressStart:'800 S Mint St' },
  { abbrev:'CHI', name:'Chicago Bears',            league:'NFL', venueName:'Soldier Field',              venueCapacity:61500, venueYearOpened:1924, championships:1,  venueAddressStart:'1410 S Museum Campus Dr' },
  { abbrev:'CIN', name:'Cincinnati Bengals',       league:'NFL', venueName:'Paycor Stadium',             venueCapacity:65515, venueYearOpened:2000, championships:0,  venueAddressStart:'1 Paycor Stadium' },
  { abbrev:'CLE', name:'Cleveland Browns',         league:'NFL', venueName:'Huntington Bank Field',      venueCapacity:67431, venueYearOpened:1999, championships:0,  venueAddressStart:'100 Alfred Lerner Way' },
  { abbrev:'DAL', name:'Dallas Cowboys',           league:'NFL', venueName:'AT&T Stadium',               venueCapacity:80000, venueYearOpened:2009, championships:5,  venueAddressStart:'1 AT&T Way' },
  { abbrev:'DEN', name:'Denver Broncos',           league:'NFL', venueName:'Empower Field at Mile High', venueCapacity:76125, venueYearOpened:2001, championships:3,  venueAddressStart:'1701 Mile High Stadium Circle' },
  { abbrev:'DET', name:'Detroit Lions',            league:'NFL', venueName:'Ford Field',                 venueCapacity:65000, venueYearOpened:2002, championships:0,  venueAddressStart:'2000 Brush St' },
  { abbrev:'GB',  name:'Green Bay Packers',        league:'NFL', venueName:'Lambeau Field',              venueCapacity:81441, venueYearOpened:1957, championships:4,  venueAddressStart:'1265 Lombardi Ave' },
  { abbrev:'HOU', name:'Houston Texans',           league:'NFL', venueName:'NRG Stadium',                venueCapacity:72220, venueYearOpened:2002, championships:0,  venueAddressStart:'1 NRG Pkwy' },
  { abbrev:'IND', name:'Indianapolis Colts',       league:'NFL', venueName:'Lucas Oil Stadium',          venueCapacity:67000, venueYearOpened:2008, championships:2,  venueAddressStart:'500 S Capitol Ave' },
  { abbrev:'JAX', name:'Jacksonville Jaguars',     league:'NFL', venueName:'EverBank Stadium',           venueCapacity:67164, venueYearOpened:1995, championships:0,  venueAddressStart:'1 EverBank Stadium Dr' },
  { abbrev:'KC',  name:'Kansas City Chiefs',       league:'NFL', venueName:'GEHA Field at Arrowhead',    venueCapacity:76416, venueYearOpened:1972, championships:4,  venueAddressStart:'1 Arrowhead Dr' },
  { abbrev:'LV',  name:'Las Vegas Raiders',        league:'NFL', venueName:'Allegiant Stadium',          venueCapacity:65000, venueYearOpened:2020, championships:3,  venueAddressStart:'3333 Al Davis Way' },
  { abbrev:'LAC', name:'Los Angeles Chargers',     league:'NFL', venueName:'SoFi Stadium',               venueCapacity:70240, venueYearOpened:2020, championships:0,  venueAddressStart:'1001 Stadium Dr' },
  { abbrev:'LAR', name:'Los Angeles Rams',         league:'NFL', venueName:'SoFi Stadium',               venueCapacity:70240, venueYearOpened:2020, championships:2,  venueAddressStart:'1001 Stadium Dr' },
  { abbrev:'MIA', name:'Miami Dolphins',           league:'NFL', venueName:'Hard Rock Stadium',          venueCapacity:64767, venueYearOpened:1987, championships:2,  venueAddressStart:'347 Don Shula Dr' },
  { abbrev:'MIN', name:'Minnesota Vikings',        league:'NFL', venueName:'U.S. Bank Stadium',          venueCapacity:66860, venueYearOpened:2016, championships:0,  venueAddressStart:'401 Chicago Ave' },
  { abbrev:'NE',  name:'New England Patriots',     league:'NFL', venueName:'Gillette Stadium',           venueCapacity:65878, venueYearOpened:2002, championships:6,  venueAddressStart:'1 Patriot Place' },
  { abbrev:'NO',  name:'New Orleans Saints',       league:'NFL', venueName:'Caesars Superdome',          venueCapacity:73208, venueYearOpened:1975, championships:1,  venueAddressStart:'1500 Sugar Bowl Dr' },
  { abbrev:'NYG', name:'New York Giants',          league:'NFL', venueName:'MetLife Stadium',            venueCapacity:82500, venueYearOpened:2010, championships:4,  venueAddressStart:'1 MetLife Stadium Dr' },
  { abbrev:'NYJ', name:'New York Jets',            league:'NFL', venueName:'MetLife Stadium',            venueCapacity:82500, venueYearOpened:2010, championships:1,  venueAddressStart:'1 MetLife Stadium Dr' },
  { abbrev:'PHI', name:'Philadelphia Eagles',      league:'NFL', venueName:'Lincoln Financial Field',    venueCapacity:69796, venueYearOpened:2003, championships:2,  venueAddressStart:'1 Lincoln Financial Field Way' },
  { abbrev:'PIT', name:'Pittsburgh Steelers',      league:'NFL', venueName:'Acrisure Stadium',           venueCapacity:68400, venueYearOpened:2001, championships:6,  venueAddressStart:'100 Art Rooney Ave' },
  { abbrev:'SF',  name:'San Francisco 49ers',      league:'NFL', venueName:"Levi's Stadium",             venueCapacity:68500, venueYearOpened:2014, championships:5,  venueAddressStart:'4900 Marie P DeBartolo Way' },
  { abbrev:'SEA', name:'Seattle Seahawks',         league:'NFL', venueName:'Lumen Field',                venueCapacity:68740, venueYearOpened:2002, championships:1,  venueAddressStart:'800 Occidental Ave S' },
  { abbrev:'TB',  name:'Tampa Bay Buccaneers',     league:'NFL', venueName:'Raymond James Stadium',      venueCapacity:65890, venueYearOpened:1998, championships:2,  venueAddressStart:'4201 N Dale Mabry Hwy' },
  { abbrev:'TEN', name:'Tennessee Titans',         league:'NFL', venueName:'Nissan Stadium',             venueCapacity:69143, venueYearOpened:1999, championships:0,  venueAddressStart:'1 Titans Way' },
  { abbrev:'WAS', name:'Washington Commanders',    league:'NFL', venueName:'Northwest Stadium',          venueCapacity:67617, venueYearOpened:1997, championships:3,  venueAddressStart:'1600 FedEx Way' },

  // ── MLB (30) ──────────────────────────────────────────────────────────────
  { abbrev:'ARI', name:'Arizona Diamondbacks',     league:'MLB', venueName:'Chase Field',                venueCapacity:48519, venueYearOpened:1998, championships:1,  venueAddressStart:'401 E Jefferson St' },
  { abbrev:'ATL', name:'Atlanta Braves',           league:'MLB', venueName:'Truist Park',                venueCapacity:41084, venueYearOpened:2017, championships:4,  venueAddressStart:'755 Battery Ave SE' },
  { abbrev:'BAL', name:'Baltimore Orioles',        league:'MLB', venueName:'Oriole Park at Camden Yards',venueCapacity:44970, venueYearOpened:1992, championships:3,  venueAddressStart:'333 W Camden St' },
  { abbrev:'BOS', name:'Boston Red Sox',           league:'MLB', venueName:'Fenway Park',                venueCapacity:37755, venueYearOpened:1912, championships:9,  venueAddressStart:'4 Jersey St' },
  { abbrev:'CHC', name:'Chicago Cubs',             league:'MLB', venueName:'Wrigley Field',              venueCapacity:41649, venueYearOpened:1914, championships:3,  venueAddressStart:'1060 W Addison St' },
  { abbrev:'CWS', name:'Chicago White Sox',        league:'MLB', venueName:'Guaranteed Rate Field',      venueCapacity:40615, venueYearOpened:1991, championships:3,  venueAddressStart:'333 W 35th St' },
  { abbrev:'CIN', name:'Cincinnati Reds',          league:'MLB', venueName:'Great American Ball Park',   venueCapacity:42319, venueYearOpened:2003, championships:5,  venueAddressStart:'100 Joe Nuxhall Way' },
  { abbrev:'CLE', name:'Cleveland Guardians',      league:'MLB', venueName:'Progressive Field',          venueCapacity:34830, venueYearOpened:1994, championships:2,  venueAddressStart:'2401 Ontario St' },
  { abbrev:'COL', name:'Colorado Rockies',         league:'MLB', venueName:'Coors Field',                venueCapacity:50144, venueYearOpened:1995, championships:0,  venueAddressStart:'2001 Blake St' },
  { abbrev:'DET', name:'Detroit Tigers',           league:'MLB', venueName:'Comerica Park',              venueCapacity:41083, venueYearOpened:2000, championships:4,  venueAddressStart:'2100 Woodward Ave' },
  { abbrev:'HOU', name:'Houston Astros',           league:'MLB', venueName:'Minute Maid Park',           venueCapacity:41168, venueYearOpened:2000, championships:2,  venueAddressStart:'501 Crawford St' },
  { abbrev:'KC',  name:'Kansas City Royals',       league:'MLB', venueName:'Kauffman Stadium',           venueCapacity:37903, venueYearOpened:1973, championships:2,  venueAddressStart:'1 Royal Way' },
  { abbrev:'LAA', name:'Los Angeles Angels',       league:'MLB', venueName:'Angel Stadium',              venueCapacity:45517, venueYearOpened:1966, championships:1,  venueAddressStart:'2000 E Gene Autry Way' },
  { abbrev:'LAD', name:'Los Angeles Dodgers',      league:'MLB', venueName:'Dodger Stadium',             venueCapacity:56000, venueYearOpened:1962, championships:7,  venueAddressStart:'1000 Vin Scully Ave' },
  { abbrev:'MIA', name:'Miami Marlins',            league:'MLB', venueName:'loanDepot Park',             venueCapacity:36742, venueYearOpened:2012, championships:2,  venueAddressStart:'501 Marlins Way' },
  { abbrev:'MIL', name:'Milwaukee Brewers',        league:'MLB', venueName:'American Family Field',      venueCapacity:41900, venueYearOpened:2001, championships:0,  venueAddressStart:'1 Brewers Way' },
  { abbrev:'MIN', name:'Minnesota Twins',          league:'MLB', venueName:'Target Field',               venueCapacity:38544, venueYearOpened:2010, championships:3,  venueAddressStart:'1 Twins Way' },
  { abbrev:'NYM', name:'New York Mets',            league:'MLB', venueName:'Citi Field',                 venueCapacity:41922, venueYearOpened:2009, championships:2,  venueAddressStart:'41 Seaver Way' },
  { abbrev:'NYY', name:'New York Yankees',         league:'MLB', venueName:'Yankee Stadium',             venueCapacity:46537, venueYearOpened:2009, championships:27, venueAddressStart:'1 E 161st St' },
  { abbrev:'OAK', name:'Athletics',                league:'MLB', venueName:'Sutter Health Park',         venueCapacity:14014, venueYearOpened:1999, championships:9,  venueAddressStart:'400 Ballpark Dr' },
  { abbrev:'PHI', name:'Philadelphia Phillies',    league:'MLB', venueName:'Citizens Bank Park',         venueCapacity:42901, venueYearOpened:2004, championships:2,  venueAddressStart:'1 Citizens Bank Way' },
  { abbrev:'PIT', name:'Pittsburgh Pirates',       league:'MLB', venueName:'PNC Park',                   venueCapacity:38747, venueYearOpened:2001, championships:5,  venueAddressStart:'115 Federal St' },
  { abbrev:'SD',  name:'San Diego Padres',         league:'MLB', venueName:'Petco Park',                 venueCapacity:40209, venueYearOpened:2004, championships:0,  venueAddressStart:'100 Park Blvd' },
  { abbrev:'SF',  name:'San Francisco Giants',     league:'MLB', venueName:'Oracle Park',                venueCapacity:41915, venueYearOpened:2000, championships:8,  venueAddressStart:'24 Willie Mays Plaza' },
  { abbrev:'SEA', name:'Seattle Mariners',         league:'MLB', venueName:'T-Mobile Park',              venueCapacity:47929, venueYearOpened:1999, championships:0,  venueAddressStart:'1250 1st Ave S' },
  { abbrev:'STL', name:'St. Louis Cardinals',      league:'MLB', venueName:'Busch Stadium',              venueCapacity:44383, venueYearOpened:2006, championships:11, venueAddressStart:'700 Clark Ave' },
  { abbrev:'TB',  name:'Tampa Bay Rays',           league:'MLB', venueName:'Tropicana Field',            venueCapacity:25025, venueYearOpened:1990, championships:0,  venueAddressStart:'1 Tropicana Dr' },
  { abbrev:'TEX', name:'Texas Rangers',            league:'MLB', venueName:'Globe Life Field',           venueCapacity:40518, venueYearOpened:2020, championships:1,  venueAddressStart:'734 Stadium Dr' },
  { abbrev:'TOR', name:'Toronto Blue Jays',        league:'MLB', venueName:'Rogers Centre',              venueCapacity:49286, venueYearOpened:1989, championships:2,  venueAddressStart:'1 Blue Jays Way' },
  { abbrev:'WSH', name:'Washington Nationals',     league:'MLB', venueName:'Nationals Park',             venueCapacity:41339, venueYearOpened:2008, championships:1,  venueAddressStart:'1500 S Capitol St SE' },

  // ── NBA (30) ──────────────────────────────────────────────────────────────
  { abbrev:'ATL', name:'Atlanta Hawks',            league:'NBA', venueName:'State Farm Arena',           venueCapacity:18118, venueYearOpened:1999, championships:1,  venueAddressStart:'1 State Farm Dr' },
  { abbrev:'BOS', name:'Boston Celtics',           league:'NBA', venueName:'TD Garden',                  venueCapacity:19156, venueYearOpened:1995, championships:18, venueAddressStart:'100 Legends Way' },
  { abbrev:'BKN', name:'Brooklyn Nets',            league:'NBA', venueName:'Barclays Center',            venueCapacity:17732, venueYearOpened:2012, championships:0,  venueAddressStart:'620 Atlantic Ave' },
  { abbrev:'CHA', name:'Charlotte Hornets',        league:'NBA', venueName:'Spectrum Center',            venueCapacity:19077, venueYearOpened:2005, championships:0,  venueAddressStart:'333 E Trade St' },
  { abbrev:'CHI', name:'Chicago Bulls',            league:'NBA', venueName:'United Center',              venueCapacity:20917, venueYearOpened:1994, championships:6,  venueAddressStart:'1901 W Madison St' },
  { abbrev:'CLE', name:'Cleveland Cavaliers',      league:'NBA', venueName:'Rocket Mortgage FieldHouse', venueCapacity:19432, venueYearOpened:1994, championships:1,  venueAddressStart:'1 Center Ct' },
  { abbrev:'DAL', name:'Dallas Mavericks',         league:'NBA', venueName:'American Airlines Center',   venueCapacity:19200, venueYearOpened:2001, championships:1,  venueAddressStart:'2500 Victory Ave' },
  { abbrev:'DEN', name:'Denver Nuggets',           league:'NBA', venueName:'Ball Arena',                 venueCapacity:19520, venueYearOpened:1999, championships:1,  venueAddressStart:'1000 Chopper Circle' },
  { abbrev:'DET', name:'Detroit Pistons',          league:'NBA', venueName:'Little Caesars Arena',       venueCapacity:20491, venueYearOpened:2017, championships:3,  venueAddressStart:'2645 Woodward Ave' },
  { abbrev:'GSW', name:'Golden State Warriors',    league:'NBA', venueName:'Chase Center',               venueCapacity:18064, venueYearOpened:2019, championships:7,  venueAddressStart:'1 Warriors Way' },
  { abbrev:'HOU', name:'Houston Rockets',          league:'NBA', venueName:'Toyota Center',              venueCapacity:18055, venueYearOpened:2003, championships:2,  venueAddressStart:'1510 Polk St' },
  { abbrev:'IND', name:'Indiana Pacers',           league:'NBA', venueName:'Gainbridge Fieldhouse',      venueCapacity:17923, venueYearOpened:1999, championships:0,  venueAddressStart:'125 S Pennsylvania St' },
  { abbrev:'LAC', name:'Los Angeles Clippers',     league:'NBA', venueName:'Intuit Dome',                venueCapacity:18000, venueYearOpened:2024, championships:0,  venueAddressStart:'3900 W Century Blvd' },
  { abbrev:'LAL', name:'Los Angeles Lakers',       league:'NBA', venueName:'Crypto.com Arena',           venueCapacity:19079, venueYearOpened:1999, championships:17, venueAddressStart:'1111 S Figueroa St' },
  { abbrev:'MEM', name:'Memphis Grizzlies',        league:'NBA', venueName:'FedExForum',                 venueCapacity:17794, venueYearOpened:2004, championships:0,  venueAddressStart:'191 Beale St' },
  { abbrev:'MIA', name:'Miami Heat',               league:'NBA', venueName:'Kaseya Center',              venueCapacity:19600, venueYearOpened:1999, championships:3,  venueAddressStart:'601 Biscayne Blvd' },
  { abbrev:'MIL', name:'Milwaukee Bucks',          league:'NBA', venueName:'Fiserv Forum',               venueCapacity:17341, venueYearOpened:2018, championships:2,  venueAddressStart:'1111 Vel R Phillips Ave' },
  { abbrev:'MIN', name:'Minnesota Timberwolves',   league:'NBA', venueName:'Target Center',              venueCapacity:18978, venueYearOpened:1990, championships:0,  venueAddressStart:'600 First Ave N' },
  { abbrev:'NOP', name:'New Orleans Pelicans',     league:'NBA', venueName:'Smoothie King Center',       venueCapacity:17805, venueYearOpened:1999, championships:0,  venueAddressStart:'1501 Dave Dixon Dr' },
  { abbrev:'NYK', name:'New York Knicks',          league:'NBA', venueName:'Madison Square Garden',      venueCapacity:19812, venueYearOpened:1968, championships:2,  venueAddressStart:'4 Pennsylvania Plaza' },
  { abbrev:'OKC', name:'Oklahoma City Thunder',    league:'NBA', venueName:'Paycom Center',              venueCapacity:18203, venueYearOpened:2002, championships:1,  venueAddressStart:'100 W Reno Ave' },
  { abbrev:'ORL', name:'Orlando Magic',            league:'NBA', venueName:'Kia Center',                 venueCapacity:18846, venueYearOpened:2010, championships:0,  venueAddressStart:'400 W Church St' },
  { abbrev:'PHI', name:'Philadelphia 76ers',       league:'NBA', venueName:'Wells Fargo Center',         venueCapacity:20478, venueYearOpened:1996, championships:3,  venueAddressStart:'3601 S Broad St' },
  { abbrev:'PHX', name:'Phoenix Suns',             league:'NBA', venueName:'Footprint Center',           venueCapacity:17071, venueYearOpened:1992, championships:0,  venueAddressStart:'201 E Jefferson St' },
  { abbrev:'POR', name:'Portland Trail Blazers',   league:'NBA', venueName:'Moda Center',                venueCapacity:19393, venueYearOpened:1995, championships:1,  venueAddressStart:'1 N Center Court St' },
  { abbrev:'SAC', name:'Sacramento Kings',         league:'NBA', venueName:'Golden 1 Center',            venueCapacity:17583, venueYearOpened:2016, championships:1,  venueAddressStart:'500 David J Stern Walk' },
  { abbrev:'SAS', name:'San Antonio Spurs',        league:'NBA', venueName:'Frost Bank Center',          venueCapacity:18418, venueYearOpened:2002, championships:5,  venueAddressStart:'1 AT&T Center Pkwy' },
  { abbrev:'TOR', name:'Toronto Raptors',          league:'NBA', venueName:'Scotiabank Arena',           venueCapacity:19800, venueYearOpened:1999, championships:1,  venueAddressStart:'40 Bay St' },
  { abbrev:'UTA', name:'Utah Jazz',                league:'NBA', venueName:'Delta Center',               venueCapacity:18306, venueYearOpened:1991, championships:0,  venueAddressStart:'301 S Temple' },
  { abbrev:'WAS', name:'Washington Wizards',       league:'NBA', venueName:'Capital One Arena',          venueCapacity:20356, venueYearOpened:1997, championships:1,  venueAddressStart:'601 F St NW' },
]
