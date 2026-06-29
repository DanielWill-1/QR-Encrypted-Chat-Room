#  GhostLink — Ephemeral P2P Encrypted Chat ( WIP )

Privacy-first, browser-to-browser messaging with zero accounts, zero servers, and zero persistence. Create a session, share a QR code, and chat directly over WebRTC DataChannels with end-to-end encryption via Web Crypto.

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Zustand](https://img.shields.io/badge/Zustand-5-8B5CF6)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)
![WebRTC](https://img.shields.io/badge/WebRTC-DataChannels-333333?logo=webrtc)
![MIT License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Active-brightgreen)

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite 6](https://vitejs.dev/) |
| Styling | [TailwindCSS 4](https://tailwindcss.com/) |
| State | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| Schema | [Zod](https://zod.dev/) |
| E2E Encryption | [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) — AES-GCM-256, ECDH P-256, HKDF-SHA-256 |
| Transport | [WebRTC DataChannels](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) |
| Signaling | Optional WebSocket server (`ws`), manual copy-paste fallback |
| QR | [`qrcode`](https://www.npmjs.com/package/qrcode) generation + manual invite strings |
| Testing | [Vitest](https://vitest.dev/) + [jsdom](https://github.com/jsdom/jsdom) |

---

##  How It Works

1. **Create a session** — the app generates an ephemeral ECDH key pair and invitation.
2. **Share the QR code** — the joining peer scans or pastes the invite string.
3. **WebRTC handshake** — peers exchange signaling (optional server or manual copy-paste).
4. **Cryptographic authentication** — `JOIN`/`WELCOME` exchange derives shared secret + directional AEAD keys.
5. **Encrypted chat** — every message/typing/file packet is AES-GCM encrypted before leaving your browser.
6. **Destroy & vanish** — closing or destroying a session wipes all state from memory.

**The optional signaling server never sees plaintext.** Application-layer encryption protects content end to end.

---

##  Setup

```bash
git clone https://github.com/DanielWill-1/QR-Encrypted-Chat-Room
cd QR-Encrypted-Chat-Room
npm install
```

### Development

```bash
# Start the optional signaling server (WebSocket on localhost:3001)
npm run signaling

# Start the Vite dev server (HTTPS recommended for WebRTC testing)
npm run dev
```

### Production Build

```bash
npm run build     # outputs static files to dist/
npm run preview   # preview the production build locally
```

Deploy `dist/` to any static host (GitHub Pages, Netlify, Cloudflare Pages, Nginx, etc.).

---

##  Project Structure

```
src/
  App.tsx                    # Root app with view routing
  main.tsx                   # Entry point (StrictMode + ErrorBoundary)
  components/
    chat/                    # ChatView, MessageTimeline, MessageBubble, MessageComposer, ChatHeader
    sessions/                # SessionGrid, SessionCard, JoinSessionView
    layout/                  # AppShell, Sidebar, MobileNav
    qr/                      # QR generation and scanning
    peers/                   # Connected peer list
    logs/                    # Security audit log
    settings/                # Settings view
    common/                  # Shared UI primitives (Button, Toast, ErrorBoundary, MaterialIcon)
  hooks/                     # useChat, useSessions, useView, useConnectionStatus, useQrScanner, useTheme
  state/
    store.ts                 # Zustand store (sessions, config, toasts, audit log)
    actions.ts               # createSession, joinSession, sendMessage, destroySession
    sessionReducer.ts        # State machine transitions
  lib/
    crypto/                  # ECDH key generation, HKDF, AEAD encrypt/decrypt
    protocol/                # Packet schemas, invite encode/decode, checksum
    transport/               # WebRTC adapter, signaling, TransportManager
    qr/                      # QR encode/decode, invite payloads
    utils/                   # base64url, ID generation, timestamps
  config/
    constants.ts             # Protocol constants, limits, RTC config
  types/                     # TypeScript type definitions (sessions, packets, app state)
tests/                       # Vitest test suite
signaling-server/            # Optional WebSocket signaling server
```

---

## 🧩 Features

- [x] **Create & join sessions** via QR code or manual invite string
- [x] **End-to-end encrypted text messaging** (AES-GCM-256)
- [x] **Typing indicators** (rate-limited, auto-expiring)
- [x] **Ping/pong latency measurement**
- [x] **Explicit session destruction** with peer notification
- [x] **Multiple simultaneous sessions** (up to 8)
- [x] **Dark/light theme** with system preference detection
- [x] **Responsive UI** (mobile, tablet, desktop)
- [x] **Keyboard accessible** with visible focus indicators
- [x] **Security audit log** (in-memory)
- [x] **Memory-only state** — no localStorage, no IndexedDB, no cookies
- [x] **Zod schema validation** on all parsed inputs
- [ ] File and image transfer (planned)
- [ ] QR camera scanning (planned)

---

##  Protocol

| Detail | Value |
|---|---|
| Protocol ID | `ep2p-chat` |
| QR version | 1 |
| Packet version | 1 |
| Session ID | 128-bit random |
| Handshake nonce | 128-bit random |
| Invite TTL | 10 minutes |
| Max text payload | 16 KiB |
| Max image | 20 MiB |
| Max file | 100 MiB |
| Max sessions | 8 |

Full protocol specification, threat model, and cryptographic details are in [MASTER_TECHNICAL_DESIGN.md](./MASTER_TECHNICAL_DESIGN.md).

---

## Running Tests

```bash
npm test              # single run
npm run test:watch    # watch mode
npm run lint          # TypeScript type-check
```

---

##  Contributing

Pull requests are welcome. Please read [MASTER_TECHNICAL_DESIGN.md](./MASTER_TECHNICAL_DESIGN.md) for architectural context before contributing protocol, crypto, or networking changes.

---

## License

MIT — see [LICENSE](./LICENSE) for details.
