const express = require("express");
// V Node.js 18+ není node-fetch potřeba, fetch je vestavěný. 
// Pokud máš starší Node, nechej ho tu, ale ujisti se, že je v package.json.

const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.get("/login", (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");

    // 1. Výměna kódu za token
    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });
    const token = await tokenResponse.json();

    if (!token.access_token) {
      console.error("Token error:", token);
      return res.status(500).send("Failed to get Discord token");
    }

    // 2. Získání údajů o uživateli
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { authorization: `Bearer ${token.access_token}` }
    });
    const user = await userResponse.json();

    // 3. Ošetření avataru a rolí
    const avatar = user.avatar 
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    // DŮLEŽITÉ: Endpoint /users/@me nevrací roles. 
    // Aby frontend v Lovable nespadl, pošleme prázdný string nebo fixní hodnotu.
    const roles = ""; 

    console.log(`User ${user.username} logged in successfully.`);

    // 4. Přesměrování zpět na Lovable
    const redirectUrl = `https://reydens-gaming-hub.lovable.app/?username=${encodeURIComponent(user.username)}&avatar=${encodeURIComponent(avatar)}&discord_id=${user.id}&roles=${roles}`;
    
    res.redirect(redirectUrl);

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

const PORT = process.env.PORT || 3000;
// "0.0.0.0" je pro Render klíčové, aby byl server dostupný zvenčí
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
