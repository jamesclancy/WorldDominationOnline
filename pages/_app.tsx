import "@fontsource/news-cycle"
import "../styles/globals.css";
import '../styles/scss/global.scss' 
import type { AppProps } from "next/app";
import { getSession, GetSessionParams, SessionProvider } from "next-auth/react";
function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export async function getInitialProps (ctx: any) {
  return {
    props: {
      session: await getSession(ctx)
    }
  }
}

export default App;
