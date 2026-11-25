import { useState } from 'react';
import SampleGraph from './samplegraph';
import BigGraph from './BigGraph';
import './App.css';

export default function App() {
  const [view, setView] = useState('full');
  return (
    <div className="shell">
      <nav className="tabs">
        <button className={view === 'full' ? 'on' : ''} onClick={() => setView('full')}>
          Full network (D3)
        </button>
        <button className={view === 'sample' ? 'on' : ''} onClick={() => setView('sample')}>
          Sample (React Flow)
        </button>
      </nav>
      <div className="content">
        {view === 'full' ? <BigGraph /> : <SampleGraph />}
      </div>
    </div>
  );
}