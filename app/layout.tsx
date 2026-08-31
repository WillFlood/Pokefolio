import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"PlayersLibrary — Collect smarter",description:"Live Pokémon raw-card market data and portfolio tracking.",robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><head><link rel="stylesheet" href="/styles.css"/></head><body>{children}</body></html>}
