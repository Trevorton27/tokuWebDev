export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Sign in to Signal Works LMS
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Authentication implementation coming soon
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-500">
            TODO: Implement authentication with your preferred provider (NextAuth.js, Clerk, Auth0, etc.)
          </p>
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Integration Options:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>NextAuth.js (Email, OAuth providers)</li>
              <li>Clerk (Hosted auth UI)</li>
              <li>Auth0 (Enterprise SSO)</li>
              <li>Supabase Auth</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
