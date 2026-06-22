// Allow importing static image assets (logo, etc.) in TypeScript.
declare module '*.png' {
  const value: number;
  export default value;
}
