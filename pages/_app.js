import Head from 'next/head';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Применяем сохранённую тему при загрузке
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    }
  }, []);

  return (
    <>
      <Head>
        <title>FIB Forms</title>
        <meta name="description" content="Система подачи заявок Орг.FIB" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <style jsx global>{`
        :root {
          --bg: #0a0a0a;
          --bg-secondary: #161616;
          --bg-tertiary: #222222;
          --text: #ffffff;
          --text-secondary: #aaaaaa;
          --border: #333333;
          --card-bg: #161616;
          --button-bg: #ffffff;
          --button-text: #000000;
        }

        .light {
          --bg: #f5f5f5;
          --bg-secondary: #ffffff;
          --bg-tertiary: #eeeeee;
          --text: #111111;
          --text-secondary: #555555;
          --border: #dddddd;
          --card-bg: #ffffff;
          --button-bg: #111111;
          --button-text: #ffffff;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background: var(--bg);
          color: var(--text);
          transition: background 0.3s, color 0.3s;
        }

        input, textarea, button {
          font-family: inherit;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
