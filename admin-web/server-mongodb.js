const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000", "http://localhost:8080", "capacitor://localhost", "ionic://localhost"],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
let db;
const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    await client.connect();
    db = client.db('ufc_events');
    console.log('Connected to MongoDB');
    
    // Insert sample data if collection is empty
    const eventsCount = await db.collection('events').countDocuments();
    if (eventsCount === 0) {
      await db.collection('events').insertOne({
        name: "UFC 316",
        date: "2024-06-15T20:00:00",
        location: "Newark, NJ - United States",
        venue: "Prudential Center",
        mainEvent: "Merab Dvalishvili vs Sean O'Malley",
        status: "scheduled",
        created_at: new Date()
      });
      console.log('Sample event inserted');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Fallback to in-memory data
    console.log('Falling back to in-memory data');
  }
};

// Initialize database
connectDB();

// API Routes
app.get('/api/events', async (req, res) => {
  try {
    if (db) {
      const events = await db.collection('events').find({}).sort({ date: -1 }).toArray();
      res.json(events);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { name, date, location, venue, mainEvent } = req.body;
    const newEvent = {
      name,
      date,
      location,
      venue,
      mainEvent,
      status: 'upcoming',
      created_at: new Date()
    };
    
    if (db) {
      const result = await db.collection('events').insertOne(newEvent);
      newEvent._id = result.insertedId;
    }
    
    res.json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { name, date, location, venue, mainEvent, status } = req.body;
    const updateData = { name, date, location, venue, mainEvent, status };
    
    if (db) {
      await db.collection('events').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData }
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    if (db) {
      await db.collection('events').deleteOne({ _id: new ObjectId(req.params.id) });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fighters
app.get('/api/fighters', async (req, res) => {
  try {
    if (db) {
      const fighters = await db.collection('fighters').find({}).sort({ name: 1 }).toArray();
      res.json(fighters);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fighters', async (req, res) => {
  try {
    const { name, nickname, record, weightClass, ranking } = req.body;
    const newFighter = {
      name,
      nickname,
      record,
      weightClass,
      ranking,
      created_at: new Date()
    };
    
    if (db) {
      const result = await db.collection('fighters').insertOne(newFighter);
      newFighter._id = result.insertedId;
    }
    
    res.json(newFighter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/fighters/:id', async (req, res) => {
  try {
    const { name, nickname, record, weightClass, ranking } = req.body;
    const updateData = { name, nickname, record, weightClass, ranking };
    
    if (db) {
      await db.collection('fighters').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData }
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/fighters/:id', async (req, res) => {
  try {
    if (db) {
      await db.collection('fighters').deleteOne({ _id: new ObjectId(req.params.id) });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fights
app.get('/api/fights', async (req, res) => {
  try {
    if (db) {
      const eventId = req.query.eventId;
      let query = {};
      if (eventId) {
        query.eventId = new ObjectId(eventId);
      }
      
      const fights = await db.collection('fights').find(query).toArray();
      
      // Populate fighter names
      const populatedFights = await Promise.all(fights.map(async (fight) => {
        const fighter1 = await db.collection('fighters').findOne({ _id: new ObjectId(fight.fighter1Id) });
        const fighter2 = await db.collection('fighters').findOne({ _id: new ObjectId(fight.fighter2Id) });
        
        return {
          ...fight,
          fighter1Name: fighter1?.name || 'Unknown',
          fighter1Nickname: fighter1?.nickname,
          fighter2Name: fighter2?.name || 'Unknown',
          fighter2Nickname: fighter2?.nickname
        };
      }));
      
      res.json(populatedFights);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fights', async (req, res) => {
  try {
    const { eventId, fighter1Id, fighter2Id, weightClass } = req.body;
    const newFight = {
      eventId: new ObjectId(eventId),
      fighter1Id: new ObjectId(fighter1Id),
      fighter2Id: new ObjectId(fighter2Id),
      weightClass,
      round: 1,
      timeRemaining: 300,
      status: 'scheduled',
      created_at: new Date()
    };
    
    if (db) {
      const result = await db.collection('fights').insertOne(newFight);
      newFight._id = result.insertedId;
    }
    
    res.json(newFight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/fights/:id/status', async (req, res) => {
  try {
    const { status, round, timeRemaining, winnerId } = req.body;
    const updateData = { status, round, timeRemaining };
    
    if (winnerId) {
      updateData.winnerId = new ObjectId(winnerId);
    }
    
    if (db) {
      await db.collection('fights').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData }
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV || 'development',
    database: db ? 'MongoDB Connected' : 'In-Memory',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'UFC Events API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: db ? 'MongoDB' : 'In-Memory'
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
    console.log(`Database: ${db ? 'MongoDB' : 'In-Memory'}`);
  });
} 