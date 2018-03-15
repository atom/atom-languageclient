## v0.9.3

- Display buttons on showRequestMessage LSP calls - fixes many prompts from LSP packages
- logMessages from language servers are now available in the Atom IDE UI Console window

## v0.9.2

- Fix issue when completionItem documentation is returned as string
- Export ActiveServer and LanguageClientConnection types for TypeScript users

## v0.9.1

- AutoComplete on a trigger character with no further filtering now does not remove the trigger char

## v0.9.0

- AutoComplete now triggers based on settings in autocomplete-plus (min word length)
- AutoComplete now always filters results based on typed prefix (in case the server does not)
- AutoComplete static methods have changed - this might be breaking if your package was using some of them
- Converted project to TypeScript including some TypeScript type definitions for all the things!
- Filter out document symbols that are missing a name to better handle badly behaved language servers
- Duplicate visible notifications are now suppressed

## v0.8.3

- Ensure that triggerChars is correctly sent or not sent depending on whether it was auto-triggered

## v0.8.2

- Prevent ServerManager from hanging on a failed server startup promise #174 (thanks @alexheretic!)

## v0.8.1

### New

- Auto-restart language servers that crash (up to 5 times in 3 minutes) #172
- API to restart your language servers (e.g. after downloading new server, changing config) #172
- Configuration change monitoring via workspace/didChangeConfiguration #167
- API to get the connection associated with an editor to send custom messages #173

### Changes

- Trigger autocomplete all the time instead of just on triggerchars\

### Fixes

- Do not send non-null initialization parameters #171
- Clean up after unexpected server shutdown #169

## v0.8.0

This update improves auto complete support in a number of ways;

- Automatic triggering only if a trigger character specified by the server is typed (this should improve performance as well as cut down connection issues caused by crashing servers)
- Filtering is performed by atom-languageclient when server reports results are complete (perf, better results)
- Resolve is now called only if the language server supports it #162
- CompletionItemKinds defined in v3 of the protocol are now mapped
- Allows customization of the conversion between LSP and autocomplete-plus suggestions via a hook #137
- New onDidInsertSuggestion override available when autocomplete request inserted #115
- Use `CompletionItem.textEdit` field for snippet content #165

Additional changes include;

- CancellationToken support for cancelling pending requests #160
- Automatic cancellation for incomplete resolve and autocomplete requests #160
- Improved debug logging (stderr in #158 as well and signal report on exit)

## v0.7.3

- AutoCompleteAdapter now takes an [optional function for customizing suggestions](https://github.com/atom/atom-languageclient/pull/137)

## v0.7.2

- AutoComplete to CompletionItems now actually work on Atom 1.24 not just a previous PR

## v0.7.1

- AutoComplete to CompletionItems now support resolve when using Atom 1.24 or later

## v0.7.0

- Support snippet type completion items
- Move completionItem detail to right for consistency with VSCode
- Make ServerManager restartable
- Sort completion results
- LSP v3 flow types plus wiring up of willSave
- Support TextDocumentEdit in ApplyEditAdapter for v3
- Upgrade flow, remove prettier
- Busy Signals added for start and shutdown
- Dispose connection on server stop, prevent rpc errors in console

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
