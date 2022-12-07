const getCookie = (name) => {
	let arr;
	const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
	if ((arr = document.cookie.match(reg))) {
		return unescape(arr[2]);
	} else {
		return '';
	}
};

const token = getCookie('hub_auth_token');

chrome.runtime.onMessage.addListener(({ type, data }) => {
	if (type === 'getInitData') {
		chrome.runtime.sendMessage({
			type: 'setInitData',
			data: {
				token,
			},
		});
	}
});

const urlReg = /hub.realibox.com\/project\/([^\/]+)\/?([^\/]+)?/;

const url = location.href;
const match = url.match(urlReg);
console.log(match);

const [, project_id, folder_id] = match;

console.log({
	project_id,
	folder_id,
});
