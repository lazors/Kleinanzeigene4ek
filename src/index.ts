import * as fs from 'fs';
import * as yaml from 'yaml';
import { Config, Filter } from './types';
import { scrapeAds } from './scraper';
import { AdDatabase } from './database';
import { TelegramNotifier } from './telegram';

// Load configuration
const config: Config = yaml.parse(fs.readFileSync('config.yaml', 'utf8'));

// Initialize services
const database = new AdDatabase(config.database.path);
const telegram = new TelegramNotifier(config.telegram);

async function checkForNewAds() {
  console.log('Checking for new ads...');

  try {
    // Process each filter
    for (const filter of config.filters) {
      console.log(`Processing filter: ${filter.name}`);

      try {
        const ads = await scrapeAds(filter.url);
        console.log(`Found ${ads.length} ads for filter: ${filter.name}`);

        // Add a small delay between filters to reduce load
        if (config.filters.indexOf(filter) > 0) {
          console.log('Waiting 3 seconds before processing next filter...');
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        for (const ad of ads) {
          try {
            console.log(
              `Processing ad ${ad.id}: "${ad.title}" (${ad.location})`
            );
            const isSent = database.isAdSent(ad, filter.name);
            console.log(
              `Ad ${ad.id} already sent for filter ${filter.name}: ${isSent}`
            );

            if (!isSent) {
              console.log(`New ad found in ${filter.name}: ${ad.title}`);

              // Try to send Telegram notification with filter-specific settings
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

              // Mark as sent regardless of Telegram success/failure
              try {
                database.markAdAsSent(ad, filter.name);
                console.log(
                  `Marked ad as sent for filter ${filter.name}: ${ad.id}`
                );
              } catch (dbError: any) {
                console.error(
                  `Error marking ad as sent "${ad.title}":`,
                  dbError.message || dbError
                );
              }
            } else {
              console.log(`Skipping already sent ad: ${ad.title}`);
            }

            // Add a small delay between ads to reduce Telegram API load
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (adError: any) {
            console.error(
              `Error processing ad "${ad.title}":`,
              adError.message || adError
            );
          }
        }
      } catch (filterError: any) {
        console.error(
          `Error processing filter "${filter.name}":`,
          filterError.message || filterError
        );
      }
    }
  } catch (error: any) {
    console.error('Error in check cycle:', error.message || error);
  }
}

// Initial check
checkForNewAds();

// Schedule regular checks
setInterval(checkForNewAds, config.scraper.intervalMinutes * 60 * 1000);

// Handle shutdown
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
