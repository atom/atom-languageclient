# Atom Language Server Protocol Client
[![macOS Build Status](https://travis-ci.org/atom/atom-languageclient.svg?branch=master)](https://travis-ci.org/atom/atom-languageclient) [![Windows Build Status](https://ci.appveyor.com/api/projects/status/xibqpw9h3lya87xs/branch/master?svg=true
)](https://ci.appveyor.com/project/Atom/atom-languageclient/branch/master) [![Dependency Status](https://david-dm.org/atom/atom-languageclient.svg)](https://david-dm.org/atom/atom-languageclient)

Provide integration of Language Server Protocol servers to Atom.

## Background

Language Server Protocol is a JSON-RPC based mechanism whereby a client (IDE) may connect to an out-of-process language server that can provide rich analysis, refactoring and interactive features for a given programming language.  The specification is available at https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md

## Implementation

This npm package can be used by Atom package authors wanting to integrate their language servers with Atom. It provides:

* Conversion routines between Atom and LSP types
* A FlowTyped wrapper around JSON-RPC for v2 of the LSP protocol (v3 to follow)
* All necessary FlowTyped input and return structures for LSP, notifications etc.
* A number of adapters to translate communication between Atom + popular packages and the LSP's capabilities
* Automatic wiring up of adapters based on the negotiated capabilities of the language server
* Helper functions for downloading additional non-npm dependencies

## Considerations

We went with the library approach for a number of reasons;

1. Avoids developing a huge LSP-like interface in Atom for language server packages to then try and fill
2. Language Server Protocol packages can be treated the same as any other Atom package
3. The library can be revised without breaking existing LSP packages

This modular-kit with a lot of automation means it is easy for people developing LSP packages for Atom to easily get up and running yet still provide a good level of customization.

### Unresolved

1. How to shut-down language servers when they are no longer required
2. Should registration of providers be dynamic (code would be much nicer, less for package authors to maintain)

## Capabilities

The language server protocol consists of a number of capabilities. Some of these already have a counterpoint we can connect up to today while others do not.  The following table shows each capability in v2 and how we intend to wire it up in Atom;

| Capability                      | Atom interface                |
|---------------------------------|-------------------------------|
| window/showMessage              | Notifications package         |
| window/showMessageRequest       | Notifications package (TODO)  |
| window/logMessage               | Ignored                       |
| telemetry/event                 | Ignored                       |
| workspace/didChangeWatchedFiles | Need to expose Atom watcher?  |
| textDocument/publishDiagnostics | Linter API                    |
| textDocument/completion         | AutoComplete+ API             |
| completionItem/resolve          | AutoComplete+ API? (TBD)      |
| textDocument/hover              | TBD <sup>1</sup>              |
| textDocument/signatureHelp      | TBD                           |
| textDocument/definition         | Nuclide hyperclick            |
| textDocument/findReferences     | Nuclide findReferences        |
| textDocument/documentHighlight  | Nuclide hyperclick            |
| textDocument/documentSymbol     | Nuclide outline view (TBD)    |
| workspace/symbol                | Atom symbols api rework?      |
| textDocument/codeAction         | TBD                           |
| textDocument/codeLens           | TBD                           |
| textDocument/formatting         | Format File command           |
| textDocument/rangeFormatting    | Format Selection command      |
| textDocument/onTypeFormatting   | TBD                           |
| textDocument/rename             | TBD                           |
| workspace/applyEdit             | TODO                          |
| textDocument/didChange          | Send on save, watcher? (TBD)  |
| textDocument/didOpen            | Send on open                  |
| textDocument/didSave            | Send on save                  |
| textDocument/didClose           | Send on close                 |

<sup>1</sup> Nuclide Datatips requires React which would force all LSP package authors to ship React. LSP actually exposes markdown. We should consider a pop-up UI that handles markdown and ship in core.

## Developing packages

Some notes:

* The underlying JSON-RPC communication is handled by the vscode-jsonrpc npm module
* Language packages should be activated using existing activation hooks for the associated grammar

An absolute minimal implementation can be illustrated by the Omnisharp package which has only npm-managed dependencies:

```javascript
const cp = require('child_process')
const {AutoLanguageClient} = require('atom-languageclient')

class OmnisharpLanguageServer extends AutoLanguageClient {
  getGrammarScopes () { return [ 'source.cs' ] }
  getLanguageName () { return 'C#' }
  getServerName () { return 'OmniSharp' }

  startServerProcess () {
    return cp.spawn('node', [ require.resolve('omnisharp-client/languageserver/server') ])
  }
}

module.exports = new OmnisharpLanguageServer()
```

Some more elaborate scenarios can be found in the Java LSP package which includes:

* Downloading and unpacking non-npm dependencies (in this case a .tar.gz containing JAR files)
* Per-platform start-up configuration
* Wiring up custom extensions to the protocol (language/status to Atom Status-Bar, language/actionableNotification to Atom Notifications)

### Available packages

Right now we have the following experimental Atom LSP packages in development. They are mostly usable baring missing some features that either the LSP doesn't support or that we don't yet expose in the capabilities table above.

* [languageserver-java](https://github.com/atom/languageserver-java) provides Java support via [Java Eclipse JDT](https://github.com/eclipse/eclipse.jdt.ls)
* [languageserver-csharp](https://github.com/atom/languageserver-csharp) provides C# support via [Omnisharp (node-omnisharp)](https://github.com/OmniSharp/omnisharp-node-client)

Additional LSP servers for consideration can be found at http://langserver.org/

## Contributing
Always feel free to help out!  Whether it's [filing bugs and feature requests](https://github.com/atom/atom-languageclient/issues/new) or working on some of the [open issues](https://github.com/atom/atom-languageclient/issues), Atom's [contributing guide](https://github.com/atom/atom/blob/master/CONTRIBUTING.md) will help get you started while the [guide for contributing to packages](https://github.com/atom/atom/blob/master/docs/contributing-to-packages.md) has some extra information.

## License
MIT License.  See [the license](LICENSE.md) for more details.
