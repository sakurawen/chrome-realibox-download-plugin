import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createTrackedSelector } from 'react-tracked';
import { MESSAGE_TYPE, getCurrentTab } from '@/utils';
import { files } from '@/mock';
import DownloadTask from '@/store/entity/DownloadTask';

type SceneUid = string;
type AppState = {
	fileRecord: Record<SceneUid, Realibox.File>; //当前所有文件
	searchKey: string; //文件浏览器搜索key
	jobUids: string[]; //查询工作id
	downloadTaskRecord: Record<SceneUid, DownloadTask>; //下载任务记录
	dowbnloadTaskCount: number; //下载任务数量
};
type FileRecordChangeCallback = (state: Pick<AppState, 'fileRecord'>) => void;
type DownloadTaskQueryResponse = Array<{
	data: {
		file_url?: string;
	};
	job_uid: string;
	message: string;
	name: string | null;
	status: '110' | '200';
}>;
interface AppAction {
	freshExploreFiles: () => Promise<void>; //刷新文件夹
	queryTaskStatus: () => Promise<void>;
	createParkTask: (file: Realibox.File) => Promise<void>;
	updateDownloadTaskRecord: (data: DownloadTaskQueryResponse) => void;
	updateFileRecord: (
		record: Record<SceneUid, Realibox.File> | FileRecordChangeCallback
	) => void;
	updateSearchKey: (searchKey: string) => void;
	addJobUid: (jobUid: string) => void;
	addDownloadTask(task: DownloadTask): void;
	removeDownloadTask(scene_uid: string): void;
}

const mockFileRecord = files.reduce((acc, cur) => {
	acc[cur.scene_uid] = cur;
	return acc;
}, {} as Record<SceneUid, Realibox.File>);

const useApp = create<AppState & AppAction>()(
	immer(
		devtools((set, get) => {
			const state: AppState = {
				fileRecord: {},
				searchKey: '',
				jobUids: [],
				dowbnloadTaskCount: 0,
				downloadTaskRecord: {
					// '23655491713592156243': new DownloadTask({
					// 	title: '3_2ZY_动态加载_内饰',
					// 	order: 3,
					// 	jobUid: '12312gfd312',
					// 	sceneUid: '23655491713592156243',
					// 	status: 'GET_DOWNLOAD',
					// }),
					// '23655497123592156243': new DownloadTask({
					// 	title: '1_2ZY_动态加载_外观',
					// 	jobUid: '1231fg2312',
					// 	order: 1,
					// 	sceneUid: '23655497123592156243',
					// 	status: 'QUERY_STATUS',
					// }),
					// '23655497135921356243': new DownloadTask({
					// 	title: '2_2ZY（020913）新 1D1',
					// 	jobUid: '123asd12312',
					// 	order: 2,
					// 	sceneUid: '23655497135921356243',
					// 	status: 'ERROR',
					// }),
				},
			};

			/**
			 * 添加下载任务
			 * 同一个场景id的任务只能添加一次
			 * @param task
			 * @returns
			 */
			const addDownloadTask = (task: DownloadTask) => {
				if (get().downloadTaskRecord[task.sceneUid]) return;
				set(
					(state) => {
						state.downloadTaskRecord[task.sceneUid] = task;
						state.dowbnloadTaskCount += 1;
					},
					false,
					'app/addDownloadTask'
				);
			};

			/**
			 * 删除下载任务，根据场景id删除
			 */
			const removeDownloadTask = (scene_uid: string) => {
				set(
					(state) => {
						if (state.downloadTaskRecord[scene_uid]) {
							delete state.downloadTaskRecord[scene_uid];
							state.dowbnloadTaskCount -= 1;
						}
					},
					false,
					'app/removeDownloadTask'
				);
			};

			/**
			 * 添加job_uid
			 * @param jobUid
			 * @returns
			 */
			const addJobUid = (jobUid: string) => {
				if (get().jobUids.includes(jobUid)) return;
				set(
					(state) => {
						state.jobUids.push(jobUid);
					},
					false,
					'app/addJobUid'
				);
			};

			const updateDownloadTaskRecord = (data: DownloadTaskQueryResponse) => {};

			/**
			 * 更新文件
			 * @param record
			 * @returns
			 */
			const updateFileRecord = (
				record: Record<SceneUid, Realibox.File> | FileRecordChangeCallback
			) => {
				if (typeof record === 'function') {
					set(record, false, 'app/updateFileRecord');
					return;
				}
				set(
					(state) => {
						Object.keys(record).forEach((key) => {
							record[key].task_status = 'GET_SCENE_UID';
						});
						state.fileRecord = record;
					},
					false,
					'app/updateFileRecord'
				);
			};

			/**
			 * 更新输入框文字
			 * @param searchKey©
			 */
			const updateSearchKey = (searchKey: string) => {
				set(
					(state) => {
						state.searchKey = searchKey;
					},
					false,
					'app/updateSearchKey'
				);
			};

			/**
			 * 刷新文件夹
			 * @returns
			 */
			const freshExploreFiles = async () => {
				const tab = await getCurrentTab();
				if (!tab?.id) return;
				chrome.tabs.sendMessage(tab.id, {
					type: MESSAGE_TYPE.FLUSH_FOLDER_NODES,
				});
			};
			/**
			 * 创建打包任务
			 * @param file
			 * @returns
			 */
			const createParkTask = async (file: Realibox.File) => {
				const tab = await getCurrentTab();
				if (!tab?.id) return;
				chrome.tabs.sendMessage(tab.id, {
					type: MESSAGE_TYPE.CREATE_PACK_TASK,
					data: {
						...file,
					},
				});
			};

			/**
			 * 查询打包任务状态
			 * @param job_uids
			 */
			const queryTaskStatus = async () => {
				const tab = await getCurrentTab();
				if (!tab?.id) return;
				chrome.tabs.sendMessage(tab.id, {
					type: MESSAGE_TYPE.QUERY_TASK_STATUS,
					data: {
						job_uids: get().jobUids,
					},
				});
			};

			return {
				...state,
				freshExploreFiles,
				createParkTask,
				queryTaskStatus,
				updateFileRecord,
				updateSearchKey,
				addJobUid,
				addDownloadTask,
				removeDownloadTask,
				updateDownloadTaskRecord,
			};
		})
	)
);

export default createTrackedSelector(useApp);
