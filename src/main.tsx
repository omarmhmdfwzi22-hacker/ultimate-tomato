import React, { Component, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[Ultimate Tomato] Runtime Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#050505',
            color: '#ffffff',
            padding: '24px',
            textAlign: 'center',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: '460px',
              width: '100%',
              background: '#0d0d0d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'rgba(245, 47, 58, 0.12)',
                border: '1px solid rgba(245, 47, 58, 0.25)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="/assets/ultimate-tomato-logo.png"
                alt="Ultimate Tomato"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
            </div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '800',
                marginBottom: '8px',
                color: '#ffffff',
                letterSpacing: '-0.5px',
              }}
            >
              Ultimate Tomato Platform
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: '#a1a1aa',
                lineHeight: '1.6',
                marginBottom: '24px',
              }}
            >
              {this.state.error?.message || 'A client-side runtime exception occurred. Click reload to refresh the state.'}
            </p>
            <button
              onClick={() => {
                window.location.reload();
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: '#F52F3A',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 16px rgba(245, 47, 58, 0.35)',
                transition: 'all 0.2s',
              }}
            >
              Reload Platform
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
