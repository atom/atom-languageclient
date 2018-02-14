import { Point, Range, TextBuffer, TextEditor as TextEditorCore, ScopeDescriptor } from 'atom';

// These need to be merged with upstream types!

export class TextEditor extends TextEditorCore {
  getURI(): string | null
  getBuffer(): TextBuffer
  getNonWordCharacters(scope: ScopeDescriptor)
}

export interface ProjectFileEvent {
  action: ProjectFileEventType,
  path: string,
  oldPath?: string
}

export type ProjectFileEventType = 'created' | 'modified' | 'deleted' | 'renamed';

export interface TextEditEvent {
  oldRange: Range,
  newRange: Range,
  oldText: string,
  newText: string,
}

export interface DidChangeTextEvent {
  changes: Array<TextEditEvent>
}

export interface DidStopChangingEvent {
  changes: Array<TextEditEvent>
}

export interface AutocompleteSuggestion {
  text?: string,
  snippet?: string,
  displayText?: string,
  replacementPrefix?: string,
  type?: string | null,
  leftLabel?: string | null,
  leftLabelHTML?: string | null,
  rightLabel?: string | null,
  rightLabelHTML?: string | null,
  className?: string | null,
  iconHTML?: string | null,
  description?: string | null,
  descriptionMarkdown?: string | null,
  descriptionMoreURL?: string | null,
}

export interface AutocompleteRequest {
  editor: TextEditorCore,
  bufferPosition: Point,
  scopeDescriptor: string,
  prefix: string,
  activatedManually?: boolean
}

export type AutocompleteDidInsert = {
  editor: TextEditor,
  triggerPosition: Point,
  suggestion: AutocompleteSuggestion,
}

export interface AutocompleteProvider {
  selector: string,
  getSuggestions: (
    request: AutocompleteRequest,
  ) => Promise<Array<AutocompleteSuggestion> | null>,
  onDidInsertSuggestion?: (arg: AutocompleteDidInsert) => void,
  getSuggestionDetailsOnSelect: (
    suggestion: AutocompleteSuggestion,
  ) => Promise<AutocompleteSuggestion | null>,
  disableForSelector?: string,
  inclusionPriority?: number,
  suggestionPriority?: number,
  excludeLowerPriority?: boolean,
}

export interface NotificationButton {
  className?: string
  onDidClick?(event: MouseEvent): void
  text?: string
}
