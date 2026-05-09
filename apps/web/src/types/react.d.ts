// React 19 JSX namespace declaration
import type React from 'react';

declare global {
  namespace JSX {
    type Element = React.ReactElement;
  }
}

export {};
