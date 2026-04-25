import Link from 'next/link'
import Image from 'next/image'
import styles from './home.module.css'
import { BestScoreBadge } from './components/BestScoreBadge'

const MODES = [
  {
    id: 'nhl',
    label: 'NHL',
    sport: 'National Hockey League',
    description: 'Assign 2025/26 NHL teams to stat categories — goals, power play, penalty kill, and more. How well do you know the league?',
    categories: ['Wins', 'Goals For/G', 'Goals Against/G', 'Power Play %', 'Penalty Kill %', 'Shots For/G'],
    teams: 32,
  },
  {
    id: 'nfl',
    label: 'NFL',
    sport: 'National Football League',
    description: 'Place 2025 NFL teams across six offensive and defensive stat categories. Points, yards, passing and rushing.',
    categories: ['Wins', 'Points For/G', 'Points Against/G', 'Total Yards/G', 'Pass Yards/G', 'Rush Yards/G'],
    teams: 32,
  },
  {
    id: 'mlb',
    label: 'MLB',
    sport: 'Major League Baseball',
    description: 'Sort 2025 MLB clubs by pitching, hitting, and fielding — ERA, batting average, errors per game, and home runs.',
    categories: ['Wins', 'Runs/G', 'ERA', 'Batting Avg', 'Errors/G', 'Home Runs/G'],
    teams: 30,
  },
  {
    id: 'nba',
    label: 'NBA',
    sport: 'National Basketball Assoc.',
    description: 'Rank 2025-26 NBA teams across six categories covering scoring, turnovers, rebounding, and shooting.',
    categories: ['Wins', 'Points/G', 'Rebounds/G', 'Assists/G', '3-Point %', 'Turnovers/G'],
    teams: 30,
  },
]

export default function HomePage() {
  return (
    <main className={styles.main}>

      <section className={styles.hero}>
        <Image
          src="/stat_grinder_logo.svg"
          alt="Stat Grinder"
          width={600}
          height={200}
          className={styles.heroLogo}
          priority
        />
        <p className={styles.heroTagline}>Sports Analytics Trivia</p>
        <p className={styles.heroDesc}>
          A team is revealed. Six stat categories wait. Assign each team to the category where you think they rank — lowest total score wins.
        </p>
      </section>

      <section className={styles.howto}>
        <div className={styles.howtoGrid}>
          <div className={styles.step}>
            <div className={styles.stepNum}>1</div>
            <div className={styles.stepText}>A random team from the league is drawn</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>2</div>
            <div className={styles.stepText}>Assign that team to one of six stat categories</div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>3</div>
            <div className={styles.stepText}>Repeat until all categories are filled — lowest rank total wins</div>
          </div>
        </div>
      </section>

      {/* Daily Challenge */}
      <section className={styles.daily}>
        <div className={styles.dailyInner}>
          <div className={styles.dailyLeft}>
            <div className={styles.dailyBadge}>NEW DAILY MODE</div>
            <h2 className={styles.dailyTitle}>The Daily Grind</h2>
            <p className={styles.dailyDesc}>
              Six clues. One team. All four leagues. Guess with fewer clues for a higher score — then share your result. A new grind every day.
            </p>
          </div>
          <Link href="/daily" className={styles.dailyBtn}>
            Play today&rsquo;s grind →
          </Link>
        </div>
      </section>

      <section className={styles.modes}>
        <h2 className={styles.sectionTitle}>SELECT A LEAGUE</h2>
        <div className={styles.grid}>
          {MODES.map(mode => (
            <Link key={mode.id} href={`/game?sport=${mode.id}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{mode.label}</span>
                <span className={styles.cardTeams}>{mode.teams} teams</span>
              </div>
              <div className={styles.cardSport}>{mode.sport}</div>
              <p className={styles.cardDesc}>{mode.description}</p>
              <div className={styles.cardCats}>
                {mode.categories.map(cat => (
                  <span key={cat} className={styles.cat}>{cat}</span>
                ))}
              </div>
              <BestScoreBadge sportId={mode.id} />
              <div className={styles.cardCta}>
                Play {mode.label} <span className={styles.arrow}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}
