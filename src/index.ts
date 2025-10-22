import * as fs from 'fs';
import * as yaml from 'yaml';
import { Config } from './types';
import { scrapeAds } from './scraper';
import { AdDatabase } from './database';
import { TelegramNotifier } from './telegram';

const CONFIG_PATH = process.env.CONFIG_PATH ?? 'config.yaml';
const FILTER_DELAY_MS = 3000;
const AD_DELAY_MS = 1000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function loadConfig(configPath: string): Config {
  try {
    const fileContent = fs.readFileSync(configPath, 'utf8');
    return yaml.parse(fileContent) as Config;
  } catch (error: any) {
    console.error(`Failed to load config from ${configPath}:`, error.message ?? error);
    process.exit(1);
  }
}

const config = loadConfig(CONFIG_PATH);

if (!Array.isArray(config.filters) || config.filters.length === 0) {
  console.warn('No filters configured. Exiting.');
  process.exit(0);
}

const database = new AdDatabase(config.database.path);
const telegram = new TelegramNotifier(config.telegram);

let isCheckRunning = false;

async function checkForNewAds() {
  if (isCheckRunning) {
    console.warn('Previous check still running, skipping this interval.');
    return;
  }

  console.log('Checking for new ads...');
  isCheckRunning = true;

  try {
    for (const [index, filter] of config.filters.entries()) {
      console.log(`Processing filter: ${filter.name}`);

      if (index > 0) {
        console.log('Waiting before processing next filter...');
        await sleep(FILTER_DELAY_MS);
      }

      try {
        const ads = await scrapeAds(filter.url);
        console.log(`Found ${ads.length} ads for filter: ${filter.name}`);

        for (const ad of ads) {
          try {
            console.log(`Processing ad ${ad.id}: "${ad.title}" (${ad.location})`);
            const isSent = database.isAdSent(ad, filter.name);
            console.log(`Ad ${ad.id} already sent for filter ${filter.name}: ${isSent}`);

            if (!isSent) {
              console.log(`New ad found in ${filter.name}: ${ad.title}`);

              try {
                await telegram.sendAdNotification(ad, {
                  chatId: filter.telegramChatId,
                  threadId: filter.telegramThreadId,
                });
                console.log(
                  `Successfully sent notification for: ${ad.title} to thread ${filter.telegramThreadId}`
                );
              } catch (telegramError: any) {
                console.error(
                  `Error sending Telegram notification for "${ad.title}":`,
                  telegramError.message || telegramError
                );
              }

              try {
                database.markAdAsSent(ad, filter.name);
                console.log(`Marked ad as sent for filter ${filter.name}: ${ad.id}`);
              } catch (dbError: any) {
                console.error(
                  `Error marking ad as sent "${ad.title}":`,
                  dbError.message || dbError
                );
              }
            } else {
              console.log(`Skipping already sent ad: ${ad.title}`);
            }

            await sleep(AD_DELAY_MS);
          } catch (adError: any) {
            console.error(`Error processing ad "${ad.title}":`, adError.message || adError);
          }
        }
      } catch (filterError: any) {
        console.error(`Error processing filter "${filter.name}":`, filterError.message || filterError);
      }
    }
  } catch (error: any) {
    console.error('Error in check cycle:', error.message || error);
  } finally {
    isCheckRunning = false;
  }
}

const intervalMs = Math.max(config.scraper.intervalMinutes, 1) * 60 * 1000;

checkForNewAds();
setInterval(() => {
  void checkForNewAds();
}, intervalMs);

process.on('SIGINT', () => {
  console.log('Shutting down...');
  database.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  database.close();
  process.exit(0);
});
