const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000", "http://localhost:8080", "capacitor://localhost", "ionic://localhost"],
  credentials: true
}));
app.use(express.json());

// In-memory data for Vercel
let events = [
  {
    id: 1,
    name: "UFC 316",
    date: "2024-06-15T20:00:00",
    location: "Newark, NJ - United States",
    venue: "Prudential Center",
    mainEvent: "Merab Dvalishvili vs Sean O'Malley",
    status: "scheduled",
    created_at: "2025-07-16 01:02:57"
  }
];

let fighters = [];
let fights = [];

// API Routes
app.get('/api/events', (req, res) => {
  res.json(events);
});

app.post('/api/events', (req, res) => {
  const { name, date, location, venue, mainEvent } = req.body;
  const newEvent = {
    id: events.length + 1,
    name,
    date,
    location,
    venue,
    mainEvent,
    status: 'upcoming',
    created_at: new Date().toISOString()
  };
  events.push(newEvent);
  res.json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const { name, date, location, venue, mainEvent, status } = req.body;
  const eventIndex = events.findIndex(e => e.id == req.params.id);
  
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  events[eventIndex] = { ...events[eventIndex], name, date, location, venue, mainEvent, status };
  res.json(events[eventIndex]);
});

app.delete('/api/events/:id', (req, res) => {
  const eventIndex = events.findIndex(e => e.id == req.params.id);
  
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  events.splice(eventIndex, 1);
  res.json({ success: true });
});

// Fighters
app.get('/api/fighters', (req, res) => {
  res.json(fighters);
});

app.post('/api/fighters', (req, res) => {
  const { name, nickname, record, weightClass, ranking } = req.body;
  const newFighter = {
    id: fighters.length + 1,
    name,
    nickname,
    record,
    weightClass,
    ranking,
    created_at: new Date().toISOString()
  };
  fighters.push(newFighter);
  res.json(newFighter);
});

// Fights
app.get('/api/fights', (req, res) => {
  res.json(fights);
});

app.post('/api/fights', (req, res) => {
  const { eventId, fighter1Id, fighter2Id, weightClass } = req.body;
  const newFight = {
    id: fights.length + 1,
    eventId,
    fighter1Id,
    fighter2Id,
    weightClass,
    round: 1,
    timeRemaining: 300,
    status: 'scheduled',
    created_at: new Date().toISOString()
  };
  fights.push(newFight);
  res.json(newFight);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'UFC Events API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.VERCEL) {
  // Export for Vercel
  module.exports = app;
} else {
  // Start server for local development
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
} 