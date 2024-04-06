const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const riot_api_key = "RGAPI-4cd5f311-276b-4204-abb1-130949ae6c05";

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