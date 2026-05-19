// @ts-nocheck
export default function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      name: "Warden Portal Orchestrator",
      status: "active",
      wallet: "0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B",
      platform: "Warden Portal",
      version: "1.0.0"
    });
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      return res.status(200).json({
        status: "success",
        message: "Agent ping received normally",
        agent: "Warden Portal Orchestrator",
        receivedAt: new Date().toISOString(),
        payload: body
      });
    } catch (error) {
      return res.status(400).json({ error: "Invalid Agent Ping Request" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
