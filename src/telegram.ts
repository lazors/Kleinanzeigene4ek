import TelegramBot from 'node-telegram-bot-api';
import { Ad, Config } from './types';

interface TelegramOptions {
  chatId: string;
  threadId: number;
}

export class TelegramNotifier {
  private bot: TelegramBot;
  private config: Config['telegram'];
  private lastMessageTime: number = 0;
  private readonly MIN_DELAY_MS = 2000; // 2 seconds between messages

  constructor(config: Config['telegram']) {
    this.bot = new TelegramBot(config.botToken, { polling: false });
    this.config = config;
  }

  public async sendAdNotification(ad: Ad, options?: TelegramOptions) {
    const message = this.formatAdMessage(ad);
    const chatId = options?.chatId || this.config.chatId.toString();
    const threadId = options?.threadId || this.config.threadId;

    // Rate limiting: ensure minimum delay between messages
    await this.enforceRateLimit();

    try {
      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        message_thread_id: threadId,
        disable_web_page_preview: false,
      });
      
      // Update last message time
      this.lastMessageTime = Date.now();
      
    } catch (error: any) {
      console.error('Error sending Telegram notification:', error);
      
      // Handle rate limiting specifically
      if (error.code === 'ETELEGRAM' && error.response?.statusCode === 429) {
        const retryAfter = error.response?.parameters?.retry_after || 35;
        console.log(`Rate limited by Telegram. Waiting ${retryAfter} seconds before retry...`);
        
        // Wait for the specified time plus some buffer
        await new Promise(resolve => setTimeout(resolve, (retryAfter + 5) * 1000));
        
        // Try again once
        try {
          await this.bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            message_thread_id: threadId,
            disable_web_page_preview: false,
          });
          this.lastMessageTime = Date.now();
          console.log('Successfully sent message after retry');
        } catch (retryError: any) {
          console.error('Failed to send message even after retry:', retryError);
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastMessage = now - this.lastMessageTime;
    
    if (timeSinceLastMessage < this.MIN_DELAY_MS) {
      const delayNeeded = this.MIN_DELAY_MS - timeSinceLastMessage;
      console.log(`Rate limiting: waiting ${delayNeeded}ms before sending next message`);
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }
  }

  private formatAdMessage(ad: Ad): string {
    return (
      `🆕 <b>${ad.title}</b>\n\n` +
      `📋 ${ad.description}\n\n` +
      `📍 ${ad.location}\n` +
      (ad.price && ad.price !== 'Zu verschenken' ? `💰 ${ad.price}\n\n` : '') +
      `🔗 <a href="${ad.url}">Zur Anzeige</a>`
    );
  }
}
