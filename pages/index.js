import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
        </h1>

        <p className={styles.description}>
        </p>

        <div className={styles.grid}>
        </div>
      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  )
}
