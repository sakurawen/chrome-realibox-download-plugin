import App from '@/App';
import '@/index.css';
import { useOriginApp } from '@/store/useApp';
import { ReactNode, StrictMode } from 'react';
import ReactDOM, { Root } from 'react-dom/client';
import { onMessage } from '@/shared/webextBridge';
import { injectHistoryApiReplaceScript } from '@/shared/inject';

let currentRoot: Root | undefined;
let rendered = false;

const render = (node: ReactNode) => {
	if (currentRoot) {
		currentRoot.unmount();
	}
	const container = document.getElementById('root') as HTMLElement;
	currentRoot = ReactDOM.createRoot(container);
	currentRoot?.render(node);
	rendered = true;
};

const init = () => {
	if (rendered) return;
	/**
	 * 监听文件夹变化
	 */
	onMessage<{}>(
		(type) => type.DEVTOLLS_FLUSH_FOLDER_NODES,
		() => {
			console.log('folder change');
			if (useOriginApp.getState().currentTab === 'explore') {
				useOriginApp.getState().freshExploreFiles();
			}
		}
	);
	injectHistoryApiReplaceScript();
	render(
		<StrictMode>
			<App />
		</StrictMode>
	);
};

init();
