import { RequestHandler } from "express";
import { RtcRole, RtcTokenBuilder } from "agora-access-token";
import config from "../../config/config";

export const generateAgoraToken: RequestHandler = (req, res) => {
  try {
    const appId = config.agora_app_id as string;
    const appCertificate = config.agora_app_certificate as string;

    const channelName = String(req.query.channel);
    const uid = String(req.query.uid || "0");
    const role = RtcRole.PUBLISHER;
    const expireSeconds = Number(config.agora_token_expires || 3600);

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
