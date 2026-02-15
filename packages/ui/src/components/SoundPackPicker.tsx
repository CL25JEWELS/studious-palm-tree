/**
 * SoundPackPicker Component
 * Browse and select sound packs
 */

import React from 'react';
import type { SoundPackMetadata } from '@echoforge/shared-types';

export interface SoundPackPickerProps {
  soundPacks: SoundPackMetadata[];
  selectedPackId?: string;
  onSelect: (packId: string) => void;
  className?: string;
}

export const SoundPackPicker: React.FC<SoundPackPickerProps> = ({
  soundPacks,
  selectedPackId,
  onSelect,
  className = '',
}) => {
  const containerStyle: React.CSSProperties = {
    padding: '1rem',
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
  };

  const listStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  };

  const packStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '1rem',
    backgroundColor: isSelected ? '#2196f3' : '#121212',
    border: isSelected ? '2px solid #42a5f5' : '1px solid #424242',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  });

  return (
    <div className={className} style={containerStyle}>
      <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1rem' }}>Sound Packs</h3>
      <div style={listStyle} role="list">
        {soundPacks.map((pack) => (
          <div
            key={pack.id}
            style={packStyle(pack.id === selectedPackId)}
            onClick={() => onSelect(pack.id)}
            role="listitem"
            aria-selected={pack.id === selectedPackId}
          >
            {pack.coverImage && (
              <img
                src={pack.coverImage}
                alt={pack.name}
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px' }}
              />
            )}
            <h4 style={{ color: '#ffffff', fontSize: '0.875rem', margin: '0.5rem 0 0.25rem' }}>
              {pack.name}
            </h4>
            <p style={{ color: '#9e9e9e', fontSize: '0.75rem', margin: 0 }}>{pack.author}</p>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {pack.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.625rem',
                    padding: '0.125rem 0.5rem',
                    backgroundColor: '#424242',
                    borderRadius: '4px',
                    color: '#ffffff',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
