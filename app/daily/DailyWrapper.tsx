'use client'

import dynamicImport from 'next/dynamic'
import type { TeamData } from '@/lib/teamData'
import styles from './daily.module.css'

const DailyGame = dynamicImport(() => import('./DailyGame'), {
  ssr: false,
  loading: () => (
    <div className={styles.page}>
      <div className={styles.app} style={{ paddingTop: '3rem', textAlign: 'center', color: '#555' }}>
        Loading…
      </div>
    </div>
  ),
})

interface Props {
  team: TeamData
  challengeNum: number
}

export default function DailyWrapper({ team, challengeNum }: Props) {
  return <DailyGame team={team} challengeNum={challengeNum} />
}
