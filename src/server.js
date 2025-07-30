const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const PORT = 5000;
const USERS_FILE = path.join(__dirname, 'users.json');
const SCORES_FILE = path.join(__dirname, 'scores.json')
const SECRET = 'very_secret_key';

app.use(express.json());

const users = JSON.parse(fs.readFileSync('./users.json')); // Info fail

app.get('/api/info/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const match = users.find(item => item.name === name);

  if (match) {
    res.json(match);
  } else {
    res.status(404).json({ message: 'Info not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
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
  const role = 'student';

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


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
