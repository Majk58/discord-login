const express = require("express");
const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN; // Token tvého bota
const GUILD_ID = "1444439759396278302"; // ID tvého RebelRP serveru

app.get("/login", (req, res) => {
  // Přidali jsme scope 'guilds' (volitelné, ale doporučené pro kontrolu)
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify+guilds`;
  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;
    
    // 1. Získání Access Tokenu uživatele
    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });
    const tokenData = await tokenRes.json();

    // 2. Získání profilu uživatele (ID)
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { authorization: `Bearer ${tokenData.access_token}` }
    });
    const user = await userRes.json();

    // 3. Získání členství na konkrétním serveru pomocí BOT TOKENU
    // Tohle vyžaduje, aby bot byl na serveru!
    const memberRes = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/members/${user.id}`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` }
    });
    
    let roles = [];
    if (memberRes.ok) {
      const memberData = await memberRes.json();
      roles = memberData.roles; // Toto je pole ID rolí, které uživatel má
    }

    const avatar = user.avatar 
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    // 4. Přesměrování zpět na Lovable s rolemi v URL
    const rolesString = roles.join(",");
    res.redirect(`https://reydens-gaming-hub.lovable.app/?username=${encodeURIComponent(user.username)}&avatar=${encodeURIComponent(avatar)}&discord_id=${user.id}&roles=${rolesString}`);

  } catch (error) {
    console.error(error);
    res.status(500).send("Chyba při komunikaci s Discordem");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Běží na ${PORT}`));
