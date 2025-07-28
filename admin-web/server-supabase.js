const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { SupabaseService } = require('./supabase-config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000", "http://localhost:8080", "capacitor://localhost", "ionic://localhost"],
    methods: ["GET", "POST"]
  }
});

// Initialize Supabase service
const supabaseService = new SupabaseService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes for Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await supabaseService.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const eventData = req.body;
    const newEvent = await supabaseService.createEvent(eventData);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;
    const updatedEvent = await supabaseService.updateEvent(parseInt(id), eventData);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteEvent(parseInt(id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// API Routes for Fighters
app.get('/api/fighters', async (req, res) => {
  try {
    const fighters = await supabaseService.getAllFighters();
    res.json(fighters);
  } catch (error) {
    console.error('Error fetching fighters:', error);
    res.status(500).json({ error: 'Failed to fetch fighters' });
  }
});

app.get('/api/fighters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fighters = await supabaseService.getAllFighters();
    const fighter = fighters.find(f => f.id === parseInt(id));
    if (fighter) {
      res.json(fighter);
    } else {
      res.status(404).json({ error: 'Fighter not found' });
    }
  } catch (error) {
    console.error('Error fetching fighter:', error);
    res.status(500).json({ error: 'Failed to fetch fighter' });
  }
});

app.post('/api/fighters', async (req, res) => {
  try {
    const fighterData = req.body;
    const newFighter = await supabaseService.createFighter(fighterData);
    res.status(201).json(newFighter);
  } catch (error) {
    console.error('Error creating fighter:', error);
    res.status(500).json({ error: 'Failed to create fighter' });
  }
});

app.put('/api/fighters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fighterData = req.body;
    const updatedFighter = await supabaseService.updateFighter(parseInt(id), fighterData);
    res.json(updatedFighter);
  } catch (error) {
    console.error('Error updating fighter:', error);
    res.status(500).json({ error: 'Failed to update fighter' });
  }
});

app.delete('/api/fighters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteFighter(parseInt(id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting fighter:', error);
    res.status(500).json({ error: 'Failed to delete fighter' });
  }
});

// API Routes for Fights
app.get('/api/fights', async (req, res) => {
  try {
    const fights = await supabaseService.getAllFights();
    res.json(fights);
  } catch (error) {
    console.error('Error fetching fights:', error);
    res.status(500).json({ error: 'Failed to fetch fights' });
  }
});

app.get('/api/fights/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fights = await supabaseService.getAllFights();
    const fight = fights.find(f => f.id === parseInt(id));
    if (fight) {
      res.json(fight);
    } else {
      res.status(404).json({ error: 'Fight not found' });
    }
  } catch (error) {
    console.error('Error fetching fight:', error);
    res.status(500).json({ error: 'Failed to fetch fight' });
  }
});

app.post('/api/fights', async (req, res) => {
  try {
    const fightData = req.body;
    const newFight = await supabaseService.createFight(fightData);
    res.status(201).json(newFight);
  } catch (error) {
    console.error('Error creating fight:', error);
    res.status(500).json({ error: 'Failed to create fight' });
  }
});

app.put('/api/fights/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fightData = req.body;
    const updatedFight = await supabaseService.updateFight(parseInt(id), fightData);
    res.json(updatedFight);
  } catch (error) {
    console.error('Error updating fight:', error);
    res.status(500).json({ error: 'Failed to update fight' });
  }
});

app.delete('/api/fights/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteFight(parseInt(id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting fight:', error);
    res.status(500).json({ error: 'Failed to delete fight' });
  }
});

// API Route for updating fight status
app.put('/api/fights/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedFight = await supabaseService.updateFightStatus(parseInt(id), status);
    res.json(updatedFight);
  } catch (error) {
    console.error('Error updating fight status:', error);
    res.status(500).json({ error: 'Failed to update fight status' });
  }
});

// API Route for updating fight order
app.put('/api/fights/:id/order', async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;
    const updatedFight = await supabaseService.updateFightOrder(parseInt(id), order);
    res.json(updatedFight);
  } catch (error) {
    console.error('Error updating fight order:', error);
    res.status(500).json({ error: 'Failed to update fight order' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle fight status updates
  socket.on('fightStatusUpdate', async (data) => {
    try {
      const { fightId, status } = data;
      await supabaseService.updateFightStatus(fightId, status);
      io.emit('fightStatusChanged', { fightId, status });
    } catch (error) {
      console.error('Error updating fight status via socket:', error);
    }
  });

  // Handle fight order updates
  socket.on('fightOrderUpdate', async (data) => {
    try {
      const { fightId, order } = data;
      await supabaseService.updateFightOrder(fightId, order);
      io.emit('fightOrderChanged', { fightId, order });
    } catch (error) {
      console.error('Error updating fight order via socket:', error);
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const connectionTest = await supabaseService.testConnection();
    res.json({
      status: 'ok',
      database: connectionTest.success ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Export data endpoint
app.get('/api/export', async (req, res) => {
  try {
    const events = await supabaseService.getAllEvents();
    const fighters = await supabaseService.getAllFighters();
    const fights = await supabaseService.getAllFights();
    
    res.json({
      events,
      fighters,
      fights,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 UFC Admin Server running on port ${PORT}`);
  console.log(`📊 Database: Supabase`);
  console.log(`🌐 Access: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = { app, server, io }; 