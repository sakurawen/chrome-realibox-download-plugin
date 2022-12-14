import App from '@/App';
import '@/index.css';
import { MESSAGE_TYPE_KEY } from '@/shared/message';
import { useOriginApp } from '@/store/useApp';
import ReactDOM from 'react-dom/client';
import { onMessage } from 'webext-bridge';
import { StrictMode } from 'react';

/**
 * 监听文件夹变化
 */
onMessage<{}, MESSAGE_TYPE_KEY>('DEVTOLLS_FLUSH_FOLDER_NODES', () => {
	console.log('folder change');
	if (useOriginApp.getState().currentTab === 'explore') {
		useOriginApp.getState().freshExploreFiles();
	}
});

/**
 * 注入重写 history api 脚本
 */
import('@/extension/inject/historyApiReplace').then((res) => {
	chrome.devtools.inspectedWindow.eval(`
    (${res.default})()
  `);
});

const container = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(container);

root.render(
	<StrictMode>
		<App />
	</StrictMode>
);
