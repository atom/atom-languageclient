## v0.6.7

- Update vscode-jsonrpc from 3.3.1 to 3.4.1
- Allow file: uri without // or /// from the server

## v0.6.6

- Allow filtering for didChangeWatchedFiles to workaround language servers triggering full rebuilds on changes to .git/build folders etc.
- Add flow type definitions for Atom IDE UI's busy signal

## v0.6.5

- Send rootUri along with rootPath on initialize for compatibility with LSP v3 servers
- New signature helper adapter for `textDocument/signatureHelp`
- Upgrade various npm runtime and dev dependencies
- Revert to using item.label when no item.insertText for AutoComplete+
- Take priority over built-in AutoComplete+ provider

## v0.6.4

- Capture error messages from child process launch/exit for better logging
- New `workspace/applyEdit` adapter
- New `document/codeAction` adapter
- Order OutlineView depending on source line & position

## v0.6.3

- Additional error logging

## v0.6.2

- Clear linter messages on shutdown

## v0.6.1

- Accidental republish of v0.6.0

## v0.6.0

- Handle duplicate change events for incremental doc syncing
- Handle files opened multiple times in different windows/editors
- Fix GitHub repo link in package.json
- Ensure child process killed on exit/reload
- Do not convert http:// and https:// uri's as if they were file://

## v0.5.0

- Allow duplicate named nodes in OutlineView
- Do not npm publish pre-transpiled sources or misc files
- Send LSP `exit` notification after `shutdown`
- Use `atom.project.onDidChangeFiles` for fs monitoring instead of faking on save

## v0.4.1

- New `document/codeHighlights` adapter
- Change nuclide flowtypes to atomIde
- Remove redundant log messaging
- Add eslint to build and make files compliant


## v0.4.0

- Switch code format to new range provider
- Remove postInstall now project is released
