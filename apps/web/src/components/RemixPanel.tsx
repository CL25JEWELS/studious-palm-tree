import React from 'react';
import type { ProjectMetadata } from '@looppad/core';

export interface RemixPanelProps {
  /** Current project metadata */
  project?: ProjectMetadata;
  /** Callback to create new project */
  onNewProject: () => void;
  /** Callback to save current project */
  onSaveProject: () => void;
  /** Callback to load a project */
  onLoadProject: (projectId: string) => void;
}

/**
 * RemixPanel - Project management and social features
 */
export const RemixPanel: React.FC<RemixPanelProps> = ({
  project,
  onNewProject,
  onSaveProject,
  onLoadProject,
}) => {
  return (
    <div
      className="remix-panel"
      style={{
        padding: '20px',
        backgroundColor: '#1a1a1f',
        borderRadius: '8px',
        marginTop: '20px',
      }}
    >
      <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px' }}>
        Project
      </h3>

      {project && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ color: '#00d9ff', fontSize: '16px', fontWeight: 'bold' }}>
            {project.name}
          </div>
          <div style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>
            Created: {new Date(project.createdAt).toLocaleString()}
          </div>
          {project.description && (
            <div style={{ color: '#ccc', fontSize: '14px', marginTop: '5px' }}>
              {project.description}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={onNewProject}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#ffea00',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          New Project
        </button>
        <button
          onClick={onSaveProject}
          disabled={!project}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: project ? '#00ff88' : '#333',
            color: project ? '#000' : '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: project ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
          }}
        >
          Save Project
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <div style={{ color: '#888', fontSize: '12px', marginBottom: '10px' }}>
          Social features (remix, share) coming soon...
        </div>
      </div>
    </div>
  );
};
