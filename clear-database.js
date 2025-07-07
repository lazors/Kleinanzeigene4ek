const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'ads.db');

console.log('Clearing database at:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Get count before clearing
  const countBefore = db.prepare('SELECT COUNT(*) as count FROM sent_ads').get();
  console.log(`Found ${countBefore.count} ads in database`);
  
  // Clear all sent ads
  const result = db.prepare('DELETE FROM sent_ads').run();
  console.log(`Deleted ${result.changes} ads from database`);
  
  // Verify it's empty
  const countAfter = db.prepare('SELECT COUNT(*) as count FROM sent_ads').get();
  console.log(`Database now contains ${countAfter.count} ads`);
  
  db.close();
  console.log('✅ Database cleared successfully!');
  
} catch (error) {
  console.error('❌ Error clearing database:', error.message);
  console.error('Full error:', error);
} 