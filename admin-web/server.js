const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('ufc_events.db');

// Initialize database tables
db.serialize(() => {
  // Events table
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT,
    venue TEXT,
    status TEXT DEFAULT 'scheduled',
    mainEvent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Fighters table
  db.run(`CREATE TABLE IF NOT EXISTS fighters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nickname TEXT,
    record TEXT,
    weightClass TEXT,
    ranking INTEGER,
    photo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Fights table
  db.run(`CREATE TABLE IF NOT EXISTS fights (
    id TEXT PRIMARY KEY,
    eventId TEXT NOT NULL,
    fighter1Id TEXT NOT NULL,
    fighter2Id TEXT NOT NULL,
    weightClass TEXT,
    rounds INTEGER DEFAULT 3,
    status TEXT DEFAULT 'scheduled',
    currentRound INTEGER DEFAULT 1,
    roundTime TEXT DEFAULT '05:00',
    winner TEXT,
    method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES events (id),
    FOREIGN KEY (fighter1Id) REFERENCES fighters (id),
    FOREIGN KEY (fighter2Id) REFERENCES fighters (id)
  )`);

  // Round scores table
  db.run(`CREATE TABLE IF NOT EXISTS round_scores (
    id TEXT PRIMARY KEY,
    fightId TEXT NOT NULL,
    roundNumber INTEGER NOT NULL,
    fighter1Score INTEGER DEFAULT 0,
    fighter2Score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fightId) REFERENCES fights (id)
  )`);
});

// API Routes

// Events
app.get('/api/events', (req, res) => {
  db.all('SELECT * FROM events ORDER BY date DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/events', (req, res) => {
  const { name, date, location, venue, mainEvent } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO events (id, name, date, location, venue, mainEvent) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, date, location, venue, mainEvent],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, date, location, venue, mainEvent });
    }
  );
});

app.put('/api/events/:id', (req, res) => {
  const { name, date, location, venue, mainEvent, status } = req.body;
  
  db.run(
    'UPDATE events SET name = ?, date = ?, location = ?, venue = ?, mainEvent = ?, status = ? WHERE id = ?',
    [name, date, location, venue, mainEvent, status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/events/:id', (req, res) => {
  db.run('DELETE FROM events WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Fighters
app.get('/api/fighters', (req, res) => {
  db.all('SELECT * FROM fighters ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/fighters', (req, res) => {
  const { name, nickname, record, weightClass, ranking, photo } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO fighters (id, name, nickname, record, weightClass, ranking, photo) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, nickname, record, weightClass, ranking, photo],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, nickname, record, weightClass, ranking, photo });
    }
  );
});

// Fights
app.get('/api/fights', (req, res) => {
  const eventId = req.query.eventId;
  let query = `
    SELECT f.*, 
           f1.name as fighter1Name, f1.nickname as fighter1Nickname, f1.photo as fighter1Photo,
           f2.name as fighter2Name, f2.nickname as fighter2Nickname, f2.photo as fighter2Photo
    FROM fights f
    JOIN fighters f1 ON f.fighter1Id = f1.id
    JOIN fighters f2 ON f.fighter2Id = f2.id
  `;
  
  if (eventId) {
    query += ' WHERE f.eventId = ?';
    db.all(query, [eventId], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  } else {
    db.all(query, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  }
});

app.post('/api/fights', (req, res) => {
  const { eventId, fighter1Id, fighter2Id, weightClass, rounds } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO fights (id, eventId, fighter1Id, fighter2Id, weightClass, rounds) VALUES (?, ?, ?, ?, ?, ?)',
    [id, eventId, fighter1Id, fighter2Id, weightClass, rounds],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, eventId, fighter1Id, fighter2Id, weightClass, rounds });
    }
  );
});

app.put('/api/fights/:id/status', (req, res) => {
  const { status, currentRound, roundTime, winner, method } = req.body;
  
  db.run(
    'UPDATE fights SET status = ?, currentRound = ?, roundTime = ?, winner = ?, method = ? WHERE id = ?',
    [status, currentRound, roundTime, winner, method, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Emit socket event for real-time updates
      io.emit('fightUpdate', {
        fightId: req.params.id,
        status,
        currentRound,
        roundTime,
        winner,
        method
      });
      
      res.json({ success: true });
    }
  );
});

// Export data for iOS app
app.get('/api/export', (req, res) => {
  db.all(`
    SELECT 
      e.*,
      json_group_array(
        json_object(
          'id', f.id,
          'fighter1', json_object(
            'id', f1.id,
            'name', f1.name,
            'nickname', f1.nickname,
            'record', f1.record,
            'photo', f1.photo
          ),
          'fighter2', json_object(
            'id', f2.id,
            'name', f2.name,
            'nickname', f2.nickname,
            'record', f2.record,
            'photo', f2.photo
          ),
          'weightClass', f.weightClass,
          'rounds', f.rounds,
          'status', f.status,
          'currentRound', f.currentRound,
          'roundTime', f.roundTime,
          'winner', f.winner,
          'method', f.method
        )
      ) as fights
    FROM events e
    LEFT JOIN fights f ON e.id = f.eventId
    LEFT JOIN fighters f1 ON f.fighter1Id = f1.id
    LEFT JOIN fighters f2 ON f.fighter2Id = f2.id
    GROUP BY e.id
    ORDER BY e.date DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Parse the JSON fights array for each event
    const events = rows.map(row => ({
      ...row,
      fights: JSON.parse(row.fights).filter(fight => fight.id !== null)
    }));
    
    res.json(events);
  });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve admin interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`UFC Admin Server running on port ${PORT}`);
  console.log(`Admin interface: http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api`);
}); 