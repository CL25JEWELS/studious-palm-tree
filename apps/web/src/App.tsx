import React from 'react';
import { AudioEngine } from '@looppad/core';

export const App: React.FC = () => {
  const [engine] = React.useState(() => new AudioEngine());

  const handleStart = () => {
    engine.start();
  };

  return (
    <div>
      <h1>Loop Pad</h1>
      <button onClick={handleStart}>Start Audio Engine</button>
    </div>
  );
};

export default App;
