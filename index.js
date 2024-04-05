const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS for all routes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




const api_key = "RGAPI-14800098-0420-45d9-8a26-2067869d31e4";




app.get('/getsummonerdata/:summonerName', async (req, res) => {
      let summonerData;
      let summonerName = req.params.summonerName;
      let url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${api_key}`;
      console.log(url)

    

      let response = await fetch(url)
      .then(response => response.json())
      .then(data => {
            summonerData = data;
            console.log(summonerData)

      })
      
      res.json(summonerData)
      
      console.log(summonerData)
      
});

app.get('/', (req, res) => {
      res.sendFile(__dirname + '/index.html');
  });
