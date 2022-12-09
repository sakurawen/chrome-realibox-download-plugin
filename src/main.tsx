import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { getCurrentTab, MESSAGE_TYPE } from '@/utils';

const pathname = location.pathname;
if (chrome.devtools) {
	chrome.runtime.getBackgroundPage(() => {
		chrome.devtools.panels.create(
			'Download Plugin',
			'/dist/vite.svg',
			'/dist/index.html',
			() => {
				getCurrentTab().then((tab) => {
					chrome.tabs.sendMessage(tab?.id || 0, {
						type: MESSAGE_TYPE.FLUSH_FOLDER_NODES,
					});
				});
			}
		);
	});
}

const container = document.getElementById('root') as HTMLElement;

const root = ReactDOM.createRoot(container);
root.render(<App />);
