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
      // Handle error silently
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

    // Check for duplicate components across pages
    const duplicates = page2Components.filter(component => 
      page3Components.includes(component)
    );
    
    if (duplicates.length > 0) {
      alert(`Error: The following components are selected for both pages: ${duplicates.join(', ')}. Each component can only be on one page.`);
      return;
    }

    try {
      const res = await fetch('/api/page-config', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ page2Components, page3Components })
      });

      if (!res.ok) {
        const errorText = await res.text();
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || 'Failed to save configuration';
        } catch {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
        
        alert(`Error: ${errorMessage}`);
        return;
      }

      const data = await res.json();

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      
      // Refetch the config to show the updated state
      await fetchConfig();
    } catch (error) {
      alert(`Network Error: ${error}`);
    }
  };

  const toggleComponent = (page: 'page2' | 'page3', component: string) => {
    if (page === 'page2') {
      setPage2Components(prev => {
        const newComponents = prev.includes(component) 
          ? prev.filter(c => c !== component) 
          : [...prev, component];
        
        // If adding to page2, remove from page3 to prevent duplicates
        if (!prev.includes(component)) {
          setPage3Components(prevPage3 => prevPage3.filter(c => c !== component));
        }
        
        return newComponents;
      });
    } else {
      setPage3Components(prev => {
        const newComponents = prev.includes(component) 
          ? prev.filter(c => c !== component) 
          : [...prev, component];
        
        // If adding to page3, remove from page2 to prevent duplicates
        if (!prev.includes(component)) {
          setPage2Components(prevPage2 => prevPage2.filter(c => c !== component));
        }
        
        return newComponents;
      });
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
        <h1 className="text-3xl font-bold mb-4">Admin Configuration</h1>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> Each component can only be assigned to one page. 
            Selecting a component for one page will automatically remove it from the other page.
          </p>
        </div>
        
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
