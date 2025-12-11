'use client';

export default function RoadmapSidebar() {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">App Roadmap</h3>
      <div className="space-y-2 text-sm">
        <div className="p-2 bg-gray-50 rounded">
          <p className="font-medium text-gray-700">Current Feature:</p>
          <p className="text-gray-600">User Authentication</p>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <p className="font-medium text-gray-700">Next Up:</p>
          <p className="text-gray-600">Course Management</p>
        </div>
        <button className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm">
          Generate Challenge
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Generate a coding challenge based on your current app context
        </p>
      </div>
    </div>
  );
}
