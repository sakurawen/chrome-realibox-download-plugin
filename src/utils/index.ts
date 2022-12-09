export const getCookie = (name: string) => {
	let arr;
	const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
	if ((arr = document.cookie.match(reg))) {
		return unescape(arr[2]);
	} else {
		return '';
	}
};

/**
 * 获取当前活跃tab
 * @returns
 */
export const getCurrentTab = async () => {
	const [tab] = await chrome.tabs.query({
		active: true,
		currentWindow: true,
	});
	return tab;
};

export const MESSAGE_TYPE = {
	CREATE_PACK_TASK: 'CREATE_PACK_TASK',
	FLUSH_FOLDER_NODES: 'FLUSH_FOLDER_NODES',
	QUERY_TASK_STATUS: 'QUERY_TASK_STATUS',
	CREATE_PACK_TASK_RESULT: 'CREATE_PACK_TASK_RESULT',
	FLUSH_FOLDER_NODES_RESULT: 'FLUSH_FOLDER_NODES_RESULT',
	QUERY_TASK_STATUS_RESULT: 'QUERY_TASK_STATUS_RESULT',
};
