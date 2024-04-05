const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());

app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
});

const api_key = "RGAPI-14800098-0420-45d9-8a26-2067869d31e4";

app.get('/getsummonerdata/:summonerName', async (req, res) => {
      let summonerName = req.params.summonerName;
      let url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${api_key}`;
      console.log(url)

      try {
            let response = await fetch(url);
            let summonerData = await response.json();
            res.json(summonerData);
        } catch (error) {
            console.error('Error fetching summoner data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
});

app.get('/', (req, res) => {
      res.sendFile(__dirname + '/index.html');
});
