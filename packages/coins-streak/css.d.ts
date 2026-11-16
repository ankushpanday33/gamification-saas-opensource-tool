// esbuild loads .css as text for the browser bundle (see build:coins in the root package.json).
declare module '*.css' {
  const css: string;
  export default css;
}

// Optional dependency, only loaded when a Rive override animation is configured.
declare module '@rive-app/canvas';
