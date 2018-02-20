import { Point, Range, TextBuffer, TextEditor as TextEditorCore, ScopeDescriptor, Notification } from 'atom';

declare module 'atom' {
  interface TextEditor {
    getURI(): string | null;
    getBuffer(): TextBuffer;
    getNonWordCharacters(scope: ScopeDescriptor): string;
  }

  export interface ProjectFileEvent {
    action: ProjectFileEventType;
    path: string;
    oldPath?: string;
  }

  type ProjectFileEventType = 'created' | 'modified' | 'deleted' | 'renamed';

  interface TextEditEvent {
    oldRange: Range;
    newRange: Range;
    oldText: string;
    newText: string;
  }

  interface DidChangeTextEvent {
    changes: TextEditEvent[];
  }

  interface DidStopChangingEvent {
    changes: TextEditEvent[];
  }

  interface AutocompleteSuggestion {
    text?: string;
    snippet?: string;
    displayText?: string;
    replacementPrefix?: string;
    type?: string | null;
    leftLabel?: string | null;
    leftLabelHTML?: string | null;
    rightLabel?: string | null;
    rightLabelHTML?: string | null;
    className?: string | null;
    iconHTML?: string | null;
    description?: string | null;
    descriptionMarkdown?: string | null;
    descriptionMoreURL?: string | null;
  }

  interface AutocompleteRequest {
    editor: TextEditor;
    bufferPosition: Point;
    scopeDescriptor: string;
    prefix: string;
    activatedManually?: boolean;
  }

  interface AutocompleteDidInsert {
    editor: TextEditor;
    triggerPosition: Point;
    suggestion: AutocompleteSuggestion;
  }

  interface AutocompleteProvider {
    selector: string;
    getSuggestions: (
      request: AutocompleteRequest,
    ) => Promise<AutocompleteSuggestion[] | null>;
    onDidInsertSuggestion?: (arg: AutocompleteDidInsert) => void;
    getSuggestionDetailsOnSelect: (
      suggestion: AutocompleteSuggestion,
    ) => Promise<AutocompleteSuggestion | null>;
    disableForSelector?: string;
    inclusionPriority?: number;
    suggestionPriority?: number;
    excludeLowerPriority?: boolean;
  }

  interface NotificationButton {
    className?: string;
    onDidClick?(event: MouseEvent): void;
    text?: string;
  }

  // Non-public Notification api
  interface NotificationExt extends Notification {
    isDismissed?: () => boolean;
    getOptions?: () => NotificationOptions | null;
  }
}
