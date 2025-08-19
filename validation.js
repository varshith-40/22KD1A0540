export const validateURL = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateShortcode = (code) => {
  if (!code) return true; // Optional field
  return /^[a-zA-Z0-9]{3,10}$/.test(code);
};

export const validateValidity = (minutes) => {
  const num = parseInt(minutes);
  return !isNaN(num) && num > 0 && num <= 10080; // Max 1 week
};
