import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

const container = document.getElementById('root') as HTMLElement;

const root = ReactDOM.createRoot(container);

import('@/extension/inject/historyApiReplace').then((res) => {
	chrome.devtools.inspectedWindow.eval(`
    (${res.default})()
  `);
});

root.render(<App />);
