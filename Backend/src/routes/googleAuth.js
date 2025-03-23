import fetch from "node-fetch";
import { supabase } from "../config/supabaseClient.js";
import dotenv from "dotenv";

dotenv.config();

export const refreshGoogleAccessToken = async (req, res) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.refresh_token) {
    return res.status(401).json({ error: "Unauthorized - No refresh token available" });
  }

  const refreshToken = session.refresh_token;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = await response.json();
    console.log("📌 New Google Access Token:", tokenData);

    if (tokenData.access_token) {
      res.json({ access_token: tokenData.access_token });
    } else {
      res.status(400).json({ error: "Failed to refresh Google access token" });
    }
  } catch (error) {
    console.error("❌ Error refreshing token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
