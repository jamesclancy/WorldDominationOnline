import "@fontsource/roboto";
import "../styles/globals.css";
import "../styles/scss/global.scss";
import type { AppProps } from "next/app";
import { getSession, GetSessionParams, SessionProvider } from "next-auth/react";
import { SSRProvider } from "react-bootstrap";
function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SSRProvider>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </SSRProvider>
  );
}

export async function getInitialProps(ctx: any) {
  return {
    props: {
      session: await getSession(ctx),
    },
  };
}

export default App;
