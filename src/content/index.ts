import { onMessage, sendMessage } from '@/shared/webextBridge';
import 'webext-bridge';
sendMessage('ping_background', null, 'background');


/**
 * 监听页面url变化，触发文件夹更新
 */
window.addEventListener('message', (e) => {
	const { type } = e.data;
	if (type !== 'folderChange') {
		return;
	}
	sendMessage<{}>((t) => t.DEVTOLLS_FLUSH_FOLDER_NODES, null, 'devtools');
});

/**
 * 更新访问信息
 */
onMessage<{}>('CONTENT_UPDATE_ACCESS_INFO', () => {
	const [parent_id, folder_id] = getParentIdAndFolderId(location.pathname);
	const token = getToken();
	const assessInfo = { parent_id, folder_id, token };
	sendMessage<{}>(
		(t) => t.BACKGROUND_UPDATE_ACCESS_INFO,
		{
			parent_id: parent_id || '',
			folder_id: folder_id || '',
			token: token || '',
		},
		'background'
	);
	return assessInfo;
});

/**
 * 根据key获取cookie值
 * @param {string} key
 * @returns
 */
const getCookie = (key: string) => {  
	let arr;
	const reg = new RegExp('(^| )' + key + '=([^;]*)(;|$)');
	if ((arr = document.cookie.match(reg))) {
		return unescape(arr[2]);
	} else {
		return '';
	}
};

const getToken = () => getCookie('hub_auth_token');

/**
 * 获取项目和文件夹id
 * @param {string} url
 * @returns
 */
const getParentIdAndFolderId = (url: string /*  */) => {
	const urlReg = /\/project\/([^\/]+)\/?([^\/]+)?/;
	let parent_id, folder_id;
	try {
		const match = url.match(urlReg);
		parent_id = match?.[1];
		folder_id = match?.[2];
	} catch {
		parent_id = '';
		folder_id = '';
	}
	return [parent_id, folder_id];
};
