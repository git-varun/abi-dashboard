import React from 'react';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
     
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-lg font-bold">Something went wrong.</h2>
          <p className="text-sm text-zinc-500">Reload the page or try a different contract.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
