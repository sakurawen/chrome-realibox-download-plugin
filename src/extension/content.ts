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

chrome.runtime.onMessage.addListener(({ action, data }) => {
	switch (true) {
		case action === 'GET_ACCESS_INFO': {
			const [parent_id, folder_id] = getParentIdAndFolderId(location.pathname);
			const token = getToken();
			chrome.runtime.sendMessage({
				type: 'SET_ACCESS_INFO',
				data: {
					token,
					parent_id,
					folder_id,
				},
			});
		}
	}
});

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

export {};
