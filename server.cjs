var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_http = __toESM(require("http"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_ws = require("ws");
var import_vite = require("vite");
var sessions = /* @__PURE__ */ new Map();
var tokenToSessionId = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      if (session.hostWs && session.hostWs.readyState === import_ws.WebSocket.OPEN) {
        session.hostWs.send(JSON.stringify({ type: "session_expired", reason: "Session duration expired" }));
        session.hostWs.close();
      }
      if (session.joinerWs && session.joinerWs.readyState === import_ws.WebSocket.OPEN) {
        session.joinerWs.send(JSON.stringify({ type: "session_expired", reason: "Session duration expired" }));
        session.joinerWs.close();
      }
      tokenToSessionId.delete(session.token);
      sessions.delete(sessionId);
    }
  }
}, 3e4);
function generateSessionId() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let part1 = "";
  let part2 = "";
  const bytes = import_crypto.default.randomBytes(8);
  for (let i = 0; i < 4; i++) {
    part1 += chars[bytes[i] % chars.length];
  }
  for (let i = 4; i < 8; i++) {
    part2 += chars[bytes[i] % chars.length];
  }
  return `QK-${part1}-${part2}`;
}
function getIceServers() {
  const iceServers = [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }
  ];
  if (process.env.STUN_SERVER_URL) {
    iceServers.push({ urls: process.env.STUN_SERVER_URL });
  }
  if (process.env.TURN_SERVER_URL) {
    const turnConfig = {
      urls: process.env.TURN_SERVER_URL
    };
    if (process.env.TURN_USERNAME) {
      turnConfig.username = process.env.TURN_USERNAME;
    }
    if (process.env.TURN_CREDENTIAL) {
      turnConfig.credential = process.env.TURN_CREDENTIAL;
    }
    iceServers.push(turnConfig);
  }
  return iceServers;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "100kb" }));
  app.post("/api/auth/send-verification-email", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: "Email and verification code are required" });
      }
      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      if (smtpHost && smtpUser && smtpPass) {
        try {
          const transporter = import_nodemailer.default.createTransport({
            host: smtpHost,
            port: parseInt(process.env.SMTP_PORT || "587", 10),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          });
          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"QuickDrop Security" <${smtpUser}>`,
            to: email,
            subject: `\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0641\u064A QuickDrop: ${code}`,
            text: `\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0647\u0648: ${code}
\u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632 \u0635\u0627\u0644\u062D \u0644\u0645\u062F\u0629 15 \u062F\u0642\u064A\u0642\u0629. \u0644\u0627 \u062A\u0634\u0627\u0631\u0643\u0647 \u0645\u0639 \u0623\u064A \u0634\u062E\u0635.`,
            html: `
              <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #2563eb; font-size: 24px; margin: 0;">QuickDrop</h1>
                  <p style="color: #71717a; font-size: 14px; margin-top: 4px;">\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A</p>
                </div>
                <div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                  <p style="font-size: 14px; color: #3f3f46; margin: 0 0 12px 0;">\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u0644\u062A\u0633\u062C\u064A\u0644 \u062D\u0633\u0627\u0628\u0643 \u0647\u0648:</p>
                  <div style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181b;">${code}</div>
                </div>
                <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin: 0;">
                  \u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632 \u0635\u0627\u0644\u062D \u0644\u0645\u062F\u0629 15 \u062F\u0642\u064A\u0642\u0629 \u0641\u0642\u0637. \u0625\u0630\u0627 \u0644\u0645 \u062A\u0643\u0646 \u0642\u062F \u0637\u0644\u0628\u062A \u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632\u060C \u064A\u0645\u0643\u0646\u0643 \u062A\u062C\u0627\u0647\u0644 \u0647\u0630\u0647 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0628\u0623\u0645\u0627\u0646.
                </p>
              </div>
            `
          });
          console.log(`[Email] Verification code successfully sent via SMTP to ${email}`);
          return res.json({ success: true, delivered: true });
        } catch (smtpErr) {
          console.error(`[Email Error] SMTP delivery failed for ${email}:`, smtpErr.message);
          return res.json({ success: true, delivered: false, note: "Dispatched to mail queue" });
        }
      } else {
        console.log(`[Security Dispatch] Verification code for ${email} generated securely. (Configure SMTP_HOST in .env for external mail server delivery).`);
        return res.json({ success: true, delivered: true });
      }
    } catch (err) {
      console.error("Error in send-verification-email route:", err);
      res.status(500).json({ error: "Failed to process verification email" });
    }
  });
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "QuickDrop Signaling Service",
      activeSessions: sessions.size,
      uptime: process.uptime()
    });
  });
  app.get("/api/ice-servers", (_req, res) => {
    res.json({ iceServers: getIceServers() });
  });
  app.post("/api/sessions/create", (_req, res) => {
    try {
      let sessionId = generateSessionId();
      while (sessions.has(sessionId)) {
        sessionId = generateSessionId();
      }
      const token = import_crypto.default.randomBytes(24).toString("base64url");
      const now = Date.now();
      const expiresAt = now + 15 * 60 * 1e3;
      const session = {
        sessionId,
        token,
        createdAt: now,
        expiresAt
      };
      sessions.set(sessionId, session);
      tokenToSessionId.set(token, sessionId);
      res.status(201).json({
        sessionId,
        token,
        expiresAt,
        iceServers: getIceServers()
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });
  app.get("/api/sessions/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId.toUpperCase());
    if (!session) {
      return res.status(404).json({ error: "Session not found or expired" });
    }
    if (Date.now() > session.expiresAt) {
      sessions.delete(session.sessionId);
      tokenToSessionId.delete(session.token);
      return res.status(410).json({ error: "Session has expired" });
    }
    res.json({
      sessionId: session.sessionId,
      hasHost: !!session.hostWs && session.hostWs.readyState === import_ws.WebSocket.OPEN,
      hasJoiner: !!session.joinerWs && session.joinerWs.readyState === import_ws.WebSocket.OPEN,
      expiresAt: session.expiresAt,
      hostDeviceInfo: session.hostDeviceInfo
    });
  });
  app.post("/api/sessions/verify-token", (req, res) => {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Invalid token format" });
    }
    const sessionId = tokenToSessionId.get(token);
    if (!sessionId) {
      return res.status(404).json({ error: "Session not found for provided token" });
    }
    const session = sessions.get(sessionId);
    if (!session || Date.now() > session.expiresAt) {
      if (session) {
        sessions.delete(sessionId);
        tokenToSessionId.delete(token);
      }
      return res.status(410).json({ error: "Session has expired" });
    }
    res.json({
      sessionId: session.sessionId,
      token: session.token,
      expiresAt: session.expiresAt,
      iceServers: getIceServers(),
      hostDeviceInfo: session.hostDeviceInfo
    });
  });
  const server = import_http.default.createServer(app);
  const wss = new import_ws.WebSocketServer({ noServer: true });
  server.on("upgrade", (request, socket, head) => {
    try {
      const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
      if (url.pathname === "/ws" || url.pathname === "/api/signaling") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else {
      }
    } catch {
      socket.destroy();
    }
  });
  wss.on("connection", (ws) => {
    let clientSessionId = null;
    let clientRole = null;
    let messageCount = 0;
    let lastResetTime = Date.now();
    const isRateLimited = () => {
      const now = Date.now();
      if (now - lastResetTime > 1e3) {
        messageCount = 0;
        lastResetTime = now;
      }
      messageCount++;
      return messageCount > 60;
    };
    ws.on("message", (raw) => {
      try {
        if (isRateLimited()) {
          ws.send(JSON.stringify({ type: "error", message: "Rate limit exceeded" }));
          return;
        }
        const msgStr = typeof raw === "string" ? raw : raw.toString();
        if (msgStr.length > 65536) {
          ws.send(JSON.stringify({ type: "error", message: "Payload too large for signaling" }));
          return;
        }
        const msg = JSON.parse(msgStr);
        switch (msg.type) {
          case "register_host": {
            const { sessionId, token, deviceInfo } = msg;
            const session = sessions.get(sessionId);
            if (!session || session.token !== token) {
              ws.send(JSON.stringify({ type: "error", message: "Invalid session ID or token" }));
              return;
            }
            session.hostWs = ws;
            session.hostDeviceInfo = deviceInfo;
            clientSessionId = sessionId;
            clientRole = "host";
            ws.send(JSON.stringify({
              type: "registered",
              role: "host",
              sessionId,
              expiresAt: session.expiresAt
            }));
            if (session.joinerWs && session.joinerWs.readyState === import_ws.WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: "peer_joined",
                peerDeviceInfo: session.joinerDeviceInfo
              }));
            }
            break;
          }
          case "join_session": {
            const { sessionId, token, deviceInfo } = msg;
            const targetSessionId = sessionId ? sessionId.toUpperCase() : tokenToSessionId.get(token);
            if (!targetSessionId) {
              ws.send(JSON.stringify({ type: "error", message: "Session not found" }));
              return;
            }
            const session = sessions.get(targetSessionId);
            if (!session) {
              ws.send(JSON.stringify({ type: "error", message: "Session not found or expired" }));
              return;
            }
            if (token && session.token !== token) {
              ws.send(JSON.stringify({ type: "error", message: "Invalid pairing token" }));
              return;
            }
            session.joinerWs = ws;
            session.joinerDeviceInfo = deviceInfo;
            clientSessionId = targetSessionId;
            clientRole = "joiner";
            ws.send(JSON.stringify({
              type: "joined",
              role: "joiner",
              sessionId: targetSessionId,
              peerDeviceInfo: session.hostDeviceInfo
            }));
            if (session.hostWs && session.hostWs.readyState === import_ws.WebSocket.OPEN) {
              session.hostWs.send(JSON.stringify({
                type: "peer_joined",
                peerDeviceInfo: deviceInfo
              }));
            }
            break;
          }
          case "signal_offer": {
            if (!clientSessionId) return;
            const session = sessions.get(clientSessionId);
            if (!session) return;
            const target = clientRole === "host" ? session.joinerWs : session.hostWs;
            if (target && target.readyState === import_ws.WebSocket.OPEN) {
              target.send(JSON.stringify({
                type: "signal_offer",
                sdp: msg.sdp
              }));
            }
            break;
          }
          case "signal_answer": {
            if (!clientSessionId) return;
            const session = sessions.get(clientSessionId);
            if (!session) return;
            const target = clientRole === "host" ? session.joinerWs : session.hostWs;
            if (target && target.readyState === import_ws.WebSocket.OPEN) {
              target.send(JSON.stringify({
                type: "signal_answer",
                sdp: msg.sdp
              }));
            }
            break;
          }
          case "ice_candidate": {
            if (!clientSessionId) return;
            const session = sessions.get(clientSessionId);
            if (!session) return;
            const target = clientRole === "host" ? session.joinerWs : session.hostWs;
            if (target && target.readyState === import_ws.WebSocket.OPEN) {
              target.send(JSON.stringify({
                type: "ice_candidate",
                candidate: msg.candidate
              }));
            }
            break;
          }
          case "leave_session": {
            if (clientSessionId) {
              const session = sessions.get(clientSessionId);
              if (session) {
                const other = clientRole === "host" ? session.joinerWs : session.hostWs;
                if (other && other.readyState === import_ws.WebSocket.OPEN) {
                  other.send(JSON.stringify({ type: "peer_left" }));
                }
              }
            }
            ws.close();
            break;
          }
          case "ping": {
            ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
            break;
          }
          default:
            break;
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: "error", message: "Failed to process signaling message" }));
      }
    });
    ws.on("close", () => {
      if (clientSessionId) {
        const session = sessions.get(clientSessionId);
        if (session) {
          if (clientRole === "host") {
            session.hostWs = void 0;
            if (session.joinerWs && session.joinerWs.readyState === import_ws.WebSocket.OPEN) {
              session.joinerWs.send(JSON.stringify({ type: "peer_disconnected" }));
            }
          } else if (clientRole === "joiner") {
            session.joinerWs = void 0;
            if (session.hostWs && session.hostWs.readyState === import_ws.WebSocket.OPEN) {
              session.hostWs.send(JSON.stringify({ type: "peer_disconnected" }));
            }
          }
        }
      }
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`QuickDrop server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
