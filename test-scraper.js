const { ConfigManager } = require('./dist/utils/config');
const { KleinanzeigenScraper } = require('./dist/scraper/kleinanzeigen');

async function testScraper() {
  try {
    console.log('🔍 Testing scraper with your configuration...');
    
    // Load configuration
    const configManager = new ConfigManager();
    const filters = configManager.getFilters();
    
    console.log(`📋 Found ${filters.length} filter(s)`);
    
    // Initialize scraper
    const scraper = new KleinanzeigenScraper(1000);
    
    // Test each filter
    for (const filter of filters) {
      console.log(`\n🎯 Testing filter: ${filter.name}`);
      console.log(`🔗 URL: ${filter.url || 'Manual parameters'}`);
      
      try {
        const result = await scraper.scrapeFilter(filter);
        
        console.log(`✅ Success! Found ${result.ads.length} ads`);
        
        if (result.ads.length > 0) {
          console.log('\n📝 First few ads:');
          result.ads.slice(0, 3).forEach((ad, index) => {
            console.log(`  ${index + 1}. ${ad.title}`);
            console.log(`     Price: ${ad.priceText || 'Free'}`);
            console.log(`     Location: ${ad.location}`);
            console.log(`     URL: ${ad.url}`);
            console.log('');
          });
        }
        
      } catch (error) {
        console.error(`❌ Error testing filter ${filter.name}:`, error.message);
      }
      
      // Wait between tests
      await scraper.wait();
    }
    
    console.log('🎉 Test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

testScraper(); 