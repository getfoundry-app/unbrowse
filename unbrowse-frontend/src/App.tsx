import { useState, useEffect } from 'react';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';

type View = 'landing' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  // Simple hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'dashboard') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (view: View) => {
    window.location.hash = view === 'landing' ? '' : view;
    setCurrentView(view);
  };

  return (
    <>
      {currentView === 'landing' && <Landing onNavigate={navigate} />}
      {currentView === 'dashboard' && <Dashboard onNavigate={navigate} />}
    </>
  );
}

export default App;
