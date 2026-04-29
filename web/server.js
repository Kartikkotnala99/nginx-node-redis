const os = require('os');
const express = require('express');
const app = express();
const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  host: 'redis',
  port: 6379
});

app.get('/', function (req, res) {
  redisClient.get('numVisits', function (err, numVisits) {
    let numVisitsToDisplay = parseInt(numVisits) + 1;
    if (isNaN(numVisitsToDisplay)) {
      numVisitsToDisplay = 1;
    }

    // Update Redis
    redisClient.set('numVisits', numVisitsToDisplay);

    // Send attractive HTML response
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Visit Counter</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      color: #fff;
      text-align: center;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .card {
      background: rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      backdrop-filter: blur(8px);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    }

    h1 {
      font-size: 2.8rem;
      margin-bottom: 25px;
      color: #ffd700;
      text-shadow: 2px 2px 6px rgba(0,0,0,0.5);
    }

    p {
      font-size: 1.4rem;
      margin: 15px 0;
    }

    .highlight {
      font-weight: bold;
      font-size: 1.6rem;
      color: #00ffcc;
      text-shadow: 1px 1px 4px rgba(0,0,0,0.4);
    }

    .footer {
      margin-top: 20px;
      font-size: 0.9rem;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌍 Welcome to Request Counter</h1>
    <p>Running on: <span class="highlight">${os.hostname()}</span></p>
    <p>Total Visits: <span class="highlight">${numVisitsToDisplay}</span></p>
    <div class="footer">Powered by Node.js + Redis</div>
  </div>
</body>
</html>

    `);
  });
});

app.get('/health', function (req, res) {
  res.status(200).send('OK');
});

app.listen(5000, function () {
  console.log('🌐 Web application is listening on port 5000');
});
