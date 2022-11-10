import * as React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import { Doc, Map as yMap } from "yjs";
import { WebrtcProvider } from "y-webrtc";
import "../styles/globals.css";
import { IndexeddbPersistence } from "y-indexeddb";

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

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const [globalContextValue, setGlobalContextValue] = useGlobalContext();
  const [isBrowser, setIsBrowser] = React.useState(false);
  React.useEffect(() => {
    setIsBrowser(true);
    const ydoc = new Doc();
    const networkProvider = new WebrtcProvider("syn-global-room", ydoc);
    setGlobalContextValue({ network: networkProvider, doc: ydoc });
    new IndexeddbPersistence("syn-index-db", ydoc);
  }, []);
  return (
    <GlobalContext.Provider value={globalContextValue}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Himali Lodge | Dhampus </title>
      </Head>
      {isBrowser ? <Component {...pageProps} /> : null}
    </GlobalContext.Provider>
  );
}
