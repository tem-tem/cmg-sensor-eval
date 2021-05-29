import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState } from 'react';
import evaluateLogFile from '../src/evaluateLogFile';

export default function Home() {
  const [output, setOutput] = useState('results will replace this text');
  const [options, setOptions] = useState(false);

  const handleCheckbox = () => setOptions(!options);
  const handleFileChange = (event) => {
    const fileList = event.target.files;
    const reader = new FileReader();
    reader.onload = function(e) {
      // The file's text will be printed here
      // console.log(e.target.result);
      const fileText = e.target.result;
      let res;
      if (options) {
        res = evaluateLogFile(fileText, {
          additionalReferences: ['noise'],
          noise: {
            evaluationFunction: (values, ref) => {
              let evalRes = "keep";
              values.forEach((val) => {
                const difference = Math.abs(ref - val);
                if (difference > 10) evalRes = "discard";
              });
              return evalRes;
            }
          }
        });
      } else {
        res = evaluateLogFile(fileText);
      }

      setOutput(`${options ? '' : 'NOT '}using options: ${JSON.stringify(res)}`);
    };

    if (fileList[0]) reader.readAsText(fileList[0]);
  }
  return (
    <div >
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

        <div style={{padding: 20}}>
          <input type="file" id="file-selector" onChange={handleFileChange}/>
          <input type="checkbox" onChange={handleCheckbox} id="options"/>
          <label htmlFor="options">Use options param</label>
        </div>

      <footer className={styles.footer}>
          <pre style={{wordWrap: 'break-word', whiteSpace: 'pre-wrap', width: "100vw"}}>{output}</pre>
      </footer>
    </div>
  )
}
