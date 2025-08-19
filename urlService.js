import { logger } from './logger';
class URLService {
  constructor() {
    this.storageKey = 'shortenedUrls';
  }

generateShortcode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const existingUrls = this.getAllUrls();
  let shortcode;
  
  do {
    shortcode = '';
    for (let i = 0; i < 6; i++) {
      shortcode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (existingUrls.some(url => url.shortcode === shortcode));
  
  return shortcode;
}


  createShortUrl(longUrl, validity = 30, customShortcode = '') {
    logger.info('Creating short URL', { longUrl, validity, customShortcode });
    
    const existingUrls = this.getAllUrls();
    let shortcode = customShortcode;
    
    if (!shortcode) {
      shortcode = this.generateShortcode();
    } else if (existingUrls.some(url => url.shortcode === shortcode)) {
      throw new Error('Shortcode already exists');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + validity * 60 * 1000);
    
    const urlData = {
      id: Date.now() + Math.random(),
      shortcode,
      longUrl,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      clicks: []
    };

    existingUrls.push(urlData);
    localStorage.setItem(this.storageKey, JSON.stringify(existingUrls));
    
    logger.info('Short URL created successfully', { shortcode });
    return urlData;
  }

  getAllUrls() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  getUrlByShortcode(shortcode) {
    const urls = this.getAllUrls();
    return urls.find(url => url.shortcode === shortcode);
  }

  recordClick(shortcode, source = 'direct') {
    logger.info('Recording click', { shortcode, source });
    
    const urls = this.getAllUrls();
    const urlIndex = urls.findIndex(url => url.shortcode === shortcode);
    
    if (urlIndex !== -1) {
      const clickData = {
        timestamp: new Date().toISOString(),
        source,
        location: 'Unknown'
      };
      
      urls[urlIndex].clicks.push(clickData);
      localStorage.setItem(this.storageKey, JSON.stringify(urls));
      
      return urls[urlIndex];
    }
    
    return null;
  }

  isExpired(url) {
    return new Date() > new Date(url.expiresAt);
  }
}

export const urlService = new URLService();
