export function playgroundUrl(code: string): string {
  const params = new URLSearchParams({ edition: '2024', code });
  return `https://play.rust-lang.org/?${params}`;
}
export function isLocalExecutable(_code: string): false {
  return false;
} // No browser-native arbitrary Rust compiler in the MVP.
