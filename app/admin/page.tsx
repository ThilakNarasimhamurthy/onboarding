'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [page2Components, setPage2Components] = useState<string[]>([]);
  const [page3Components, setPage3Components] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const allComponents = ['about_me', 'address', 'birthdate'];

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/page-config');
      const data = await res.json();
      setPage2Components(data.page2_components || []);
      setPage3Components(data.page3_components || []);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (page2Components.length === 0 || page3Components.length === 0) {
      alert('Each page must have at least one component');
      return;
    }

    try {
      const res = await fetch('/api/page-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page2Components, page3Components })
      });

      const data = await res.json();
      
      if (!res.ok) {
        alert(`Error: ${data.error || 'Failed to save configuration'}`);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      
      // Refetch the config to show the updated state
      await fetchConfig();
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  const toggleComponent = (page: 'page2' | 'page3', component: string) => {
    if (page === 'page2') {
      setPage2Components(prev =>
        prev.includes(component) ? prev.filter(c => c !== component) : [...prev, component]
      );
    } else {
      setPage3Components(prev =>
        prev.includes(component) ? prev.filter(c => c !== component) : [...prev, component]
      );
    }
  };

  const getComponentLabel = (component: string) => {
    switch (component) {
      case 'about_me': return 'About Me';
      case 'address': return 'Address';
      case 'birthdate': return 'Birthdate';
      default: return component;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Configuration</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Page 2 Components</h2>
            <div className="space-y-2">
              {allComponents.map(component => (
                <label key={component} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={page2Components.includes(component)}
                    onChange={() => toggleComponent('page2', component)}
                    className="w-4 h-4"
                  />
                  <span>{getComponentLabel(component)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Page 3 Components</h2>
            <div className="space-y-2">
              {allComponents.map(component => (
                <label key={component} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={page3Components.includes(component)}
                    onChange={() => toggleComponent('page3', component)}
                    className="w-4 h-4"
                  />
                  <span>{getComponentLabel(component)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Save Configuration
        </button>

        {saved && (
          <span className="ml-4 text-green-600">Configuration saved!</span>
        )}
      </div>
    </div>
  );
}
