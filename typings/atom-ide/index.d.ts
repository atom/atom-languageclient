import {Disposable, Grammar, Point, Range, TextEditor} from 'atom';

/* declare module 'atom-ide' {*/

  export type OutlineProvider = {
    name: string,
    // If there are multiple providers for a given grammar, the one with the highest priority will be
    // used.
    priority: number,
    grammarScopes: Array<string>,
    updateOnEdit?: boolean,
    getOutline: (editor: TextEditor) => Promise<Outline>,
  };

  export type OutlineTree = {
    icon?: string, // from atom$Octicon | atom$OcticonsPrivate (types not allowed over rpc so we use string)

    // Must be one or the other. If both are present, tokenizedText is preferred.
    plainText?: string,
    tokenizedText?: TokenizedText,
    representativeName?: string,

    startPosition: Point,
    endPosition?: Point,
    children: Array<OutlineTree>,
  };

  export type Outline = {
    outlineTrees: Array<OutlineTree>,
  };

  export type TokenKind =
    | 'keyword'
    | 'class-name'
    | 'constructor'
    | 'method'
    | 'param'
    | 'string'
    | 'whitespace'
    | 'plain'
    | 'type';

  export type TextToken = {
    kind: TokenKind,
    value: string,
  };

  export type TokenizedText = Array<TextToken>;

  export type DefinitionProvider = {
    name: string,
    priority: number,
    grammarScopes: Array<string>,
    getDefinition: (editor: TextEditor, position: Point) => Promise<DefinitionQueryResult>,
  };

  export type IdeUri = string;

  export type Definition = {
    path: IdeUri,
    position: Point,
    range?: Range,
    id?: string,
    name?: string,
    language: string,
    projectRoot?: IdeUri,
  };

  export type DefinitionQueryResult = {
    queryRange: Array<Range>,
    definitions: Array<Definition>,
  };

  export type FindReferencesProvider = {
    // Return true if your provider supports finding references for the provided TextEditor.
    isEditorSupported(editor: TextEditor): Promise<boolean>,

    // `findReferences` will only be called if `isEditorSupported` previously returned true
    // for the given TextEditor.
    findReferences(editor: TextEditor, position: Point): Promise<FindReferencesReturn>,
  };

  export type Reference = {
    uri: IdeUri, // URI of the file path
    name?: string, // name of calling method/function/symbol
    range: Range,
  };

  export type FindReferencesData = {
    type: 'data',
    baseUri: IdeUri,
    referencedSymbolName: string,
    references: Array<Reference>,
  };

  export type FindReferencesError = {
    type: 'error',
    message: string,
  };

  export type FindReferencesReturn = FindReferencesData | FindReferencesError;

  export type MarkedString =
    | {
        type: 'markdown',
        value: string,
      }
    | {
        type: 'snippet',
        grammar: Grammar,
        value: string,
      };

  // This omits the React variant.
  export type Datatip = {
    markedStrings: Array<MarkedString>,
    range: Range,
    pinnable?: boolean,
  };

  export type DatatipProvider = {
    datatip(
      editor: TextEditor,
      bufferPosition: Point,
      // The mouse event that triggered the datatip.
      // This is null for manually toggled datatips.
      mouseEvent?: MouseEvent,
    ): Promise<Datatip>,
    validForScope(scopeName: string): boolean,
    // A unique name for the provider to be used for analytics.
    // It is recommended that it be the name of the provider's package.
    providerName: string,
  };

  export type DatatipService = {
    addProvider(provider: DatatipProvider): Disposable,
  };

  export type RangeCodeFormatProvider = {
    formatCode: (editor: TextEditor, range: Range) => Promise<Array<TextEdit>>,
    priority: number,
    grammarScopes: Array<string>,
  };

  export type TextEdit = {
    oldRange: Range,
    newText: string,
    // If included, this will be used to verify that the edit still applies cleanly.
    oldText?: string,
  };

  export type CodeHighlightProvider = {
    highlight(editor: TextEditor, bufferPosition: Point): Promise<Array<Range>>,
    priority: number,
    grammarScopes: Array<string>,
  };

  export type DiagnosticType = 'Error' | 'Warning' | 'Info';

  export type Diagnostic = {
    providerName: string,
    type: DiagnosticType,
    filePath: string,
    text?: string,
    range: Range,
  };

  export interface CodeAction {
    apply(): Promise<void>,
    getTitle(): Promise<string>,
    dispose(): void,
  }

  export type CodeActionProvider = {
    grammarScopes: Array<string>,
    priority: number,
    getCodeActions(
      editor: TextEditor,
      range: Range,
      diagnostics: Array<Diagnostic>,
    ): Promise<Array<CodeAction>>,
  }

  export type BusySignalOptions = {
    // Can say that a busy signal will only appear when a given file is open.
    // Default = null, meaning the busy signal applies to all files.
    onlyForFile?: IdeUri,
    // Is user waiting for computer to finish a task? (traditional busy spinner)
    // or is the computer waiting for user to finish a task? (action required)
    // Default = spinner.
    waitingFor?: 'computer' | 'user',
    // Debounce it? default = true for busy-signal, and false for action-required.
    debounce?: boolean,
    // If onClick is set, then the tooltip will be clickable. Default = null.
    onDidClick?: () => void,
  };

  export type BusySignalService = {
    // Activates the busy signal with the given title and returns the promise
    // from the provided callback.
    // The busy signal automatically deactivates when the returned promise
    // either resolves or rejects.
    reportBusyWhile<T>(
      title: string,
      f: () => Promise<T>,
      options?: BusySignalOptions,
    ): Promise<T>,

    // Activates the busy signal. Set the title in the returned BusySignal
    // object (you can update the title multiple times) and dispose it when done.
    reportBusy(title: string, options?: BusySignalOptions): BusyMessage,

    // This is a no-op. When someone consumes the busy service, they get back a
    // reference to the single shared instance, so disposing of it would be wrong.
    dispose(): void,
  };

  export type BusyMessage = {
    // You can set/update the title.
    setTitle(title: string): void,
    // Dispose of the signal when done to make it go away.
    dispose(): void,
  };

  export type SignatureHelpRegistry = (provider: SignatureHelpProvider) => Disposable;

  /**
   * Signature help is activated when:
   * - upon keystroke, any provider with a matching grammar scope contains
   *   the pressed key inside its triggerCharacters set
   * - the signature-help:show command is manually activated
   *
   * Once signature help has been triggered, the provider will be queried immediately
   * with the current cursor position, and then repeatedly upon cursor movements
   * until a null/empty signature is returned.
   *
   * Returned signatures will be displayed in a small datatip at the current cursor.
   * The highest-priority provider with a non-null result will be used.
   */
  export type SignatureHelpProvider = {
    priority: number,
    grammarScopes: Array<string>,

    // A set of characters that will trigger signature help when typed.
    // If a null/empty set is provided, only manual activation of the command works.
    triggerCharacters?: Set<string>,

    getSignatureHelp(editor: TextEditor, point: Point): Promise<SignatureHelp>,
  };

  export type SignatureHelp = {
    signatures: Array<Signature>,
    activeSignature?: number,
    activeParameter?: number,
  };

  export type Signature = {
    label: string,
    documentation?: string,
    parameters?: Array<SignatureParameter>,
  };

  export type SignatureParameter = {
    label: string,
    documentation?: string,
  };
// }
