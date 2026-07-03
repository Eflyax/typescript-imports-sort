# TIS Formatter — Zed extension

Runs the `typescript-imports-sort` formatter (imports, blocks, Vue components,
CSS properties, JSON keys) as a Zed language server. Works locally and over
remote SSH.

## Prerequisites

- **Local:** a Rust toolchain with the wasm target
  (`rustup target add wasm32-wasip1`). Zed compiles the dev extension on install.
- **Node:** provided by Zed's managed runtime — no manual install, including on
  remote hosts.

## Build the server bundle

The committed `server/dist/server.js` is what runs. Rebuild it after changing
formatter code:

```bash
cd server && npm install && npm run build
```

## Install (local)

1. Zed → command palette → `zed: install dev extension`.
2. Select this `zed-extension/` directory. Zed compiles and loads it.
3. Merge `settings.snippet.json` into your Zed `settings.json` (per-language
   `formatter` + `format_on_save`).
4. Merge `keymap.snippet.json` into your `keymap.json` for an on-demand
   shortcut (`cmd-alt-l` → `editor::Format`). Change the key as you like.

## Remote SSH

Locally-installed extensions auto-propagate to the remote host, so no extra
steps are needed there. The language server runs on the remote using Zed's
managed Node. Put the per-language `formatter` settings in the project's
`.zed/settings.json` (read by both ends) so the remote uses this formatter.

## What it does

Full-document formatting only. On format it replaces the whole buffer with the
sorted/normalised output (tabs). `package.json` is special-cased: top-level key
order is preserved and only `dependencies` / `devDependencies` /
`peerDependencies` values are sorted.
