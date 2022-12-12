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

const HTTP_SUCCESS_CODE = 200000;
/**
 * 获取当前文件夹下的所有文件，100个
 * @param {string} project_id
 * @param {string} folder_id
 * @returns
 */
const getFolderNodes = (
	project_id: string,
	parent_id: string,
	token: string,
	limit = '100'
) => {
	const query = new URLSearchParams({
		project_id,
		parent_id: parent_id || project_id,
		only_children: '0',
		object_type: '0',
		limit,
		sorts: JSON.stringify([{ sort: 'desc', field: 'ordering' }]),
		skip: '0',
	}).toString();
	let url = `/api/hub/v1/nodes?${query}`;
	return fetch(url, {
		method: 'GET',
		headers: {
			authorization: token,
		},
	});
};
[].reduce;
/**
 * 刷新文件列表
 * @returns
 */
const flushFolderNodes = () => {
	let [parent_id, folder_id] = getParentIdAndFolderId(location.pathname);
	const token = getToken();
	return getFolderNodes(parent_id || '', folder_id || '', token)
		.then((res) => res.json())
		.then((res) => {
			const result = res.list.data.map((i: any) => {
				let scene_uid = '';
				if (i.scenes[0]) {
					scene_uid = i.scenes[0].scene_uid;
				} else {
					return null;
				}
				const item = { ...i, scene_uid };
				return item;
			});
			return result.reduce((acc: any, cur: any) => {
				if (!cur) return acc;
				acc[cur.scene_uid] = cur;
				return acc;
			}, {});
		})
		.catch(() => {
			return [];
		});
};

let abortController = new AbortController();

/**
 * 查询下载任务状态
 * @param {string|Array<string>} job_uids
 * @returns
 */
const queryTaskStatus = async (job_uids: string | Array<string>) => {
	const reqUrl = 'https://hub.realibox.com/api/hub/v1/jobs';
	// 取消上一次请求
	abortController.abort('cancel prev request');
	abortController = new AbortController();
	const body = JSON.stringify({
		job_uids: Array.isArray(job_uids) ? job_uids : [job_uids],
	});
	const token = getToken();
	const data = await fetch(reqUrl, {
		method: 'POST',
		body,
		signal: abortController.signal,
		headers: {
			'Content-Type': 'application/json',
			authorization: token,
		},
	});
	const result = await data.json();
	return result;
};

/**
 * 创建打包任务
 * @param {string} parent_id 项目id
 * @param {string} scene_uid 场景id
 */
const createPackTask = async (parent_id: string, scene_uid: string) => {
	const reqUrl = `https://hub.realibox.com/api/hub/v1/studio/scene/pack/${scene_uid}?project_id=${parent_id}`;
	const token = getToken();
	try {
		const data = await fetch(reqUrl, {
			method: 'GET',
			headers: {
				authorization: token,
			},
		});
		const result = await data.json();
		if (result.code !== HTTP_SUCCESS_CODE) {
			throw new Error('error');
		}
		return {
			job_uid: result.info.job_uid,
			scene_uid,
		};
	} catch {
		return {
			job_uid: '',
			scene_uid,
		};
	}
};

const MESSAGE_TYPE = {
	CREATE_PACK_TASK: 'CREATE_PACK_TASK',
	FLUSH_FOLDER_NODES: 'FLUSH_FOLDER_NODES',
	QUERY_TASK_STATUS: 'QUERY_TASK_STATUS',
	CREATE_PACK_TASK_RESULT: 'CREATE_PACK_TASK_RESULT',
	FLUSH_FOLDER_NODES_RESULT: 'FLUSH_FOLDER_NODES_RESULT',
	QUERY_TASK_STATUS_RESULT: 'QUERY_TASK_STATUS_RESULT',
};

chrome.runtime.onMessage.addListener(({ type, data }, _, senResponse) => {
	console.log('message type:', type);
	switch (true) {
		case type === MESSAGE_TYPE.CREATE_PACK_TASK: {
			// 创建打包任务
			const { scene_uid, name } = data;
			const [parent_id] = getParentIdAndFolderId(location.pathname);
			createPackTask(parent_id || '', scene_uid).then((res) => {
				console.log('create pack task data:', data, 'res:', res);

				chrome.runtime.sendMessage({
					type: MESSAGE_TYPE.CREATE_PACK_TASK_RESULT,
					data: {
						...res,
						name,
					},
				});
			});
			break;
		}
		case type === MESSAGE_TYPE.FLUSH_FOLDER_NODES: {
			//  刷新文件节点列表
			flushFolderNodes().then((res) => {
				chrome.runtime.sendMessage({
					type: MESSAGE_TYPE.FLUSH_FOLDER_NODES_RESULT,
					data: res,
				});
			});
			break;
		}
		case type === MESSAGE_TYPE.QUERY_TASK_STATUS: {
			const { job_uids } = data;
			queryTaskStatus(job_uids)
				.then((res) => {
					console.log('query tasks status result:', res);
					senResponse({
						type: MESSAGE_TYPE.QUERY_TASK_STATUS_RESULT,
						data: res.list.data,
					});
					chrome.runtime.sendMessage({
						type: MESSAGE_TYPE.QUERY_TASK_STATUS_RESULT,
						data: res.list.data,
					});
				})
				.catch(() => {
					chrome.runtime.sendMessage({
						type: MESSAGE_TYPE.QUERY_TASK_STATUS_RESULT,
						data: [],
					});
				});
			break;
		}
	}
});

export {};
