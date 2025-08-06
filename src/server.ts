import express from "express";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("src/public"));

app.get("/api/gettracks", async (req, res) => {
    let { user } = req.query;
    if (!user) return res.sendStatus(400);

    let key = process.env.LASTFM_API_KEY;
    if (!key) return res.sendStatus(500);

    let response = await fetch(`http://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${user}&api_key=${key}&format=json`)
        .then(r => r.json());
    
    res.send(response);
});

app.use((_, res) => {
    res.sendStatus(404);
});

app.listen(3000, () => {
    console.log("listening on port 3000");
});