'use client';

import { ReactNode } from 'react';

interface LayoutShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function LayoutShell({ children, title, description }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {title && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && <p className="mt-2 text-gray-600">{description}</p>}
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
