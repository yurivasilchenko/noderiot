const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const cors = require('cors');

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
const riot_api_key = "RGAPI-0c53b9e9-5274-4dca-8dfe-b3b5183941c8";

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
            res.json(summonerData);

            if (response.status == 200) {
                  let searchedSummonersCollection = client.db('noderiot').collection('searchedSummoners')
                  let collectionData = { puuid: summonerData.puuid, summonerName: summonerName, timeStamp: Date.now() }
                  let result = await searchedSummonersCollection.insertOne(collectionData).catch(err => console.log(err))
            }
      } catch (error) {
            console.error('Error fetching summoner data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
      }
});

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