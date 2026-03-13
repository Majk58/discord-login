const express = require("express");
const fetch = require("node-fetch");

const app = express();

// 🌟 Environment variables pro bezpečné údaje
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // https://discord-login-peb2.onrender.com/callback

// Login endpoint
app.get("/login", (req, res) => {
  const url =
    "https://discord.com/api/oauth2/authorize" +
    "?client_id=" + CLIENT_ID +
    "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
    "&response_type=code" +
    "&scope=identify";

  res.redirect(url);
});

// Callback endpoint po přihlášení přes Discord
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);

  const token = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  }).then(r => r.json());

  const user = await fetch("https://discord.com/api/users/@me", {
    headers: { authorization: `Bearer ${token.access_token}` }
  }).then(r => r.json());

  const avatar =
    `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

  // Přesměrování na Lovable web s username a avatar
  res.redirect(
  `https://reydens-gaming-hub.lovable.app/?username=${user.username}&avatar=${avatar}&discord_id=${user.id}&roles=${user.roles.join(",")}`
);
});

// 🌟 Použít port Renderu
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


