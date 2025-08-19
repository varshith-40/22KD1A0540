import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { logger } from '../services/logger';
import { urlService } from '../services/urlService';
import { validateURL, validateShortcode, validateValidity } from '../utils/validation';

const URLShortener = () => {
  const [urlEntries, setUrlEntries] = useState(
    Array(5).fill().map((_, index) => ({
      id: index,
      longUrl: '',
      validity: 30,
      shortcode: ''
    }))
  );
  
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (index, field, value) => {
    const newEntries = [...urlEntries];
    newEntries[index][field] = value;
    setUrlEntries(newEntries);
    
    // Clear error when user starts typing
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const validateEntry = (entry, index) => {
    const entryErrors = {};
    
    if (entry.longUrl && !validateURL(entry.longUrl)) {
      entryErrors[`${index}-longUrl`] = 'Please enter a valid URL (must start with http:// or https://)';
    }
    
    if (entry.shortcode && !validateShortcode(entry.shortcode)) {
      entryErrors[`${index}-shortcode`] = 'Shortcode must be 3-10 alphanumeric characters';
    }
    
    if (!validateValidity(entry.validity)) {
      entryErrors[`${index}-validity`] = 'Validity must be a positive number (max 10080 minutes)';
    }
    
    return entryErrors;
  };

  const handleSubmit = async () => {
    logger.info('Starting URL shortening process');
    setLoading(true);
    setErrors({});
    
    const validEntries = urlEntries.filter(entry => entry.longUrl.trim());
    const allErrors = {};
    
    // Validate all entries
    validEntries.forEach((entry, index) => {
      const entryErrors = validateEntry(entry, index);
      Object.assign(allErrors, entryErrors);
    });
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setLoading(false);
      return;
    }
    
    // Process entries
    const results = [];
    
    for (const entry of validEntries) {
      try {
        const result = await urlService.createShortUrl(
          entry.longUrl,
          parseInt(entry.validity) || 30,
          entry.shortcode
        );
        results.push({
          ...result,
          shortUrl: `http://localhost:3000/${result.shortcode}`
        });
      } catch (error) {
        logger.error('Failed to create short URL', { error: error.message });
        const entryIndex = urlEntries.findIndex(e => e.longUrl === entry.longUrl);
        allErrors[`${entryIndex}-shortcode`] = error.message;
      }
    }
    
    setResults(results);
    setErrors(allErrors);
    setLoading(false);
    
    logger.info('URL shortening completed', { resultsCount: results.length });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          URL Shortener
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }} align="center">
          Shorten up to 5 URLs at once
        </Typography>

        <Box component="form" noValidate>
          {urlEntries.map((entry, index) => (
            <Card key={entry.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  URL {index + 1}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Original URL"
                      placeholder="https://example.com"
                      value={entry.longUrl}
                      onChange={(e) => handleInputChange(index, 'longUrl', e.target.value)}
                      error={!!errors[`${index}-longUrl`]}
                      helperText={errors[`${index}-longUrl`]}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Validity (minutes)"
                      type="number"
                      value={entry.validity}
                      onChange={(e) => handleInputChange(index, 'validity', e.target.value)}
                      error={!!errors[`${index}-validity`]}
                      helperText={errors[`${index}-validity`] || 'Default: 30 minutes'}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode (Optional)"
                      placeholder="abc123"
                      value={entry.shortcode}
                      onChange={(e) => handleInputChange(index, 'shortcode', e.target.value)}
                      error={!!errors[`${index}-shortcode`]}
                      helperText={errors[`${index}-shortcode`] || '3-10 alphanumeric characters'}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || !urlEntries.some(entry => entry.longUrl.trim())}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Creating...' : 'Create Short URLs'}
            </Button>
          </Box>
        </Box>

        {results.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Results
            </Typography>
            
            {results.map((result, index) => (
              <Alert key={result.id} severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2" component="div">
                  <strong>Original:</strong> {result.longUrl}
                </Typography>
                <Typography variant="body2" component="div">
                  <strong>Short URL:</strong> 
                  <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                    {result.shortUrl}
                  </a>
                </Typography>
                <Typography variant="body2" component="div">
                  <strong>Expires:</strong> {new Date(result.expiresAt).toLocaleString()}
                </Typography>
              </Alert>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default URLShortener;
