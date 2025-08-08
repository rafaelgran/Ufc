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

// Database setup - Using Supabase only
const SupabaseService = require('./supabase-config');
const supabaseService = new SupabaseService();

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
  supabaseService.getEvents(currentDate, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Test route to see all events
app.get('/api/events/all', (req, res) => {
  supabaseService.getAllEvents((err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/events', (req, res) => {
  const { name, date, location, venue, mainEvent } = req.body;
  
  supabaseService.addEvent(name, date, location, venue, mainEvent, (err, id) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: id, name, date, location, venue, mainEvent });
  });
});

app.put('/api/events/:id', (req, res) => {
  const { name, date, location, venue, mainEvent, status } = req.body;
  
  supabaseService.updateEvent(req.params.id, name, date, location, venue, mainEvent, status, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

app.delete('/api/events/:id', (req, res) => {
  supabaseService.deleteEvent(req.params.id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Fighters
app.get('/api/fighters', (req, res) => {
  supabaseService.getFighters((err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/fighters/weight-class/:weightClass', (req, res) => {
  const weightClass = req.params.weightClass;
  
  supabaseService.getFightersByWeightClass(weightClass, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/fighters/ranked', (req, res) => {
  supabaseService.getRankedFighters((err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get fights for a specific fighter (MUST come before /api/fighters/:id)
app.get('/api/fighters/:id/fights', (req, res) => {
  const fighterId = req.params.id;
  supabaseService.getFightsByFighter(fighterId, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/fighters/:id', (req, res) => {
  supabaseService.getFighter(req.params.id, (err, row) => {
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
  
  supabaseService.addFighter(name, nickname, record, weightClass, ranking, (err, id) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: id, name, nickname, record, weightClass, ranking });
  });
});

app.post('/api/fighters/bulk', (req, res) => {
  const { fighters } = req.body;
  
  if (!fighters || !Array.isArray(fighters)) {
    res.status(400).json({ error: 'Fighters array is required' });
    return;
  }
  
  supabaseService.addFighters(fighters, (err, inserted, errors, total) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ 
        success: true, 
        inserted, 
        errors,
        total: total 
      });
    }
  });
});

app.put('/api/fighters/:id', (req, res) => {
  const { name, nickname, record, weightClass, ranking } = req.body;
  
  supabaseService.updateFighter(req.params.id, name, nickname, record, weightClass, ranking, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

app.delete('/api/fighters/:id', (req, res) => {
  supabaseService.deleteFighter(req.params.id, (err) => {
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
  supabaseService.getFights(eventId, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/fights/:id', (req, res) => {
  supabaseService.getFight(req.params.id, (err, row) => {
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
  supabaseService.getNextFightOrder(eventId, (err, nextOrder) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    supabaseService.addFight(eventId, fighter1Id, fighter2Id, weightClass, fightType || 'main', rounds || 3, nextOrder, (err, id) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: id, eventId, fighter1Id, fighter2Id, weightClass, fightType: fightType || 'main', rounds: rounds || 3, fightOrder: nextOrder });
    });
  });
});

app.put('/api/fights/:id', (req, res) => {
  const { eventId, fighter1Id, fighter2Id, weightClass, fightType, rounds, status, fightOrder } = req.body;
  
  supabaseService.updateFight(req.params.id, eventId, fighter1Id, fighter2Id, weightClass, fightType || 'main', rounds || 3, status || 'scheduled', fightOrder || 0, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

app.put('/api/fights/:id/status', (req, res) => {
  const { status, rounds, timeRemaining, winnerId } = req.body;
  
  supabaseService.updateFightStatus(req.params.id, status, rounds, timeRemaining, winnerId, (err) => {
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
  });
});

app.delete('/api/fights/:id', (req, res) => {
  supabaseService.deleteFight(req.params.id, (err) => {
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
      supabaseService.updateFightOrder(fightId, eventId, index + 1, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
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
  supabaseService.getEventsAfterDate(currentDate, (err, events) => {
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
  supabaseService.getEventsAfterDate(currentDate, (err, events) => {
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
  supabaseService.getEventsWithFights(currentDate, (err, rows) => {
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
  console.log(`Database: Supabase`);
}); 