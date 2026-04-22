'use client'

import { useEffect, useState } from 'react'
import styles from '../home.module.css'

export function BestScoreBadge({ sportId }: { sportId: string }) {
  const [best, setBest] = useState<number | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(`sg_best_${sportId}`)
    if (stored) setBest(parseInt(stored))
  }, [sportId])

  if (best === null) return null

  return (
    <div className={styles.cardBest}>
      Beat your best of <strong>{best}</strong>
    </div>
  )
}
