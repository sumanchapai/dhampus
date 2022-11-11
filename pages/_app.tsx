import * as React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import { Doc, Map as yMap } from "yjs";
import { WebrtcProvider } from "y-webrtc";
import "../styles/globals.css";
import { IndexeddbPersistence } from "y-indexeddb";
import { SessionProvider } from "next-auth/react";

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
  const [room, _] = React.useState("default-room-to-not-use");
  React.useEffect(() => {
    setIsBrowser(true);
    const ydoc = new Doc();
    const networkProvider = new WebrtcProvider(room, ydoc);
    setGlobalContextValue({
      network: networkProvider,
      doc: ydoc,
    });
    new IndexeddbPersistence("syn-index-db", ydoc);
  }, []);
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
