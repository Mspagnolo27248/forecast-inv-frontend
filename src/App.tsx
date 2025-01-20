import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ModelProvider } from './context/ModelContext';
import { ModelSelector } from './pages/ModelSelector';
import { ModelEditor } from './pages/ModelEditor';

function App() {
  return (
    <Router>
      <ModelProvider>
        <Routes>
          <Route path="/" element={<ModelSelector />} />
          <Route path="/editor/:id" element={<ModelEditor />} />
        </Routes>
      </ModelProvider>
    </Router>
  );
}

export default App; 