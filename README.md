# WARPWARDEN

![Warpwarden Logo](https://warden-portal.vercel.app/logo.png)

**WARPWARDEN** is a strategic tower defense / guardian game built with Next.js concepts (powered by Vite/Express), TypeScript, Tailwind CSS, Canvas, and Framer Motion. As the last protector of reality, you use powerful warp technology to defend floating realms from dimensional invaders by placing Warp Towers, creating portals, and manipulating space-time.

## Features

- **Strategic Tower Defense**: Classic TD mechanics enhanced with modern space-time warping.
- **Wave System**: Survive endless waves with escalating difficulties.
- **On-chain Integration**:
  - ERC-8021 Transaction Attribution
  - ERC-8004 Trustless Agents support
  - "Say GM" via Base Network
- **Mobile First**: Fully responsive and optimized for portrait mode gameplay.

## Technology Stack

- React 19 + TypeScript
- Base Mainnet (Viem + Wagmi)
- Zustand (State Management)
- Tailwind CSS
- Express.js + Vite (Full-stack architecture)

## AI Agents & orchestration

This platform is integrated with the **Warden Portal Orchestrator** - an ERC-8004 compliant AI agent capable of portal management, operations, and multi-task automation.

### Architecture

The Agent Card definition is available at:
`/.well-known/agent-card.json`

The following Agent endpoints are exposed:
- `GET /api/agent` - Main agent control API
- `GET /api/mcp` - Model Context Protocol availability
- `POST /api/mcp` - Active command execution

---

*Defend Reality on Base. The dimensional invaders are coming.*
