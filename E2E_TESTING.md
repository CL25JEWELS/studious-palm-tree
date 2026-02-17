# E2E Testing Guide

This document outlines the End-to-End (E2E) testing strategy for the Loop Pad application.

## Overview

E2E tests validate complete user workflows from the browser through to the audio engine. These tests ensure the application works correctly as an integrated system.

## E2E Test Scenarios

### 1. Basic Playback Flow

**Objective**: Verify that users can play and stop audio sequences

**Test Steps**:
1. Launch the application
2. Verify the application loads without errors
3. Click on pad button #1 to activate it
4. Verify pad #1 shows active state (visual feedback)
5. Set BPM to 120 using the BPM control
6. Click the Play button
7. Verify transport shows "playing" state
8. Wait for at least 2 beats
9. Click the Stop button
10. Verify transport shows "stopped" state
11. Verify playback position resets to 0

**Expected Results**:
- Application loads successfully
- Pad activation provides visual feedback
- Transport controls respond correctly
- Playback starts and stops as expected

### 2. Multi-Pad Sequence

**Objective**: Verify multiple pads can be activated and played together

**Test Steps**:
1. Launch the application
2. Activate pads #1, #5, #9, and #13 (corners of 4x4 grid)
3. Verify all 4 pads show active state
4. Load sample to each activated pad
5. Set BPM to 140
6. Start playback
7. Verify all active pads play in sequence
8. Stop playback
9. Deactivate pad #5
10. Start playback again
11. Verify only 3 pads play

**Expected Results**:
- Multiple pads can be activated simultaneously
- Each pad maintains independent state
- Playback reflects current pad configuration
- Pad state changes affect playback correctly

### 3. Project Save/Load Flow

**Objective**: Verify project persistence through localStorage

**Test Steps**:
1. Launch the application
2. Create a new project named "Test Pattern"
3. Set BPM to 160
4. Activate pads #0, #4, #8, #12
5. Save the project
6. Verify success message/feedback
7. Reset/clear current project
8. Load "Test Pattern" project
9. Verify BPM is 160
10. Verify pads #0, #4, #8, #12 are active
11. Start playback to confirm audio matches

**Expected Results**:
- Project saves successfully to localStorage
- All project data (BPM, pad states) persists
- Loaded project matches saved state exactly
- Audio playback matches saved configuration

### 4. BPM Change During Playback

**Objective**: Verify tempo changes affect active playback

**Test Steps**:
1. Launch the application
2. Activate pad #0
3. Set BPM to 100
4. Start playback
5. During playback, change BPM to 180
6. Verify playback tempo increases
7. Change BPM to 60
8. Verify playback tempo decreases
9. Stop playback

**Expected Results**:
- BPM changes take effect immediately
- Playback speed adjusts without stopping
- No audio glitches during BPM transition

### 5. Volume and Sample Management

**Objective**: Verify pad volume and sample assignment

**Test Steps**:
1. Launch the application
2. Activate pad #0
3. Assign kick.wav sample to pad #0
4. Set pad volume to 50%
5. Activate pad #1
6. Assign snare.wav sample to pad #1
7. Set pad volume to 80%
8. Start playback
9. Verify pad #0 plays at lower volume than pad #1
10. Change pad #0 volume to 100%
11. Verify volume change takes effect

**Expected Results**:
- Samples can be assigned to pads
- Volume controls work independently per pad
- Volume changes affect playback immediately
- Different samples play correctly

## E2E Test Implementation

### Recommended Tools

**Option 1: Playwright** (Recommended)
- Supports all major browsers
- Built-in auto-waiting and retry logic
- Excellent debugging tools
- Good TypeScript support

**Option 2: Cypress**
- Developer-friendly interface
- Time-travel debugging
- Automatic screenshots/videos
- Strong community support

### Example E2E Test (Playwright)

\`\`\`typescript
// e2e/playback-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Basic Playback Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should play and stop audio sequence', async ({ page }) => {
    // Activate pad
    const pad1 = page.getByTestId('pad-button-0');
    await pad1.click();
    await expect(pad1).toHaveClass(/active/);

    // Set BPM
    const bpmInput = page.getByTestId('bpm-input');
    await bpmInput.fill('120');
    await expect(page.getByTestId('bpm-display')).toHaveText('120 BPM');

    // Start playback
    const playButton = page.getByTestId('play-button');
    await playButton.click();
    await expect(playButton).toBeDisabled();

    // Wait for playback
    await page.waitForTimeout(2000);

    // Stop playback
    const stopButton = page.getByTestId('stop-button');
    await stopButton.click();
    await expect(playButton).toBeEnabled();
  });

  test('should activate multiple pads', async ({ page }) => {
    // Activate corner pads
    const padIds = [0, 3, 12, 15];
    
    for (const id of padIds) {
      const pad = page.getByTestId(\`pad-button-\${id}\`);
      await pad.click();
      await expect(pad).toHaveClass(/active/);
    }

    // Verify all pads remain active
    for (const id of padIds) {
      const pad = page.getByTestId(\`pad-button-\${id}\`);
      await expect(pad).toHaveClass(/active/);
    }
  });
});
\`\`\`

## Setup Instructions

### Installing Playwright

\`\`\`bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install
\`\`\`

### Creating Playwright Config

\`\`\`typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
\`\`\`

### Running E2E Tests

\`\`\`bash
# Run all E2E tests
npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test e2e/playback-flow.spec.ts

# Debug mode
npx playwright test --debug
\`\`\`

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Clean State**: Reset application state before each test
3. **Wait Strategies**: Use proper wait strategies instead of fixed timeouts
4. **Data Attributes**: Use `data-testid` attributes for reliable element selection
5. **Assertions**: Make specific assertions about expected behavior
6. **Error Screenshots**: Capture screenshots on failure for debugging
7. **Mock Audio**: Consider mocking Web Audio API for faster tests

## Audio Testing Considerations

Testing audio playback in E2E tests is challenging. Consider:

1. **Visual Feedback**: Test visual indicators of playback rather than actual audio
2. **State Verification**: Verify application state changes correctly
3. **Mock Audio Context**: Use mock Web Audio API for deterministic tests
4. **Integration Points**: Focus on user interactions and state management
5. **Manual Verification**: Some audio testing may require manual verification

## CI Integration

E2E tests should run in CI on:
- Pull requests (before merge)
- Main branch commits
- Release builds

Configure CI to:
- Start the dev server automatically
- Run tests in headless mode
- Capture screenshots/videos on failure
- Report results clearly
- Fail build on test failures
