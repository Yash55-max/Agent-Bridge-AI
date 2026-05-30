declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Allow importing plain CSS files as a side-effect (global styles)
declare module '*.css';
