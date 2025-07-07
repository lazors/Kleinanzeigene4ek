import axios from 'axios';
import * as cheerio from 'cheerio';
import { Ad } from './types';

export async function scrapeAds(url: string): Promise<Ad[]> {
  try {
    console.log(`Fetching ads from URL: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    console.log('Response received, parsing HTML...');
    const $ = cheerio.load(response.data);
    const ads: Ad[] = [];

    // Debug: Let's see what we're actually getting
    console.log('Looking for ad containers...');
    
    // Try multiple possible selectors based on the HTML structure
    const possibleSelectors = [
      'article',
      '.ad-listitem',
      '.aditem',
      '[data-adid]',
      '.ad-item',
      'li[data-adid]',
      '.srp-results-item'
    ];

    let foundAds = false;
    
    for (const selector of possibleSelectors) {
      const elements = $(selector);
      console.log(`Trying selector "${selector}": found ${elements.length} elements`);
      
      if (elements.length > 0) {
        console.log(`First element HTML preview:`);
        console.log(elements.first().html()?.substring(0, 300) + '...');
        
        elements.each((_, element) => {
          const $el = $(element);
          
          // Try to find the ad ID in various attributes
          const id = $el.attr('data-adid') || 
                    $el.attr('data-id') || 
                    $el.find('[data-adid]').attr('data-adid') ||
                    $el.find('a').attr('href')?.match(/\/(\d+)$/)?.[1] || 
                    '';
          
          if (!id) {
            console.log('Skipping element: No ad ID found');
            return;
          }

          // Try to find the title in various ways
          const title = $el.find('h2').text().trim() ||
                       $el.find('h3').text().trim() ||
                       $el.find('.ad-title').text().trim() ||
                       $el.find('a').text().trim() ||
                       '';
          
          if (!title) {
            console.log(`Skipping ad ${id}: No title found`);
            return;
          }

          // Get the URL
          const linkEl = $el.find('a').first();
          const relativeUrl = linkEl.attr('href') || '';
          const adUrl = relativeUrl.startsWith('http') ? relativeUrl : `https://www.kleinanzeigen.de${relativeUrl}`;

          // Extract other details
          const description = $el.find('p').text().trim() || 
                            $el.find('.ad-description').text().trim() || 
                            '';
          
          const price = $el.find('.price').text().trim() || 
                       $el.find('.ad-price').text().trim() || 
                       'Zu verschenken';
          
          const location = $el.find('.location').text().trim() || 
                          $el.find('.ad-location').text().trim() || 
                          '';
          
          // Get image URL if available
          const imageUrl = $el.find('img').attr('src') || 
                          $el.find('img').attr('data-src') || 
                          undefined;

          console.log(`Processing ad ${id}: "${title}" (${location})`);
          ads.push({
            id,
            title,
            description,
            price,
            location,
            url: adUrl,
            imageUrl,
          });
          
          foundAds = true;
        });
        
        if (foundAds) {
          break; // Stop trying other selectors if we found ads
        }
      }
    }

    // If no ads found with specific selectors, try a more general approach
    if (!foundAds) {
      console.log('No ads found with specific selectors, trying general approach...');
      
      // Look for any links that might be ads
      $('a[href*="/s-anzeige/"]').each((_, element) => {
        const $el = $(element);
        const href = $el.attr('href') || '';
        const id = href.match(/\/(\d+)$/)?.[1] || '';
        const title = $el.text().trim();
        
        if (id && title) {
          console.log(`Found potential ad via link: ${id} - ${title}`);
          ads.push({
            id,
            title,
            description: '',
            price: 'Zu verschenken',
            location: '',
            url: href.startsWith('http') ? href : `https://www.kleinanzeigen.de${href}`,
            imageUrl: undefined,
          });
        }
      });
    }

    console.log(`Successfully processed ${ads.length} ads`);
    return ads;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Network error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url,
        message: error.message,
      });
    } else {
      console.error('Error scraping ads:', error);
    }
    return [];
  }
}
