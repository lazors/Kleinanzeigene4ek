const TelegramBot = require('node-telegram-bot-api');
const yaml = require('yaml');
const fs = require('fs');

// Load configuration
const config = yaml.parse(fs.readFileSync('config.yaml', 'utf8'));

// SECURITY WARNING: This file loads real config.yaml which contains sensitive data
// Only use this for testing with your own configuration
// Never commit config.yaml to version control

const bot = new TelegramBot(config.telegram.botToken, { polling: false });

async function testTelegram() {
  try {
    console.log('Testing Telegram bot...');
    console.log('Bot token:', config.telegram.botToken.substring(0, 10) + '...');
    console.log('Chat ID:', config.telegram.chatId);
    console.log('Thread ID:', config.telegram.threadId);
    
    const testMessage = '🧪 Test message from scraper bot\n\nThis is a test to verify the bot is working correctly.';
    
    const result = await bot.sendMessage(config.telegram.chatId.toString(), testMessage, {
      parse_mode: 'HTML',
      message_thread_id: config.telegram.threadId,
      disable_web_page_preview: false,
    });
    
    console.log('✅ Test message sent successfully!');
    console.log('Message ID:', result.message_id);
    console.log('Chat ID:', result.chat.id);
    console.log('Thread ID:', result.message_thread_id);
    
  } catch (error) {
    console.error('❌ Error sending test message:', error.message);
    console.error('Full error:', error);
  }
}

testTelegram(); 