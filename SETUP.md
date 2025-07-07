# Quick Setup Guide

## Your Configuration

✅ **Bot Token**: Configured  
✅ **Chat ID**: 1234567890  
✅ **Thread ID**: 2  
✅ **Filter**: Free furniture in Berlin  
✅ **URL**: https://www.kleinanzeigen.de/s-zu-verschenken/berlin/moebel/k0c192l1000r35

## Next Steps

### 1. Test the Scraper

First, let's test if everything works:

```bash
# Install dependencies
npm install

# Test the scraper
npm test
```

This will:
- Build the TypeScript code
- Test your configuration
- Show you the first few ads found
- Verify the scraper can parse the page

### 2. Run the Application

If the test works, start the full application:

```bash
# Start the scraper
npm start
```

The scraper will:
- Send a startup message to your Telegram chat
- Run immediately to find new ads
- Schedule to run every 30 minutes
- Send notifications about new free furniture to your chat (thread 2)

### 3. Docker Deployment (Optional)

For production deployment:

```bash
# Build and start with Docker
docker-compose up -d

# View logs
docker-compose logs -f kleinanzeigen-scraper

# Stop
docker-compose down
```

## What to Expect

### First Run
- You'll get a startup notification in your Telegram chat
- The scraper will find existing ads and send notifications
- All found ads will be marked as "sent" in the database

### Subsequent Runs (every 30 minutes)
- Only NEW ads will be sent to Telegram
- Duplicate ads are automatically filtered out
- You'll get notifications only for genuinely new items

### Telegram Messages
Messages will be sent to:
- **Chat ID**: 1234567890
- **Thread ID**: 2 (if it's a group with topics/threads)

## Troubleshooting

### If the test fails:
1. Check your internet connection
2. Verify the URL is still valid
3. Check if Kleinanzeigen changed their HTML structure

### If no ads are found:
1. Visit your URL in a browser to verify it works
2. The search might be too specific (no current results)
3. Try a broader search URL

### If Telegram doesn't work:
1. Make sure your bot is added to the chat
2. Verify the chat ID is correct
3. Check if the thread ID (2) exists in your group

## Your Filter Details

- **Name**: My Filter
- **Type**: Free items (zu verschenken)
- **Location**: Berlin
- **Category**: Furniture (moebel)
- **Search**: Free furniture in Berlin

The scraper will monitor this specific search and notify you when new free furniture is posted in Berlin! 