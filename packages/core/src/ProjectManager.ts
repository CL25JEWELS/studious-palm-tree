/**
 * ProjectManager - Manages project state, saving, and loading
 */

export interface ProjectMetadata {
  /** Unique project identifier */
  id: string;
  /** Project name */
  name: string;
  /** Creation timestamp */
  createdAt: number;
  /** Last modified timestamp */
  modifiedAt: number;
  /** Project author */
  author?: string;
  /** Project description */
  description?: string;
}

export interface ProjectData {
  /** Project metadata */
  metadata: ProjectMetadata;
  /** Tempo in BPM */
  bpm: number;
  /** Pad configurations */
  pads: Array<{
    id: number;
    volume: number;
    sampleUrl?: string;
  }>;
  /** Pattern sequence data */
  patterns?: unknown[];
}

export interface ProjectManagerConfig {
  /** Storage backend (local storage, cloud, etc.) */
  storage?: 'local' | 'cloud';
}

export class ProjectManager {
  private currentProject?: ProjectData;
  private readonly storage: 'local' | 'cloud';

  constructor(config?: ProjectManagerConfig) {
    this.storage = config?.storage ?? 'local';
  }

  /**
   * Create a new project
   */
  createProject(name: string): ProjectData {
    const now = Date.now();
    
    this.currentProject = {
      metadata: {
        id: this.generateId(),
        name,
        createdAt: now,
        modifiedAt: now,
      },
      bpm: 120,
      pads: Array.from({ length: 16 }, (_, i) => ({
        id: i,
        volume: 0.8,
      })),
    };

    return this.currentProject;
  }

  /**
   * Load a project from storage
   */
  async loadProject(projectId: string): Promise<ProjectData> {
    // Stub implementation - would load from actual storage
    if (this.storage === 'local') {
      const stored = localStorage.getItem(`project:${projectId}`);
      if (stored) {
        this.currentProject = JSON.parse(stored);
        return this.currentProject!;
      }
    }
    
    throw new Error(`Project not found: ${projectId}`);
  }

  /**
   * Save the current project
   */
  async saveProject(): Promise<void> {
    if (!this.currentProject) {
      throw new Error('No project to save');
    }

    this.currentProject.metadata.modifiedAt = Date.now();

    if (this.storage === 'local') {
      localStorage.setItem(
        `project:${this.currentProject.metadata.id}`,
        JSON.stringify(this.currentProject)
      );
    }
  }

  /**
   * Get the current project
   */
  getCurrentProject(): ProjectData | undefined {
    return this.currentProject;
  }

  /**
   * List all available projects
   */
  async listProjects(): Promise<ProjectMetadata[]> {
    // Stub implementation - would list from actual storage
    const projects: ProjectMetadata[] = [];
    
    if (this.storage === 'local') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('project:')) {
          const data = localStorage.getItem(key);
          if (data) {
            const project = JSON.parse(data) as ProjectData;
            projects.push(project.metadata);
          }
        }
      }
    }

    return projects;
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    if (this.storage === 'local') {
      localStorage.removeItem(`project:${projectId}`);
    }

    if (this.currentProject?.metadata.id === projectId) {
      this.currentProject = undefined;
    }
  }

  private generateId(): string {
    return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
