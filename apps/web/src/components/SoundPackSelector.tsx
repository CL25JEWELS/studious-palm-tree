/**
 * SoundPackSelector - UI for selecting and loading sound packs
 */

import React from 'react';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/design-system';
import type { SoundPack } from '@looppad/core';

interface SoundPackSelectorProps {
  packs: SoundPack[];
  selectedPackId: string | null;
  onSelectPack: (packId: string) => void;
}

export const SoundPackSelector: React.FC<SoundPackSelectorProps> = ({
  packs,
  selectedPackId,
  onSelectPack,
}) => {
  return (
    <div
      style={{
        padding: spacing.lg,
        background: colors.bg.secondary,
        borderRadius: borderRadius.lg,
      }}
    >
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          marginBottom: spacing.md,
          color: colors.text.primary,
        }}
      >
        Sound Packs
      </h3>
      
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: spacing.md,
        }}
      >
        {packs.map((pack) => (
          <button
            key={pack.id}
            onClick={() => onSelectPack(pack.id)}
            style={{
              padding: spacing.md,
              background: selectedPackId === pack.id 
                ? colors.surface.active 
                : colors.surface.default,
              border: selectedPackId === pack.id 
                ? `2px solid ${colors.accent.cyan}` 
                : `2px solid transparent`,
              borderRadius: borderRadius.md,
              textAlign: 'left',
              transition: '150ms ease-in-out',
              boxShadow: selectedPackId === pack.id ? shadows.glow.cyan : shadows.sm,
            }}
          >
            <div
              style={{
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing.xs,
              }}
            >
              {pack.name}
            </div>
            <div
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.tertiary,
                marginBottom: spacing.xs,
              }}
            >
              {pack.description}
            </div>
            <div
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
              }}
            >
              {pack.samples.length} samples • {pack.author}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
