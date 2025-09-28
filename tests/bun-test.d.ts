declare module 'bun:test' {
  export const describe: (...args: any[]) => void;
  export const it: (...args: any[]) => void;
  export const expect: any;
  export const beforeEach: (...args: any[]) => void;
  export const afterEach: (...args: any[]) => void;
}
