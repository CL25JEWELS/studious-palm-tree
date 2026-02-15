/**
 * ProjectManager Implementation
 * Handles project persistence and synchronization
 */

import type {
  IProjectManager,
  Project,
  ProjectMetadata,
  ProjectLoadError,
  ProjectSaveError,
  ProjectImportError,
  ProjectSyncError,
} from '@echoforge/shared-types';

export class ProjectManager implements IProjectManager {
  private storageKey = 'echoforge_projects';

  async createProject(config: Partial<Project>): Promise<Project> {
    const project: Project = {
      id: config.id || this.generateId(),
      name: config.name || 'Untitled Project',
      author: config.author || 'Anonymous',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      bpm: config.bpm || 120,
      signature: config.signature || { numerator: 4, denominator: 4 },
      pads: config.pads || [],
      soundPackIds: config.soundPackIds || [],
      effects: config.effects || [],
      masterVolume: config.masterVolume ?? 0.8,
      masterEffects: config.masterEffects || [],
      metadata: {
        description: config.metadata?.description,
        tags: config.metadata?.tags || [],
        isPublic: config.metadata?.isPublic ?? false,
        remixOf: config.metadata?.remixOf,
        collaborators: config.metadata?.collaborators,
        thumbnailUrl: config.metadata?.thumbnailUrl,
        duration: config.metadata?.duration,
      },
    };

    await this.saveProject(project);
    return project;
  }

  async loadProject(projectId: string): Promise<Project | null> {
    try {
      const projects = await this.getAllProjects();
      return projects.find((p) => p.id === projectId) || null;
    } catch (error) {
      throw new Error(`Failed to load project ${projectId}: ${error}`);
    }
  }

  async saveProject(project: Project): Promise<void> {
    try {
      project.updatedAt = Date.now();

      const projects = await this.getAllProjects();
      const index = projects.findIndex((p) => p.id === project.id);

      if (index >= 0) {
        projects[index] = project;
      } else {
        projects.push(project);
      }

      await this.saveAllProjects(projects);
    } catch (error) {
      throw new Error(`Failed to save project ${project.id}: ${error}`);
    }
  }

  async exportProject(projectId: string, format: 'json' | 'wav' | 'mp3'): Promise<Blob> {
    const project = await this.loadProject(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    if (format === 'json') {
      const json = JSON.stringify(project, null, 2);
      return new Blob([json], { type: 'application/json' });
    }

    // Audio export not implemented in MVP
    throw new Error(`Export format ${format} not yet implemented`);
  }

  async importProject(data: Blob): Promise<Project> {
    try {
      const text = await data.text();
      const project = JSON.parse(text) as Project;

      // Validate project structure
      if (!project.id || !project.name) {
        throw new Error('Invalid project format');
      }

      // Generate new ID to avoid conflicts
      project.id = this.generateId();
      project.createdAt = Date.now();
      project.updatedAt = Date.now();

      await this.saveProject(project);
      return project;
    } catch (error) {
      throw new Error(`Failed to import project: ${error}`);
    }
  }

  async listProjects(): Promise<ProjectMetadata[]> {
    const projects = await this.getAllProjects();
    return projects.map((p) => ({
      ...p.metadata,
      description: p.metadata.description || '',
    }));
  }

  async deleteProject(projectId: string): Promise<void> {
    const projects = await this.getAllProjects();
    const filtered = projects.filter((p) => p.id !== projectId);
    await this.saveAllProjects(filtered);
  }

  async syncToCloud(projectId: string): Promise<void> {
    // Cloud sync not implemented in MVP
    throw new Error('Cloud sync not yet implemented');
  }

  private async getAllProjects(): Promise<Project[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load projects from storage:', error);
      return [];
    }
  }

  private async saveAllProjects(projects: Project[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(projects));
    } catch (error) {
      throw new Error(`Failed to save projects to storage: ${error}`);
    }
  }

  private generateId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
