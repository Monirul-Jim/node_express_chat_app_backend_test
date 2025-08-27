import { RequestHandler } from "express";
import { RtcRole, RtcTokenBuilder } from "agora-access-token";

export const generateAgoraToken: RequestHandler = (req, res) => {
  try {
    const appId = process.env.AGORA_APP_ID as string;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE as string;

    const channelName = String(req.query.channel);
    const uid = String(req.query.uid || "0");
    const role = RtcRole.PUBLISHER;
    const expireSeconds = Number(process.env.AGORA_TOKEN_EXPIRES || 3600);

    if (!channelName) {
      res.status(400).json({ error: "channel is required" });
      return;
    }
    if (!appId || !appCertificate) {
      res.status(500).json({ error: "Agora credentials missing" });
      return;
    }

    const currentTs = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = currentTs + expireSeconds;

    const token = RtcTokenBuilder.buildTokenWithAccount(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpireTs
    );

    res.json({ appId, channelName, uid, token, expiresIn: expireSeconds });
  } catch (e) {
    console.error("Agora token error:", e);
    res.status(500).json({ error: "Failed to create token" });
  }
};
