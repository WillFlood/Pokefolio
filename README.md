# PlayersLibrary

Pokémon card discovery, set browsing, live raw-card pricing, and browser-local portfolio tracking.
Going into MTG soon...

## Run locally

PlayersLibrary requires Node.js 20 or newer and has no runtime package dependencies.

```powershell
npm.cmd start
```

Open `http://localhost:4173`. If that port is occupied, PlayersLibrary automatically tries the next available port.

For automatic restarts while editing:

```powershell
npm.cmd run dev
```

## Optional environment settings

Copy `.env.example` values into your environment when needed:

- `PORT` chooses the preferred local port.
- `POKEMONTCG_API_KEY` raises the Pokémon TCG API rate limit.

## Pricing

Raw-card prices come from TCGplayer-backed sources. Ascended Heroes, Perfect Order, Chaos Rising, and Pitch Black also use their public TCGplayer price-guide feeds, cached by the server for 15 minutes. Missing verified values display as unavailable rather than being predicted.

## Verification

```powershell
npm.cmd run check
```
