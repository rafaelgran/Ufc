const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ufc_events.db');

// Sample data
const sampleEvents = [
  {
    name: 'UFC 316: Dvalishvili vs O\'Malley',
    date: '2024-06-15T20:00:00',
    location: 'Newark, NJ - United States',
    venue: 'Prudential Center',
    mainEvent: 'Merab Dvalishvili vs Sean O\'Malley',
    status: 'scheduled'
  },
  {
    name: 'UFC 317: Adesanya vs Du Plessis',
    date: '2024-07-20T21:00:00',
    location: 'Las Vegas, NV - United States',
    venue: 'T-Mobile Arena',
    mainEvent: 'Israel Adesanya vs Dricus Du Plessis',
    status: 'upcoming'
  }
];

const sampleFighters = [
  {
    name: 'Merab Dvalishvili',
    nickname: 'The Machine',
    record: '16-4-0',
    weightClass: 'Bantamweight',
    ranking: 1
  },
  {
    name: 'Sean O\'Malley',
    nickname: 'Sugar',
    record: '17-1-0',
    weightClass: 'Bantamweight',
    ranking: 2
  },
  {
    name: 'Israel Adesanya',
    nickname: 'The Last Stylebender',
    record: '24-3-0',
    weightClass: 'Middleweight',
    ranking: 1
  },
  {
    name: 'Dricus Du Plessis',
    nickname: 'Stillknocks',
    record: '21-2-0',
    weightClass: 'Middleweight',
    ranking: 2
  },
  {
    name: 'Alex Pereira',
    nickname: 'Poatan',
    record: '9-2-0',
    weightClass: 'Light Heavyweight',
    ranking: 1
  },
  {
    name: 'Jiri Prochazka',
    nickname: 'BJP',
    record: '29-4-1',
    weightClass: 'Light Heavyweight',
    ranking: 2
  }
];

// Insert sample data
db.serialize(() => {
  console.log('Inserting sample events...');
  
  sampleEvents.forEach(event => {
    db.run(
      'INSERT INTO events (name, date, location, venue, mainEvent, status) VALUES (?, ?, ?, ?, ?, ?)',
      [event.name, event.date, event.location, event.venue, event.mainEvent, event.status],
      function(err) {
        if (err) {
          console.error('Error inserting event:', err);
        } else {
          console.log(`Event inserted with ID: ${this.lastID}`);
        }
      }
    );
  });
  
  console.log('Inserting sample fighters...');
  
  sampleFighters.forEach(fighter => {
    db.run(
      'INSERT INTO fighters (name, nickname, record, weightClass, ranking) VALUES (?, ?, ?, ?, ?)',
      [fighter.name, fighter.nickname, fighter.record, fighter.weightClass, fighter.ranking],
      function(err) {
        if (err) {
          console.error('Error inserting fighter:', err);
        } else {
          console.log(`Fighter inserted with ID: ${this.lastID}`);
        }
      }
    );
  });
  
  // Wait a bit for inserts to complete, then add fights
  setTimeout(() => {
    console.log('Inserting sample fights...');
    
    // Get event and fighter IDs
    db.all('SELECT id FROM events', (err, events) => {
      if (err) {
        console.error('Error getting events:', err);
        return;
      }
      
      db.all('SELECT id FROM fighters', (err, fighters) => {
        if (err) {
          console.error('Error getting fighters:', err);
          return;
        }
        
        // Create some sample fights
        const sampleFights = [
          {
            eventId: events[0].id,
            fighter1Id: fighters[0].id, // Dvalishvili
            fighter2Id: fighters[1].id, // O'Malley
            weightClass: 'Bantamweight',
            fightOrder: 1
          },
          {
            eventId: events[0].id,
            fighter1Id: fighters[4].id, // Pereira
            fighter2Id: fighters[5].id, // Prochazka
            weightClass: 'Light Heavyweight',
            fightOrder: 2
          },
          {
            eventId: events[1].id,
            fighter1Id: fighters[2].id, // Adesanya
            fighter2Id: fighters[3].id, // Du Plessis
            weightClass: 'Middleweight',
            fightOrder: 1
          }
        ];
        
        sampleFights.forEach(fight => {
          db.run(
            'INSERT INTO fights (eventId, fighter1Id, fighter2Id, weightClass, fightOrder) VALUES (?, ?, ?, ?, ?)',
            [fight.eventId, fight.fighter1Id, fight.fighter2Id, fight.weightClass, fight.fightOrder],
            function(err) {
              if (err) {
                console.error('Error inserting fight:', err);
              } else {
                console.log(`Fight inserted with ID: ${this.lastID}`);
              }
            }
          );
        });
        
        setTimeout(() => {
          console.log('Sample data insertion complete!');
          db.close();
        }, 1000);
      });
    });
  }, 1000);
}); 