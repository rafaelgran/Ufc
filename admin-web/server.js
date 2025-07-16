const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000", "http://localhost:8080", "capacitor://localhost", "ionic://localhost"],
    methods: ["GET", "POST"]
  }
});

// Database setup
let db;
const useSQLite = process.env.USE_SQLITE === 'true' || !process.env.DATABASE_URL;
const isVercel = process.env.VERCEL === '1';

if (isVercel || !useSQLite) {
  // Use in-memory database for Vercel or PostgreSQL for production
  const sqlite3 = require('sqlite3').verbose();
  db = new sqlite3.Database(':memory:'); // Use in-memory database for Vercel
  
  // Initialize SQLite tables
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT,
      venue TEXT,
      mainEvent TEXT,
      status TEXT DEFAULT 'upcoming',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS fighters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nickname TEXT,
      record TEXT,
      weightClass TEXT,
      ranking INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS fights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER,
      fighter1Id INTEGER,
      fighter2Id INTEGER,
      weightClass TEXT,
      round INTEGER DEFAULT 1,
      timeRemaining INTEGER DEFAULT 300,
      status TEXT DEFAULT 'scheduled',
      winnerId INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (eventId) REFERENCES events (id),
      FOREIGN KEY (fighter1Id) REFERENCES fighters (id),
      FOREIGN KEY (fighter2Id) REFERENCES fighters (id)
    )`);
    
    // Insert sample data for Vercel
    if (isVercel) {
      db.run(`INSERT OR IGNORE INTO events (id, name, date, location, venue, mainEvent, status) VALUES 
        (1, 'UFC 316', '2024-06-15T20:00:00', 'Newark, NJ - United States', 'Prudential Center', 'Merab Dvalishvili vs Sean O''Malley', 'scheduled')`);
    }
  });
} else {
  // Use SQLite file for local development
  const sqlite3 = require('sqlite3').verbose();
  db = new sqlite3.Database('./ufc_events.db');
  
  // Initialize SQLite tables
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT,
      venue TEXT,
      mainEvent TEXT,
      status TEXT DEFAULT 'upcoming',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS fighters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nickname TEXT,
      record TEXT,
      weightClass TEXT,
      ranking INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS fights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER,
      fighter1Id INTEGER,
      fighter2Id INTEGER,
      weightClass TEXT,
      round INTEGER DEFAULT 1,
      timeRemaining INTEGER DEFAULT 300,
      status TEXT DEFAULT 'scheduled',
      winnerId INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (eventId) REFERENCES events (id),
      FOREIGN KEY (fighter1Id) REFERENCES fighters (id),
      FOREIGN KEY (fighter2Id) REFERENCES fighters (id)
    )`);
  });
}

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000", "http://localhost:8080", "capacitor://localhost", "ionic://localhost"],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
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
  
  db.run(
    'INSERT INTO events (name, date, location, venue, mainEvent) VALUES (?, ?, ?, ?, ?)',
    [name, date, location, venue, mainEvent],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, date, location, venue, mainEvent });
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
  const { name, nickname, record, weightClass, ranking } = req.body;
  
  db.run(
    'INSERT INTO fighters (name, nickname, record, weightClass, ranking) VALUES (?, ?, ?, ?, ?)',
    [name, nickname, record, weightClass, ranking],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, nickname, record, weightClass, ranking });
    }
  );
});

// Fights
app.get('/api/fights', (req, res) => {
  const eventId = req.query.eventId;
  let query = `
    SELECT f.*, 
           f1.name as fighter1Name, f1.nickname as fighter1Nickname,
           f2.name as fighter2Name, f2.nickname as fighter2Nickname
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
  const { eventId, fighter1Id, fighter2Id, weightClass } = req.body;
  
  db.run(
    'INSERT INTO fights (eventId, fighter1Id, fighter2Id, weightClass) VALUES (?, ?, ?, ?)',
    [eventId, fighter1Id, fighter2Id, weightClass],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, eventId, fighter1Id, fighter2Id, weightClass });
    }
  );
});

app.put('/api/fights/:id/status', (req, res) => {
  const { status, round, timeRemaining, winnerId } = req.body;
  
  db.run(
    'UPDATE fights SET status = ?, round = ?, timeRemaining = ?, winnerId = ? WHERE id = ?',
    [status, round, timeRemaining, winnerId, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Emit socket event for real-time updates
      io.emit('fightUpdate', {
        fightId: req.params.id,
        status,
        round,
        timeRemaining,
        winnerId
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
            'record', f1.record
          ),
          'fighter2', json_object(
            'id', f2.id,
            'name', f2.name,
            'nickname', f2.nickname,
            'record', f2.record
          ),
          'weightClass', f.weightClass,
          'round', f.round,
          'timeRemaining', f.timeRemaining,
          'status', f.status,
          'winnerId', f.winnerId
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
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${useSQLite ? 'SQLite' : 'PostgreSQL'}`);
}); 