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
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      ufcStatsUrl TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS fights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER,
      fighter1Id INTEGER,
      fighter2Id INTEGER,
      weightClass TEXT,
      fightType TEXT DEFAULT 'main',
      rounds INTEGER DEFAULT 3,
      timeRemaining INTEGER DEFAULT 300,
      status TEXT DEFAULT 'scheduled',
      winnerId INTEGER,
      fightOrder INTEGER DEFAULT 0,
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
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      ufcStatsUrl TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS fights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER,
      fighter1Id INTEGER,
      fighter2Id INTEGER,
      weightClass TEXT,
      fightType TEXT DEFAULT 'main',
      rounds INTEGER DEFAULT 3,
      timeRemaining INTEGER DEFAULT 300,
      status TEXT DEFAULT 'scheduled',
      winnerId INTEGER,
      fightOrder INTEGER DEFAULT 0,
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
  const currentDate = new Date().toISOString();
  db.all('SELECT * FROM events WHERE date > ? ORDER BY date ASC', [currentDate], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Test route to see all events
app.get('/api/events/all', (req, res) => {
  db.all('SELECT * FROM events ORDER BY date ASC', (err, rows) => {
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

app.get('/api/fighters/weight-class/:weightClass', (req, res) => {
  const weightClass = req.params.weightClass;
  
  db.all('SELECT * FROM fighters WHERE weightClass = ? ORDER BY ranking ASC, name ASC', [weightClass], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/fighters/ranked', (req, res) => {
  db.all('SELECT * FROM fighters WHERE ranking IS NOT NULL ORDER BY weightClass ASC, ranking ASC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/fighters/:id', (req, res) => {
  db.get('SELECT * FROM fighters WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Fighter not found' });
      return;
    }
    res.json(row);
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

app.post('/api/fighters/bulk', (req, res) => {
  const { fighters } = req.body;
  
  if (!fighters || !Array.isArray(fighters)) {
    res.status(400).json({ error: 'Fighters array is required' });
    return;
  }
  
  db.run('DELETE FROM fighters', (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const stmt = db.prepare(`
      INSERT INTO fighters (name, nickname, record, weightClass, wins, losses, draws, ranking, ufcStatsUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let inserted = 0;
    let errors = 0;
    
    fighters.forEach((fighter, index) => {
      stmt.run([
        fighter.name,
        fighter.nickname || null,
        fighter.record || null,
        fighter.weightClass || null,
        fighter.wins || 0,
        fighter.losses || 0,
        fighter.draws || 0,
        fighter.ranking || null,
        fighter.ufcStatsUrl || null
      ], function(err) {
        if (err) {
          console.error(`Error inserting ${fighter.name}:`, err.message);
          errors++;
        } else {
          inserted++;
        }
        
        if (index === fighters.length - 1) {
          stmt.finalize((err) => {
            if (err) {
              res.status(500).json({ error: err.message });
            } else {
              res.json({ 
                success: true, 
                inserted, 
                errors,
                total: fighters.length 
              });
            }
          });
        }
      });
    });
  });
});

app.put('/api/fighters/:id', (req, res) => {
  const { name, nickname, record, weightClass, ranking } = req.body;
  
  db.run(
    'UPDATE fighters SET name = ?, nickname = ?, record = ?, weightClass = ?, ranking = ? WHERE id = ?',
    [name, nickname, record, weightClass, ranking, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/fighters/:id', (req, res) => {
  db.run('DELETE FROM fighters WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Fights
app.get('/api/fights', (req, res) => {
  const eventId = req.query.eventId;
  let query = `
    SELECT f.*, 
           f1.name as fighter1Name, f1.nickname as fighter1Nickname,
           f2.name as fighter2Name, f2.nickname as fighter2Nickname
    FROM fights f
    LEFT JOIN fighters f1 ON f.fighter1Id = f1.id
    LEFT JOIN fighters f2 ON f.fighter2Id = f2.id
  `;
  
  if (eventId) {
    query += ' WHERE f.eventId = ? ORDER BY f.fightOrder ASC, f.created_at ASC';
    db.all(query, [eventId], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  } else {
    query += ' ORDER BY f.eventId ASC, f.fightOrder ASC, f.created_at ASC';
    db.all(query, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  }
});

app.get('/api/fights/:id', (req, res) => {
  const query = `
    SELECT f.*, 
           f1.name as fighter1Name, f1.nickname as fighter1Nickname,
           f2.name as fighter2Name, f2.nickname as fighter2Nickname
    FROM fights f
    LEFT JOIN fighters f1 ON f.fighter1Id = f1.id
    LEFT JOIN fighters f2 ON f.fighter2Id = f2.id
    WHERE f.id = ?
  `;
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Fight not found' });
      return;
    }
    res.json(row);
  });
});

app.post('/api/fights', (req, res) => {
  const { eventId, fighter1Id, fighter2Id, weightClass, fightType, rounds } = req.body;
  
  // First, get the next order number for this event
  db.get('SELECT MAX(fightOrder) as maxOrder FROM fights WHERE eventId = ?', [eventId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const nextOrder = (row.maxOrder || 0) + 1;
    
    // Insert the fight with the order
    db.run(
      'INSERT INTO fights (eventId, fighter1Id, fighter2Id, weightClass, fightType, rounds, fightOrder) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [eventId, fighter1Id, fighter2Id, weightClass, fightType || 'main', rounds || 3, nextOrder],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: this.lastID, eventId, fighter1Id, fighter2Id, weightClass, fightType: fightType || 'main', rounds: rounds || 3, fightOrder: nextOrder });
      }
    );
  });
});

app.put('/api/fights/:id', (req, res) => {
  const { eventId, fighter1Id, fighter2Id, weightClass, fightType, rounds, status, fightOrder } = req.body;
  
  db.run(
    'UPDATE fights SET eventId = ?, fighter1Id = ?, fighter2Id = ?, weightClass = ?, fightType = ?, rounds = ?, status = ?, fightOrder = ? WHERE id = ?',
    [eventId, fighter1Id, fighter2Id, weightClass, fightType || 'main', rounds || 3, status || 'scheduled', fightOrder || 0, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

app.put('/api/fights/:id/status', (req, res) => {
  const { status, rounds, timeRemaining, winnerId } = req.body;
  
  db.run(
    'UPDATE fights SET status = ?, rounds = ?, timeRemaining = ?, winnerId = ? WHERE id = ?',
    [status, rounds, timeRemaining, winnerId, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Emit socket event for real-time updates
      io.emit('fightUpdate', {
        fightId: req.params.id,
        status,
        rounds,
        timeRemaining,
        winnerId
      });
      
      res.json({ success: true });
    }
  );
});

app.delete('/api/fights/:id', (req, res) => {
  db.run('DELETE FROM fights WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Update fight order for an event
app.put('/api/events/:id/fight-order', (req, res) => {
  const { fightOrder } = req.body;
  const eventId = req.params.id;
  
  if (!fightOrder || !Array.isArray(fightOrder)) {
    res.status(400).json({ error: 'fightOrder must be an array' });
    return;
  }
  
  // Update the order for each fight
  const updatePromises = fightOrder.map((fightId, index) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE fights SET fightOrder = ? WHERE id = ? AND eventId = ?',
        [index + 1, fightId, eventId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  });
  
  Promise.all(updatePromises)
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

// Test route for iOS app
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    events: 4,
    fighters: 8,
    fights: 5
  });
});

// iOS-friendly export with simplified dates
app.get('/api/export-ios', (req, res) => {
  const currentDate = new Date().toISOString();
  db.all(`
    SELECT 
      e.id,
      e.name,
      e.date,
      e.location,
      e.venue,
      e.mainEvent,
      e.status,
      e.created_at
    FROM events e
    WHERE e.date > ?
    ORDER BY e.date ASC
  `, [currentDate], (err, events) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Format dates for iOS
    const formattedEvents = events.map(event => ({
      ...event,
      date: event.date ? new Date(event.date).toISOString() : null,
      created_at: event.created_at ? new Date(event.created_at).toISOString() : null
    }));
    
    res.json({
      status: 'success',
      count: formattedEvents.length,
      events: formattedEvents
    });
  });
});

// Simple export for iOS app testing
app.get('/api/export-simple', (req, res) => {
  const currentDate = new Date().toISOString();
  db.all(`
    SELECT 
      e.id,
      e.name,
      e.date,
      e.location,
      e.venue,
      e.mainEvent,
      e.status
    FROM events e
    WHERE e.date > ?
    ORDER BY e.date ASC
  `, [currentDate], (err, events) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      status: 'success',
      count: events.length,
      events: events
    });
  });
});

// Export data for iOS app
app.get('/api/export', (req, res) => {
  const currentDate = new Date().toISOString();
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
            'ranking', f1.ranking
          ),
          'fighter2', json_object(
            'id', f2.id,
            'name', f2.name,
            'nickname', f2.nickname,
            'record', f2.record,
            'ranking', f2.ranking
          ),
          'weightClass', f.weightClass,
          'rounds', f.rounds,
          'timeRemaining', f.timeRemaining,
          'status', f.status,
          'winnerId', f.winnerId
        )
      ) as fights
    FROM events e
    LEFT JOIN fights f ON e.id = f.eventId
    LEFT JOIN fighters f1 ON f.fighter1Id = f1.id
    LEFT JOIN fighters f2 ON f.fighter2Id = f2.id
    WHERE e.date > ?
    GROUP BY e.id
    ORDER BY e.date ASC
  `, [currentDate], (err, rows) => {
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