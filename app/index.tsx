import { createRoot } from 'react-dom/client';

import Layout from './Layout.tsx';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Could not find root element');
}

createRoot(root).render(<Layout />);
