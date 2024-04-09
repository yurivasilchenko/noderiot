const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const cors = require('cors');
const { match } = require('assert');

const uri = 'mongodb://127.0.0.1:27017/'; // Connection URI
const client = new MongoClient(uri);

async function connectToDatabase() {
      try {
            await client.connect();
            console.log('Connected to MongoDB');
      } catch (error) {
            console.error('Error connecting to MongoDB:', error);
      }
}

connectToDatabase();

const app = express();
const PORT = 3000;
const riot_api_key = process.env.riot_api_key;
const serverNameMap = {
      'EUN': 'europe',
      'EUW': 'europe',
      'NA': 'americas'
}

app.use(cors());

// Set the view engine to use EJS and specify the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set the path for static files (CSS, JavaScript, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
      res.render('index'); // Render index.ejs
});

app.get('/profile/:serverName/:summonerName', checkXRequestedWith, async (req, res) => {
      let summonerName = req.params.summonerName
      let serverName = req.params.serverName
      let url = `https://${serverName}1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${riot_api_key}`;
      console.log(url)

      try {
            let response = await fetch(url);
            let summonerData = await response.json();
            // res.json(summonerData);

            if (response.status == 200) {
                  let matchHistoryData = await getSummonerMatchHistory(serverName, summonerData.puuid)
                  let matchesData = [];

                  // Use map with async function and Promise.all to ensure all requests are completed
                  await Promise.all(matchHistoryData.map(async (element) => {
                        let matchData = await getMatchData(serverName, element);
                        matchesData.push(matchData);
                  }));

                  res.json(matchesData)

                  let searchedSummonersCollection = client.db('noderiot').collection('searchedSummoners')
                  let collectionData = { puuid: summonerData.puuid, summonerName: summonerName, serverName: serverName, timeStamp: Date.now() }
                  let result = await searchedSummonersCollection.insertOne(collectionData).catch(err => console.log(err))
            }
      } catch (error) {
            console.error('Error fetching summoner data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
      }
});

async function getSummonerMatchHistory(serverName, puuid) {
      let gamesToBeLoaded = 5;
      let matchHistoryData

      let url = `https://${serverNameMap[serverName]}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${gamesToBeLoaded}&api_key=${riot_api_key}`

      try {
            let response = await fetch(url);
            matchHistoryData = await response.json();
      } catch (err) {
            console.log(err)
      }

      return matchHistoryData;
}

async function getMatchData(serverName, matchId) {
      let matchData;
      let url = `https://${serverNameMap[serverName]}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${riot_api_key}`

      try {
            let response = await fetch(url);
            matchData = await response.json();
      } catch (err) {
            console.log(err)
      }

      return matchData;
}

// Middleware to check X-Requested-With header
function checkXRequestedWith(req, res, next) {
      const requestedWithHeader = req.headers.x_requested_with;

      if (requestedWithHeader && requestedWithHeader === 'XMLHttpRequest') {
            // Request is coming from the frontend
            next();
      } else {
            // Request is not coming from the frontend (user manually sent reqeuest from browser)
            res.status(403).send('Forbidden');
      }
}