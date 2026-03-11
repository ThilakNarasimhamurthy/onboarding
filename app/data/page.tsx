'use client';

import { useState, useEffect } from 'react';

export default function DataPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/profiles');
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Data</h1>
          <button
            onClick={fetchUsers}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Current Step</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">About Me</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Street</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">City</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">State</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">ZIP</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Birthdate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                // Handle both array and object formats for user_profiles
                const profile = Array.isArray(user.user_profiles) 
                  ? user.user_profiles[0] || {} 
                  : user.user_profiles || {};
                
                return (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3 text-sm">{user.id.substring(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      {user.current_step === 4 ? 'Completed' : `Step ${user.current_step}`}
                    </td>
                    <td className="px-4 py-3 text-sm">{profile.about_me || '-'}</td>
                    <td className="px-4 py-3 text-sm">{profile.street || '-'}</td>
                    <td className="px-4 py-3 text-sm">{profile.city || '-'}</td>
                    <td className="px-4 py-3 text-sm">{profile.state || '-'}</td>
                    <td className="px-4 py-3 text-sm">{profile.zip || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {profile.birthdate ? new Date(profile.birthdate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">No users yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
