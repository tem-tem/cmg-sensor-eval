import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState } from 'react';
import evaluateLogFile from '../src/evaluateLogFile';

export default function Home() {
  const [output, setOutput] = useState('results will replace this text')

  const handleFileChange = (event) => {
    const fileList = event.target.files;
    const reader = new FileReader();
    reader.onload = function(e) {
      // The file's text will be printed here
      // console.log(e.target.result);
      const fileText = e.target.result;
      const res = evaluateLogFile(fileText);
      setOutput(JSON.stringify(res));
    };

    reader.readAsText(fileList[0]);
  }
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
          <input type="file" id="file-selector" onChange={handleFileChange}/>
          <pre>{output}</pre>
        </div>
      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  )
}
