export interface ProjectFileEvent {
  action: ProjectFileEventType,
  path: string,
  oldPath?: string
}

export type ProjectFileEventType = 'created' | 'modified' | 'deleted' | 'renamed';
