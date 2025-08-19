import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Alert, CircularProgress, Box } from '@mui/material';
import { urlService } from '../services/urlService';
import { logger } from '../services/logger';

const RedirectHandler = () => {
  const { shortcode } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleRedirect = async () => {
      logger.info('Handling redirect request', { shortcode });
      
      try {
        const urlData = urlService.getUrlByShortcode(shortcode);
        
        if (!urlData) {
          setStatus('error');
          setMessage('Short URL not found');
          logger.warn('Short URL not found', { shortcode });
          return;
        }
        
        if (urlService.isExpired(urlData)) {
          setStatus('error');
          setMessage('This short URL has expired');
          logger.warn('Short URL expired', { shortcode, expiresAt: urlData.expiresAt });
          return;
        }
        
        // Record the click
        urlService.recordClick(shortcode, 'redirect');
        
        setStatus('redirecting');
        setMessage(`Redirecting to ${urlData.longUrl}...`);
        
        // Redirect after a brief delay
        setTimeout(() => {
          window.location.href = urlData.longUrl;
        }, 2000);
        
        logger.info('Redirect successful', { shortcode, longUrl: urlData.longUrl });
        
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while processing the redirect');
        logger.error('Redirect error', { shortcode, error: error.message });
      }
    };
    
    if (shortcode) {
      handleRedirect();
    }
  }, [shortcode]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {status === 'loading' && (
          <Box>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Processing your request...</Typography>
          </Box>
        )}
        
        {status === 'redirecting' && (
          <Box>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Redirecting...
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {message}
            </Typography>
          </Box>
        )}
        
        {status === 'error' && (
          <Alert severity="error">
            <Typography variant="h6" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1">
              {message}
            </Typography>
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default RedirectHandler;
