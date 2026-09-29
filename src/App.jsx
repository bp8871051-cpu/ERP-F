import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <LayoutProvider>
            <AppRoutes />
          </LayoutProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
