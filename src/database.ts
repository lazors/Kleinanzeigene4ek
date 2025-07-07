import Database from 'better-sqlite3';
import { Ad } from './types';

export class AdDatabase {
  private db: Database.Database;

  constructor(dbPath: string = '/tmp/ads.db') {
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sent_ads (
        id TEXT,
        filter_name TEXT,
        title TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, filter_name)
      )
    `);
  }

  public isAdSent(ad: Ad, filterName: string): boolean {
    const result = this.db
      .prepare('SELECT 1 FROM sent_ads WHERE id = ? AND filter_name = ?')
      .get(ad.id, filterName);
    return !!result;
  }

  public markAdAsSent(ad: Ad, filterName: string) {
    this.db
      .prepare('INSERT OR REPLACE INTO sent_ads (id, filter_name, title) VALUES (?, ?, ?)')
      .run(ad.id, filterName, ad.title);
  }

  public close() {
    this.db.close();
  }
}
