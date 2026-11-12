# Installing the app on a phone (PWA)

The app is a Progressive Web App: once added to the home screen it opens full screen, with its own icon and no
browser bars. The red phone frame of the Figma frames is hidden in that mode (it only makes sense on a desktop preview).

Files: `public/manifest.webmanifest`, `public/pwa/*` (icons made from the DTU logo of the tab bar), `public/sw.js`
(minimal service worker, no cache on purpose: data must never be stale), meta tags in `index.html`, standalone styles in
`src/index.css` (`html.is-standalone` / `@media (display-mode: standalone)`), detection in `src/main.tsx`.

## Steps
1. On the PC: `npm run server` (optional, live data) and `npm run dev -- --host`. Use the "Network" address.
2. Phone on the same Wi-Fi (or the PC on the phone's hotspot if the university Wi-Fi blocks devices from each other).

### iPhone (Safari)
Open the Network address in **Safari** → Share → **Add to Home Screen** → open it from the icon.

### Android (Chrome)
Browsers only allow installing (and service workers) on **https** or **localhost**. The Network address is plain
`http://10.x.x.x:5173`, so Chrome would only create a shortcut that opens in a browser tab. For a real install:
1. In Chrome open `chrome://flags/#unsafely-treat-insecure-origin-as-secure`.
2. Add the Network address (e.g. `http://10.178.9.125:5173`), set the flag to **Enabled**, relaunch Chrome.
3. Open the address → menu ⋮ → **Install app** (or "Add to Home screen").
The flag is for testing on your own phone only. A published build on https installs without it.

## The address bar still shows in the installed app (Android)
Chrome shows the address bar in an installed app whose page is served over plain **http** (security indicator).
The flag above enables installing, but does not remove that bar, and the app code cannot hide it. Two ways around it:
1. **USB + localhost (simplest, nothing to install):** phone with USB debugging, PC Chrome → `chrome://inspect/#devices`
   → Port forwarding `5173` → `localhost:5173`. On the phone open `http://localhost:5173` and install from there.
   `localhost` counts as secure: no bar, no flag. The cable must be connected while using the app.
2. **HTTPS on the local network:** a local certificate (mkcert) trusted by the phone, and Vite on https. Needs mkcert
   on the PC and its root certificate installed on the phone once; the certificate is tied to the PC's IP.

## Notes
- The IP address changes with the network: if it changes, the installed icon points to the old address. Remove and add again.
- Live mode works in the installed app too (it talks to Vite on the PC, which forwards to the local server).
