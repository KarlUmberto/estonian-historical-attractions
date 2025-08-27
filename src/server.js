const dotenv = require('dotenv')
dotenv.config()
const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const PORT = 5000;
const USERS_FILE = path.join(__dirname, 'data/users.json'); //remove when db work
const SCORES_FILE = path.join(__dirname, 'data/scores.json') //remove when db work
const GAMEDATA_FILE = path.join(__dirname, 'data/gameData.json')
const SECRET = 'very_secret_key';

app.use(express.json());

const users = JSON.parse(fs.readFileSync('./data/users.json')); //remove when db work

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  try {
    const conn = await pool.getConnection();

    // Users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
      )
    `);

    // Scores table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id int NOT NULL,
        game_type VARCHAR(255) NOT NULL,
        attraction_name VARCHAR(255) NOT NULL,
        score VARCHAR(255) NOT NULL,
        datestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    conn.release();
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
  }
}

app.get('/api/info/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const match = users.find(item => item.name === name);

  if (match) {
    res.json(match);
  } else {
    res.status(404).json({ message: 'Info not found' });
  }
});

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
app.use(express.json());

// Helper: Load users
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

// Helper: Save users
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Register
app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;
  const users = loadUsers();

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Palun sisesta nimi' });
  }

  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'Kasutaja juba olemas' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const role = 'õpilane';

  const newUser = { email, password: hashedPassword, name, role };
  users.push(newUser);
  saveUsers(users);

  const token = jwt.sign({ email, name, role }, SECRET, { expiresIn: '1h' });
  res.json({ token, user: { email, name, role } });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Vale email või parool' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Vale email või parool' });
  }


  const token = jwt.sign({ email: user.email, name: user.name, role: user.role }, SECRET, { expiresIn: '1h' });
  res.json({ token, user: { email: user.email, name: user.name, role: user.role } });
});

//score table: game, user, score, datestamp
function loadScores() {
  if (!fs.existsSync(SCORES_FILE)) return [];
  const data = fs.readFileSync(SCORES_FILE)
  return JSON.parse(data);
}

function saveScores(scores) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores,null,2))
}

app.get('/api/scores/:gameType/:gameName', (req, res) => {
  const gameType = req.params.gameType.toLowerCase();
  const gameName = req.params.gameName.toLowerCase();
  const scores = loadScores();

  if (!scores[gameType] || !scores[gameType][gameName]) {
    return res.json([]);
  }

  const sorted = scores[gameType][gameName].sort((a, b) => new Date(b.datestamp) - new Date(a.datestamp));
  res.json(sorted);
});

app.post('/api/scores/:gameType/:gameName', (req, res) => {
  const gameType = req.params.gameType.toLowerCase();
  const gameName = req.params.gameName.toLowerCase();
  const { user, score } = req.body;

  if (!user || !score) {
    return res.status(400).json({ message: 'Vigased andmed' });
  }

  const scores = loadScores();

  if (!scores[gameType]) {
    scores[gameType] = {};
  }
  if (!scores[gameType][gameName]) {
    scores[gameType][gameName] = [];
  }

  const newScore = {
    user,
    score,
    datestamp: new Date().toISOString()
  };

  scores[gameType][gameName].push(newScore);
  saveScores(scores);

  res.status(201).json({ message: `Skoor lisatud mängule "${gameType}/${gameName}"`, score: newScore });
});


function loadGameData() {
  if (!fs.existsSync(GAMEDATA_FILE)) return {};
  const data = fs.readFileSync(GAMEDATA_FILE);
  return JSON.parse(data);
}

function saveGameData(data) {
  fs.writeFileSync(GAMEDATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/gamedata', (req, res) => {
  const gameData = loadGameData();
  res.json(gameData);
});

app.get('/api/gamedata/:attraction', (req, res) => {
  const attraction = decodeURIComponent(req.params.attraction);
  const gameData = loadGameData();

  if (!gameData[attraction]) {
    return res.status(404).json({ message: 'Attraction not found' });
  }
  res.json(gameData[attraction]);
});

app.put('/api/gamedata/:attraction', (req, res) => {
  const attraction = decodeURIComponent(req.params.attraction);
  const newData = req.body;

  if (!newData || typeof newData !== 'object') {
    return res.status(400).json({ message: 'Invalid or missing game data in request body' });
  }

  const gameData = loadGameData();
  gameData[attraction] = newData;

  try {
    saveGameData(gameData);
    res.json({ message: `Game data for "${attraction}" saved successfully.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save game data', error });
  }
});



initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  })
})