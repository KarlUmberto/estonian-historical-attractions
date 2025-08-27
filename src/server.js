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
const GAMEDATA_FILE = path.join(__dirname, 'data/gameData.json')
const SECRET = 'very_secret_key';

app.use(express.json());

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

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
app.use(express.json());


app.get('/api/info/:name', async (req, res) => {
  const name = decodeURIComponent(req.params.name);

  try {
    const [rows] = await pool.query(
      'SELECT email, name, role FROM users WHERE name = ?',
      [name]
    );
    const user = rows[0];

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Info not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// Register
app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Palun sisesta nimi' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Kasutaja juba olemas' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'õpilane';

    await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role]
    );

    const token = jwt.sign({ email, name, role }, SECRET, { expiresIn: '1h' });
    res.json({ token, user: { email, name, role } });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Vale email või parool' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Vale email või parool' });
    }
    const token = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: { email: user.email, name: user.name, role: user.role }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/scores/:gameType/:gameName', async (req, res) => {
  const gameType = req.params.gameType.toLowerCase();
  const gameName = req.params.gameName.toLowerCase();

  try {
    const [rows] = await pool.query(
      `SELECT u.name AS user, s.score, s.datestamp
       FROM scores s
       JOIN users u ON s.user_id = u.id
       WHERE s.game_type = ? AND s.attraction_name = ?
       ORDER BY s.datestamp DESC`,
      [gameType, gameName]
    );

    res.json(rows);
  } catch (err) {
    console.error('Score fetch error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.get('/api/scores', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.name AS user, s.attraction_name, s.game_type, s.score, s.datestamp
       FROM scores s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.datestamp DESC`,
    );

    res.json(rows);
  } catch (err) {
    console.error('Score fetch error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.post('/api/scores/:gameType/:gameName', async (req, res) => {
  const gameType = req.params.gameType.toLowerCase();
  const gameName = req.params.gameName.toLowerCase();
  const { user, score } = req.body;

  if (!user || !score) {
    return res.status(400).json({ message: 'Vigased andmed' });
  }

  try {
    // Find user ID
    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE name = ?',
      [user]
    );
    const userRecord = userRows[0];

    if (!userRecord) {
      return res.status(400).json({ message: 'Kasutajat ei leitud' });
    }

    // Insert score
    const [result] = await pool.query(
      'INSERT INTO scores (user_id, game_type, attraction_name, score) VALUES (?, ?, ?, ?)',
      [userRecord.id, gameType, gameName, score]
    );

    // Build response in same format as before
    const newScore = {
      user,
      score,
      datestamp: new Date().toISOString()
    };

    res.status(201).json({
      message: `Skoor lisatud mängule "${gameType}/${gameName}"`,
      score: newScore
    });

  } catch (err) {
    console.error('Score insert error:', err);
    res.status(500).json({ message: 'Database error' });
  }
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