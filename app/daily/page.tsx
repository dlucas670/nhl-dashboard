'use client'

import { useEffect, useState } from 'react'
import { getChallengeNumber, getTodaysTeam, type TeamData } from '@/lib/teamData'
import DailyGame from './DailyGame'
import styles from './daily.module.css'

export default function DailyPage() {
  const [team, setTeam] = useState<TeamData | null>(null)
  const [challengeNum, setChallengeNum] = useState(0)

  useEffect(() => {
    setChallengeNum(getChallengeNumber())
    fetch('/api/daily-team')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.name) setTeam(data as TeamData)
        else setTeam(getTodaysTeam())
      })
      .catch(() => setTeam(getTodaysTeam()))
  }, [])

  if (!team) return <div className={styles.page} />

  return <DailyGame team={team} challengeNum={challengeNum} />
}
