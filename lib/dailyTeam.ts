import { createClient } from '@supabase/supabase-js'
import { ALL_TEAMS, getEasternDateString, type TeamData } from './teamData'

// Reset pool when this many teams have been used (95% of 124 = 118)
const RESET_THRESHOLD = Math.ceil(ALL_TEAMS.length * 0.95)

function teamKey(t: TeamData): string {
  return `${t.abbrev}-${t.league}`
}

export async function getTodaysTeamFromDB(): Promise<TeamData> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = getEasternDateString() // YYYY-MM-DD Eastern time

  // Return today's team if already assigned
  const { data: existing } = await supabase
    .from('daily_challenges')
    .select('team_abbrev')
    .eq('date', today)
    .maybeSingle()

  if (existing?.team_abbrev) {
    const team = ALL_TEAMS.find(t => teamKey(t) === existing.team_abbrev)
    if (team) return team
  }

  // Get all previously used keys
  const { data: usedRows } = await supabase
    .from('daily_challenges')
    .select('team_abbrev')

  const usedKeys = new Set(usedRows?.map(r => r.team_abbrev as string) ?? [])

  // Build available pool
  let available = ALL_TEAMS.filter(t => !usedKeys.has(teamKey(t)))

  // Reset when threshold reached
  if (available.length === 0 || usedKeys.size >= RESET_THRESHOLD) {
    await supabase.from('daily_challenges').delete().lte('date', today)
    available = ALL_TEAMS
  }

  // Pick random team
  const team = available[Math.floor(Math.random() * available.length)]

  // Insert; ignoreDuplicates handles race conditions gracefully
  await supabase
    .from('daily_challenges')
    .upsert(
      { date: today, team_abbrev: teamKey(team) },
      { onConflict: 'date', ignoreDuplicates: true }
    )

  // Re-fetch to confirm the winner in case of a race
  const { data: final } = await supabase
    .from('daily_challenges')
    .select('team_abbrev')
    .eq('date', today)
    .maybeSingle()

  return ALL_TEAMS.find(t => teamKey(t) === final?.team_abbrev) ?? team
}
