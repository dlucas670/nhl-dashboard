'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header style={{
      background: '#0d0d10',
      borderBottom: '0.5px solid #232329',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '0 1.5rem',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
          <Image
            src="/stat_grinder_logo.svg"
            alt="Stat Grinder"
            width={160}
            height={53}
            priority
          />
        </Link>
      </div>
    </header>
  )
}
