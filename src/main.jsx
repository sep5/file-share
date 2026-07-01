import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';
import GuestbookPage from './pages/GuestbookPage.jsx';
import theme from './theme.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/guestbook' element={<GuestbookPage />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
