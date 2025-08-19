import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navigation from './components/Navigation';
import URLShortener from './components/URLShortener';
import Statistics from './components/Statistics';
import RedirectHandler from './components/RedirectHandler';
import { logger } from './services/logger';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  React.useEffect(() => {
    logger.info('Application started');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<URLShortener />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/:shortcode" element={<RedirectHandler />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
