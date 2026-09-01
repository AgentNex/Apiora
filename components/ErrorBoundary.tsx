'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCwIcon, TrashIcon } from './Icons';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            margin: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '14px',
            border: '1px solid var(--accent-rose)',
            background: 'rgba(244, 63, 94, 0.05)'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-rose)',
              fontSize: '20px'
            }}
          >
            ⚠️
          </div>

          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: 'var(--accent-rose)' }}>
              {this.props.fallbackTitle || 'Component Execution Recovered'}
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: '1.5' }}>
              An unexpected rendering error occurred. The application state was safely isolated to prevent a complete crash.
            </p>
          </div>

          {this.state.error && (
            <div
              className="forge-input-mono"
              style={{
                fontSize: '11px',
                color: 'var(--accent-rose)',
                padding: '8px 12px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '6px',
                maxWidth: '90%',
                overflowX: 'auto',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {this.state.error.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={this.handleReset}
              className="forge-btn forge-btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              <RefreshCwIcon size={13} />
              <span>Retry Rendering</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="forge-btn forge-btn-ghost"
              style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
