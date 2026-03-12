const express = require("express");
const fetch = require("node-fetch");

const app = express();

const CLIENT_ID = "1131980467990691870";
const CLIENT_SECRET = "geQYbwImIW0jgVLT8s4YixFsmonQx4Dx";
const REDIRECT_URI = "https://tvuj-backend.up.railway.app/callback";

app.get("/login", (req, res) => {

const url =
"https://discord.com/api/oauth2/authorize"+
"?client_id="+CLIENT_ID+
"&redirect_uri="+encodeURIComponent(REDIRECT_URI)+
"&response_type=code"+
"&scope=identify";

res.redirect(url);

});

app.get("/callback", async (req, res) => {

const code = req.query.code;

const params = new URLSearchParams();
params.append("client_id", CLIENT_ID);
params.append("client_secret", CLIENT_SECRET);
params.append("grant_type", "authorization_code");
params.append("code", code);
params.append("redirect_uri", REDIRECT_URI);

const token = await fetch("https://discord.com/api/oauth2/token",{
method:"POST",
headers:{"Content-Type":"application/x-www-form-urlencoded"},
body:params
}).then(r=>r.json());

const user = await fetch("https://discord.com/api/users/@me",{
headers:{authorization:`Bearer ${token.access_token}`}
}).then(r=>r.json());

const avatar =
`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

res.redirect(
`https://tvujweb.cz/?username=${user.username}&avatar=${avatar}`
);

});

app.listen(3000, () => console.log("Server running"));