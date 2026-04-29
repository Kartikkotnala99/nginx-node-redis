const os = require('os');
const express = require('express');
const app = express();
const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  host: 'redis',
  port: 6379
});

redisClient.on('error', (err) => console.error('Redis error:', err));

app.get('/', function (req, res) {
  redisClient.get('numVisits', function (err, numVisits) {
    let numVisitsToDisplay = parseInt(numVisits) + 1;
    if (isNaN(numVisitsToDisplay)) {
      numVisitsToDisplay = 1;
    }

    redisClient.set('numVisits', numVisitsToDisplay);

    const hostname = os.hostname();
    const uptime  = Math.floor(process.uptime());
    const uptimeStr = uptime < 60
      ? `${uptime}s`
      : uptime < 3600
        ? `${Math.floor(uptime/60)}m ${uptime%60}s`
        : `${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m`;
    const mem   = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const now   = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Request Counter</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .container { width: 100%; max-width: 560px; }

    /* ── Header ─────────────────────────────── */
    .header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 1.75rem;
    }
    .globe-icon {
      width: 48px; height: 48px;
      background: #1e40af;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    .header-text h1 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #f1f5f9;
      letter-spacing: -0.01em;
    }
    .header-text p {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 2px;
    }
    .status-pill {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: #4ade80;
      background: rgba(74,222,128,0.1);
      border: 1px solid rgba(74,222,128,0.2);
      padding: 4px 12px;
      border-radius: 999px;
    }
    .pulse {
      width: 7px; height: 7px;
      background: #4ade80;
      border-radius: 50%;
      animation: pulse 1.8s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

    /* ── Visit card ──────────────────────────── */
    .visit-card {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      border: 1px solid rgba(99,136,245,0.3);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      margin-bottom: 1rem;
      position: relative;
      overflow: hidden;
    }
    .visit-card::before {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 140px; height: 140px;
      background: rgba(255,255,255,0.04);
      border-radius: 50%;
    }
    .visit-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #93c5fd;
      margin-bottom: 0.5rem;
    }
    .visit-count {
      font-size: 4rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1;
      letter-spacing: -0.03em;
    }
    .visit-sub {
      font-size: 0.8rem;
      color: #93c5fd;
      margin-top: 0.5rem;
    }

    /* ── Stats grid ──────────────────────────── */
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .stat {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1rem 1.1rem;
    }
    .stat-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #475569;
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 1rem;
      font-weight: 600;
      color: #e2e8f0;
      word-break: break-all;
    }
    .stat-icon {
      font-size: 0.85rem;
      margin-right: 5px;
      opacity: 0.7;
    }

    /* ── Footer ──────────────────────────────── */
    .footer {
      text-align: center;
      font-size: 0.72rem;
      color: #334155;
      margin-top: 1.25rem;
    }
  </style>
</head>
<body>
  <div class="container">

    <div class="header">
      <div class="globe-icon">🌐</div>
      <div class="header-text">
        <h1>Request Counter</h1>
        <p>Backed by Redis &bull; Node.js &bull; Express</p>
      </div>
      <div class="status-pill">
        <span class="pulse"></span> Online
      </div>
    </div>

    <div class="visit-card">
      <p class="visit-label">Total Visits</p>
      <div class="visit-count">${numVisitsToDisplay.toLocaleString()}</div>
      <p class="visit-sub">Requests served since boot</p>
    </div>

    <div class="stats">
      <div class="stat">
        <p class="stat-label">Hostname</p>
        <p class="stat-value"><span class="stat-icon">🖥</span>${hostname}</p>
      </div>
      <div class="stat">
        <p class="stat-label">Uptime</p>
        <p class="stat-value"><span class="stat-icon">⏱</span>${uptimeStr}</p>
      </div>
      <div class="stat">
        <p class="stat-label">Heap Used</p>
        <p class="stat-value"><span class="stat-icon">💾</span>${mem} MB</p>
      </div>
      <div class="stat">
        <p class="stat-label">Server Time</p>
        <p class="stat-value" style="font-size:0.82rem">${now}</p>
      </div>
    </div>

    <div class="footer">Refresh the page to increment the counter &bull; Port 5000</div>
  </div>
</body>
</html>`);
  });
});

app.get('/health', function (req, res) {
  res.status(200).json({
    status: 'ok',
    hostname: os.hostname(),
    uptime: Math.floor(process.uptime()),
    memoryMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)
  });
});

app.listen(5000, function () {
  console.log('🌐 Web application is listening on port 5000');
});