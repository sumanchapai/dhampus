import * as React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import { Doc } from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";

interface GlobalContextType {
  network: WebrtcProvider | null;
  doc: Doc | null;
}

function useGlobalContext() {
  return React.useState({ doc: null, network: null });
}
export const GlobalContext = React.createContext<GlobalContextType | null>(
  null
);

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps): JSX.Element {
  const [globalContextValue, setGlobalContextValue] = useGlobalContext();
  const [isBrowser, setIsBrowser] = React.useState(false);
  React.useEffect(() => {
    setIsBrowser(true);
    const ydoc = new Doc();
    // Need to try what will be the effect of passing empty list of signaling servers
    const networkProvider = new WebrtcProvider(
      "himgreen-pax-viralroom-room-to-not-use",
      ydoc
    );
    setGlobalContextValue({
      network: networkProvider,
      doc: ydoc,
    });
    new IndexeddbPersistence("syn-index-db", ydoc);
  }, [setGlobalContextValue]);
  return (
    <SessionProvider session={session}>
      <GlobalContext.Provider value={globalContextValue}>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Himali Lodge | Dhampus </title>
        </Head>
        {isBrowser ? <Component {...pageProps} /> : null}
      </GlobalContext.Provider>
    </SessionProvider>
  );
}
