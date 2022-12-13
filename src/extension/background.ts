import { onMessage } from 'webext-bridge';

onMessage('getToken', ({ data }) => {
	console.log('getToken background:', data);
});
let token = '';
const getToken = () => token;

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
const flushFolderNodes = (parent_id:string, folder_id:string) => {
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
