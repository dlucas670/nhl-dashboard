import { NextResponse } from 'next/server'
import { getTodaysTeamFromDB } from '@/lib/dailyTeam'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const team = await getTodaysTeamFromDB()
    return NextResponse.json(team)
  } catch (e) {
    console.error('daily-team route error:', e)
    return NextResponse.json({ error: 'Failed to load team' }, { status: 500 })
  }
}
