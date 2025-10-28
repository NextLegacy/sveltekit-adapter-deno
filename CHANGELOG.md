# Changelog for [`@nextlegacy/sveltekit-adapter-deno`](https://github.com/nextlegacy/sveltekit-adapter-deno

## 1.0.11

### Fix

- fixed "AddrInUse: Address already in use (os error 98)" when a leftover `socketPath` file already exists([#2](https://github.com/NextLegacy/sveltekit-adapter-deno/pull/2)) - thanks [@yds](https://github.com/yds)!

## 1.0.10

### Fix

- Fixed `Deno.serve()` listening on a `unix:socket` path ([#1](https://github.com/NextLegacy/sveltekit-adapter-deno/pull/1)) - thanks [@yds](https://github.com/yds)!

## 1.0.2

### Fix

- Added `.npmrc` to the build output.
- Fixed `emit` usage.

## 1.0.1

### Fix

- Renamed `index.ts` to `index.js`.

## 1.0.0

### Added

- Initial release of [`@nextlegacy/sveltekit-adapter-deno`](https://github.com/nextlegacy/sveltekit-adapter-deno).
- Basic functionality for adapting SvelteKit apps to run on Deno.
