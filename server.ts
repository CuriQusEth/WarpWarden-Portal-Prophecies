import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Global CORS Middleware (Especially for MCP Endpoint preflight OPTIONS)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // API Routes
  app.get("/api/mcp", (req, res) => {
    res.json({
      protocol: "MCP",
      version: "1.0.0",
      name: "Warden Portal MCP Endpoint",
      status: "active",
      description: "Active MCP server for Warden Portal Orchestrator Agent",
      capabilities: ["portal-management", "warden-operations", "security-mechanics", "multi-task-automation", "access-control", "mcp-command-execution"],
      timestamp: new Date().toISOString()
    });
  });

  const TOOLS = [
    {
      name: "get_race_status",
      description: "Get the current status of a race.",
      inputSchema: { type: "object", properties: { raceId: { type: "string" } }, required: ["raceId"] }
    },
    {
      name: "start_race",
      description: "Start a new race.",
      inputSchema: { type: "object", properties: { trackId: { type: "string" } }, required: ["trackId"] }
    },
    {
      name: "get_leaderboard",
      description: "Get the current leaderboard.",
      inputSchema: { type: "object", properties: { limit: { type: "number" } } }
    },
    {
      name: "optimize_speed",
      description: "Optimize speed for current conditions.",
      inputSchema: { type: "object", properties: { strategy: { type: "string" } } }
    },
    {
      name: "get_track_info",
      description: "Get information about the current track.",
      inputSchema: { type: "object", properties: { trackId: { type: "string" } }, required: ["trackId"] }
    }
  ];

  app.post("/api/mcp", (req, res) => {
    try {
      const body = req.body;

      if (body.method === 'tools/list') {
        res.json({
          jsonrpc: "2.0",
          id: body.id,
          result: { tools: TOOLS }
        });
        return;
      }

      if (body.method === 'tools/call') {
        const toolName = body.params?.name;
        const args = body.params?.arguments || {};
        res.json({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            content: [
              {
                type: "text",
                text: `Executed ${toolName} successfully with args: ${JSON.stringify(args)}`
              }
            ],
            isError: false
          }
        });
        return;
      }

      if (body.method === 'prompts/list') {
        res.json({
          jsonrpc: "2.0",
          id: body.id,
          result: { prompts: [] }
        });
        return;
      }

      if (body.method === 'resources/list') {
        res.json({
          jsonrpc: "2.0",
          id: body.id,
          result: { resources: [] }
        });
        return;
      }

      if (body.method === 'initialize') {
        res.json({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
              prompts: {},
              resources: {}
            },
            serverInfo: {
              name: "Warden Portal Orchestrator",
              version: "1.0.0"
            }
          }
        });
        return;
      }

      if (body.method === 'notifications/initialized') {
        res.json({
          jsonrpc: "2.0"
        });
        return;
      }

      res.json({
        jsonrpc: "2.0",
        id: body.id,
        error: { code: -32601, message: "Method not found" }
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid MCP request" });
    }
  });

  app.get("/api/agent", (req, res) => {
    res.json({
      name: "Warden Portal Orchestrator",
      status: "active",
      wallet: "0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B",
      platform: "Warden Portal",
      version: "1.0.0"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
