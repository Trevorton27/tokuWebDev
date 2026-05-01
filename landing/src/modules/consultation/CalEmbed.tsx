'use client';

import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';

interface CalEmbedProps {
  name: string;
  email: string;
}

export default function CalEmbed({ name, email }: CalEmbedProps) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: 'consultation' });
      cal('ui', {
        theme: 'light',
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    })();
  }, []);

  return (
    <Cal
      namespace="consultation"
      calLink="trevor-mearns-mmrlgz/consultation"
      style={{ width: '100%', height: '100%', overflow: 'scroll' }}
      config={{
        layout: 'month_view',
        name,
        email,
      }}
    />
  );
}
