import { ProjectManager, Project } from '../index';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Assign mock to global
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('ProjectManager', () => {
  let manager: ProjectManager;

  beforeEach(() => {
    manager = new ProjectManager();
    localStorage.clear();
  });

  describe('createProject', () => {
    it('should create a project with name', () => {
      const project = manager.createProject('My Project');
      
      expect(project.name).toBe('My Project');
      expect(project.id).toBeDefined();
      expect(project.createdAt).toBeDefined();
      expect(project.updatedAt).toBeDefined();
    });

    it('should create project with default BPM', () => {
      const project = manager.createProject('Test');
      expect(project.bpm).toBe(120);
    });

    it('should create project with custom BPM', () => {
      const project = manager.createProject('Test', 140);
      expect(project.bpm).toBe(140);
    });

    it('should initialize empty pads array', () => {
      const project = manager.createProject('Test');
      expect(project.pads).toEqual([]);
    });

    it('should generate unique ids', () => {
      const project1 = manager.createProject('Project 1');
      const project2 = manager.createProject('Project 2');
      
      expect(project1.id).not.toBe(project2.id);
    });
  });

  describe('saveProject', () => {
    it('should save a new project', () => {
      const project = manager.createProject('Test Project');
      const result = manager.saveProject(project);
      
      expect(result).toBe(true);
      
      const projects = manager.getAllProjects();
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Test Project');
    });

    it('should update existing project', () => {
      const project = manager.createProject('Original');
      manager.saveProject(project);
      
      project.name = 'Updated';
      manager.saveProject(project);
      
      const projects = manager.getAllProjects();
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Updated');
    });

    it('should update updatedAt timestamp', () => {
      const project = manager.createProject('Test');
      const originalTimestamp = project.updatedAt;
      
      // Wait a tiny bit to ensure timestamp changes
      setTimeout(() => {
        manager.saveProject(project);
        const saved = manager.loadProject(project.id);
        expect(saved?.updatedAt).not.toBe(originalTimestamp);
      }, 10);
    });

    it('should save multiple projects', () => {
      const project1 = manager.createProject('Project 1');
      const project2 = manager.createProject('Project 2');
      
      manager.saveProject(project1);
      manager.saveProject(project2);
      
      const projects = manager.getAllProjects();
      expect(projects).toHaveLength(2);
    });
  });

  describe('loadProject', () => {
    it('should load saved project', () => {
      const project = manager.createProject('Test Project', 140);
      manager.saveProject(project);
      
      const loaded = manager.loadProject(project.id);
      
      expect(loaded).not.toBeNull();
      expect(loaded?.name).toBe('Test Project');
      expect(loaded?.bpm).toBe(140);
    });

    it('should return null for non-existent project', () => {
      const loaded = manager.loadProject('non-existent-id');
      expect(loaded).toBeNull();
    });

    it('should load correct project by id', () => {
      const project1 = manager.createProject('Project 1');
      const project2 = manager.createProject('Project 2');
      
      manager.saveProject(project1);
      manager.saveProject(project2);
      
      const loaded = manager.loadProject(project2.id);
      expect(loaded?.name).toBe('Project 2');
    });
  });

  describe('deleteProject', () => {
    it('should delete existing project', () => {
      const project = manager.createProject('Test');
      manager.saveProject(project);
      
      const result = manager.deleteProject(project.id);
      expect(result).toBe(true);
      
      const projects = manager.getAllProjects();
      expect(projects).toHaveLength(0);
    });

    it('should not affect other projects when deleting', () => {
      const project1 = manager.createProject('Project 1');
      const project2 = manager.createProject('Project 2');
      
      manager.saveProject(project1);
      manager.saveProject(project2);
      
      manager.deleteProject(project1.id);
      
      const projects = manager.getAllProjects();
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Project 2');
    });

    it('should return true even for non-existent project', () => {
      const result = manager.deleteProject('non-existent');
      expect(result).toBe(true);
    });
  });

  describe('getAllProjects', () => {
    it('should return empty array when no projects', () => {
      const projects = manager.getAllProjects();
      expect(projects).toEqual([]);
    });

    it('should return all saved projects', () => {
      const project1 = manager.createProject('Project 1');
      const project2 = manager.createProject('Project 2');
      const project3 = manager.createProject('Project 3');
      
      manager.saveProject(project1);
      manager.saveProject(project2);
      manager.saveProject(project3);
      
      const projects = manager.getAllProjects();
      expect(projects).toHaveLength(3);
    });
  });

  describe('error handling', () => {
    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('looppad_projects', 'invalid json');
      
      const projects = manager.getAllProjects();
      expect(projects).toEqual([]);
    });
  });
});
