# eBay Kleinanzeigen Telegram Scraper

🔍 Automated eBay Kleinanzeigen scraper that monitors listings and sends notifications to Telegram channels/groups.

## Features

- 🕐 **Automated Scraping**: Configurable intervals (default: 30 minutes)
- 🔍 **Advanced Filtering**: Price range, keywords, location, category
- 📱 **Telegram Integration**: Send notifications to different chats and threads
- 🗄️ **Duplicate Prevention**: Built-in SQLite database to track sent ads
- 🐋 **Docker Support**: Easy deployment with Docker containers
- 🔧 **Configurable**: YAML-based configuration
- 📊 **Logging**: Comprehensive logging with Winston
- 🛡️ **Error Handling**: Robust error handling and retry mechanisms

## Quick Start

### Prerequisites

- Node.js 18+ (for local development)
- Docker & Docker Compose (for containerized deployment)
- Telegram Bot Token

### 1. Create Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create new bot with `/newbot`
3. Get your bot token
4. Add bot to your groups/channels
5. Get chat IDs using [@userinfobot](https://t.me/userinfobot)

### 2. Configuration

Copy the example configuration and modify it:

```bash
cp config.example.yaml config.yaml
```

Edit `config.yaml` with your real values:

```yaml
# Telegram Bot Configuration
telegram:
  botToken: 'YOUR_BOT_TOKEN_HERE'
  defaultChatId: 'YOUR_DEFAULT_CHAT_ID'

# Database Configuration
database:
  path: './data/ads.db'

# Scraping Configuration
scraping:
  intervalMinutes: 30
  maxRetries: 3
  delayBetweenRequests: 1000

# Search Filters
filters:
  - name: 'Мій фільтр'
    # Спосіб 1: Використовувати прямий URL (найпростіший)
    url: 'https://www.kleinanzeigen.de/s-anzeigen/berlin/c203?minPrice=500&maxPrice=1500'

    # Спосіб 2: Або налаштувати параметри вручну (якщо url не вказаний)
    # category: "immobilien"
    # location: "berlin"
    # priceMin: 500
    # priceMax: 1500
    # keywords: ["wohnung", "apartment"]
    # excludeKeywords: ["WG", "möbliert"]

    # Telegram налаштування
    telegramChatId: 'YOUR_CHAT_ID'
    # telegramThreadId: 123  # Опціонально для груп з тредами
```

### 3. Docker Deployment (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### 4. Local Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Build for production
npm run build

# Start production build
npm start
```

## Configuration Reference

### Telegram Configuration

```yaml
telegram:
  botToken: 'YOUR_BOT_TOKEN' # Required: Telegram bot token
  defaultChatId: 'CHAT_ID' # Required: Default chat for system messages
```

### Database Configuration

```yaml
database:
  path: './data/ads.db' # Path to SQLite database file
```

### Scraping Configuration

```yaml
scraping:
  intervalMinutes: 30 # How often to scrape (in minutes)
  maxRetries: 3 # Maximum retry attempts per filter
  delayBetweenRequests: 1000 # Delay between requests (in milliseconds)
```

### Filter Configuration

Є два способи налаштування фільтрів:

#### Спосіб 1: Використання прямого URL (рекомендовано)

```yaml
filters:
  - name: 'Мій фільтр'
    url: 'https://www.kleinanzeigen.de/s-anzeigen/berlin/c203?minPrice=500&maxPrice=1500'
    telegramChatId: 'YOUR_CHAT_ID'
    telegramThreadId: 123 # Опціонально
```

**Як отримати URL:**

1. Перейдіть на [kleinanzeigen.de](https://www.kleinanzeigen.de)
2. Налаштуйте всі фільтри (категорія, локація, ціна, ключові слова)
3. Скопіюйте URL з адресної строки браузера
4. Вставте в конфігурацію

#### Спосіб 2: Ручне налаштування параметрів

```yaml
filters:
  - name: 'Filter Name' # Required: Unique filter name
    category: 'immobilien' # Required: eBay category
    location: 'berlin' # Required: Location
    priceMin: 500 # Optional: Minimum price
    priceMax: 1500 # Optional: Maximum price
    keywords: ['word1', 'word2'] # Optional: Include keywords
    excludeKeywords: ['word3', 'word4'] # Optional: Exclude keywords
    telegramChatId: 'CHAT_ID' # Required: Telegram chat ID
    telegramThreadId: 123 # Optional: Telegram thread ID
```

### Available Categories

- `immobilien` - Real Estate
- `autos` - Cars
- `elektronik` - Electronics
- `mode` - Fashion
- `haus-garten` - House & Garden
- `sport` - Sports
- `musik` - Music
- `baby-kind` - Baby & Kids
- `haushaltsgeraete` - Household Appliances
- `buero` - Office

## Docker Configuration

### Environment Variables

```yaml
environment:
  - NODE_ENV=production
  - TZ=Europe/Berlin
```

### Volume Mounts

```yaml
volumes:
  - ./config.yaml:/app/config.yaml:ro # Configuration file
  - ./data:/app/data # Database storage
  - ./logs:/app/logs # Log files
```

## Telegram Bot Commands

Once running, your bot supports these commands:

- `/start` - Initialize the bot
- `/help` - Show help message
- `/status` - Show bot status

## Monitoring and Logs

### Log Files

- `logs/combined.log` - All log messages
- `logs/error.log` - Error messages only
- Console output - Real-time logging

### Health Checks

The application includes health checks for Docker:

```bash
# Check container health
docker-compose ps

# View detailed health
docker inspect kleinanzeigen-scraper
```

## Troubleshooting

### Common Issues

1. **Bot not receiving messages**

   - Verify bot token is correct
   - Check chat IDs are correct
   - Ensure bot is added to groups/channels

2. **No ads found**

   - Verify filter configuration
   - Check if location/category exist
   - Test with broader search criteria

3. **Database errors**

   - Ensure data directory has write permissions
   - Check disk space availability

4. **Docker build fails**
   - Ensure Docker has enough memory
   - Check internet connection for package downloads

### Debug Mode

Enable debug logging by modifying the logger configuration:

```typescript
// In src/utils/logger.ts
export const logger = winston.createLogger({
  level: 'debug', // Change from 'info' to 'debug'
  // ... rest of configuration
});
```

## Development

### Project Structure

```
src/
├── database/          # Database management
├── scheduler/         # Task scheduling
├── scraper/          # eBay scraping logic
├── telegram/         # Telegram bot integration
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### Available Scripts

```bash
npm run build         # Build TypeScript
npm run start         # Start production server
npm run dev          # Start development server
npm run clean        # Clean build directory
```

## Security Considerations

1. **Keep sensitive data secure**:

   - Store bot tokens in environment variables
   - Don't commit `config.yaml` to version control
   - Use read-only mounts for configuration

2. **Rate limiting**:

   - Respect eBay's terms of service
   - Use appropriate delays between requests
   - Monitor for IP blocking

3. **Resource usage**:
   - Monitor memory and CPU usage
   - Set appropriate Docker limits
   - Regular database cleanup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This tool is for educational and personal use only. Please respect eBay Kleinanzeigen's terms of service and robots.txt. Use responsibly and don't abuse the service.

---

**Note**: This scraper is not affiliated with eBay or eBay Kleinanzeigen. Use at your own risk.
