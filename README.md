# WARPWARDEN: Warden Portal Orchestrator

![Warpwarden Logo](https://warden-portal.vercel.app/logo.png)

**Warden Portal Orchestrator / WARPWARDEN** is an integrated strategic tower defense / guardian game and an ERC-8004 compliant AI Agent orchestrator. Running on the Warden Portal platform, it is designed for portal management, warden operations, security mechanics, and multi-task automation.

As the last protector of reality, use powerful warp technology to defend floating realms from dimensional invaders by placing Warp Towers, creating portals, and manipulating space-time.

## Features & Capabilities

- **Active Model Context Protocol (MCP)**: Full support for remote tool and AI agent command execution.
- **Agent-to-Agent (A2A)**: Communication-ready interface.
- **Strategic Tower Defense**: Classic TD mechanics scaled entirely on high-performance Canvas.
- **Agent Capabilities**: 
  - `portal-management`
  - `warden-operations`
  - `security-mechanics`
  - `multi-task-automation`
  - `access-control`
  - `mcp-command-execution`

## Technology Stack

- **Frontend Framework**: Next.js 14 App Router, React 19, TypeScript
- **Styling & Animation**: Tailwind CSS, Framer Motion
- **Web3 Ecosystem**: Base Network, Viem, Wagmi
- **State Management**: Zustand
- **Graphics**: HTML5 Canvas Rendering

## Agent Registration & Services

This decentralized trustless AI agent is formally registered adhering to EIP-8004 format:

- **Agent Registration Profile**: `/.well-known/agent-card.json`
- **MCP Server Endpoint**: `/api/mcp`
- **Agent Identity Endpoint**: `/api/agent`

## MCP (Model Context Protocol) Connection Guide

The Warden Portal orchestrator acts as a remote MCP server capable of acting upon standard AI commands. It is configured to run serverlessly through the Next.js App Router format, supporting CORS.

1. Issue a `POST` request directly to `https://warden-portal.vercel.app/api/mcp`.
2. Include the corresponding initialization method and payloads (e.g. `{"method": "tools/list"}`).
3. Currently Available Demo MCP Tools:
   - `get_race_status`
   - `start_race`
   - `get_leaderboard`
   - `optimize_speed`
   - `get_track_info`

## How to Run Locally

1. Clone this repository to your local environment.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Boot the local development server:
   ```bash
   npm run dev
   ```
4. Access the game and AI Agent endpoints via your local host port interface.
