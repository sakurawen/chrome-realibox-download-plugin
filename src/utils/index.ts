import { MESSAGE_TYPE } from '@/shared/message';
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

type ChromeSendMessage = {
	action: keyof typeof MESSAGE_TYPE;
	data?: any;
};

export const chromeTabSendMessage = ({ action, data }: ChromeSendMessage) => {
	chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, {
		action,
		data,
	});
};
