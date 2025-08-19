import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { urlService } from '../services/urlService';
import { logger } from '../services/logger';

const Statistics = () => {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    logger.info('Loading statistics page');
    const allUrls = urlService.getAllUrls();
    setUrls(allUrls);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (url) => {
    return urlService.isExpired(url);
  };

  if (urls.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            URL Statistics
          </Typography>
          <Alert severity="info">
            No shortened URLs found. Create some URLs first!
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          URL Statistics
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }} align="center">
          Overview of all shortened URLs and their performance
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Short URL</strong></TableCell>
                <TableCell><strong>Original URL</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
                <TableCell><strong>Expires</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Total Clicks</strong></TableCell>
                <TableCell><strong>Click Details</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.map((url) => (
                <TableRow key={url.id}>
                  <TableCell>
                    <a 
                      href={`http://localhost:3000/${url.shortcode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      localhost:3000/{url.shortcode}
                    </a>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, wordBreak: 'break-all' }}>
                    {url.longUrl}
                  </TableCell>
                  <TableCell>{formatDate(url.createdAt)}</TableCell>
                  <TableCell>{formatDate(url.expiresAt)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={isExpired(url) ? 'Expired' : 'Active'} 
                      color={isExpired(url) ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={url.clicks.length} 
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {url.clicks.length > 0 ? (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="body2">
                            View {url.clicks.length} clicks
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box>
                            {url.clicks.map((click, index) => (
                              <Box key={index} sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="body2">
                                  <strong>Time:</strong> {formatDate(click.timestamp)}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Source:</strong> {click.source}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Location:</strong> {click.location}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No clicks yet
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Statistics;
