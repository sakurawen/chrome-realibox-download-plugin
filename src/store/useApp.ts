import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createTrackedSelector } from 'react-tracked';
import { chromeTabSendMessage } from '@/utils';
import { MESSAGE_TYPE } from '@/shared/message';
import DownloadTask from '@/store/entity/DownloadTask';

type SceneUid = string;
type JobUid = string;

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
type AppState = {
	fileRecord: Record<SceneUid, Realibox.File>; //当前所有文件
	searchKey: string; //文件浏览器搜索key
	taskSearchKey: string;
	queryTaskCallback?: () => void;
	jobUidRecord: Record<JobUid, SceneUid>; //查询工作id记录 jobs_uid->scene_uid
	downloadTaskRecord: Record<SceneUid, DownloadTask>; //下载任务记录
	sceneStatusRecord: Record<SceneUid, Realibox.TaskStatus>;
	dowbnloadTaskCount: number; //下载任务数量
};
interface AppAction {
	downloadOne: (task: DownloadTask) => Promise<void>;
	downloadAll: () => void;
	freshExploreFiles: () => Promise<void>; //刷新文件夹
	queryTaskStatus: (cb?: () => void) => Promise<void>;
	createParkTask: (file: Realibox.File) => Promise<void>;
	updateDownloadTaskRecord: (data: DownloadTaskQueryResponse) => void;
	updateFileRecord: (
		record: Record<SceneUid, Realibox.File> | FileRecordChangeCallback
	) => void;
	updateSearchKey: (searchKey: string) => void;
	updateTaskSearchKey: (searchKey: string) => void;
	addJobUid: (jobUid: string, sceneUid: string) => void;
	addDownloadTask: (task: DownloadTask) => void;
	removeDownloadTask: (scene_uid: string) => void;
	runQueryTaskStatusCallback: () => void;
}

const useApp = create<AppState & AppAction>()(
	immer(
		devtools((set, get) => {
			const state: AppState = {
				fileRecord: {},
				queryTaskCallback: undefined,
				searchKey: '',
				taskSearchKey: '',
				jobUidRecord: {},
				sceneStatusRecord: {},
				dowbnloadTaskCount: 0,
				downloadTaskRecord: {},
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
							const jobsId = state.downloadTaskRecord[scene_uid].jobUid;
							delete state.jobUidRecord[jobsId];
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
			const addJobUid = (jobUid: string, sceneUid: string) => {
				if (get().jobUidRecord[jobUid]) return;
				set(
					(state) => {
						state.sceneStatusRecord[sceneUid] = 'QUERY_STATUS';
						state.jobUidRecord[jobUid] = sceneUid;
					},
					false,
					'app/addJobUid'
				);
			};

			/**
			 * 更新下载任务状态记录
			 * @param data
			 */
			const updateDownloadTaskRecord = (data: DownloadTaskQueryResponse) => {
				runQueryTaskStatusCallback();
				set(
					(state) => {
						data.forEach((taskResponse) => {
							const sceneUid = get().jobUidRecord[taskResponse.job_uid];
							console.log(sceneUid);
							if (
								taskResponse.status === '200' &&
								state.downloadTaskRecord[sceneUid]
							) {
								if (state.sceneStatusRecord[sceneUid]) {
									state.sceneStatusRecord[sceneUid] = 'GET_DOWNLOAD';
								}
								state.downloadTaskRecord[sceneUid].status = 'GET_DOWNLOAD';
								state.downloadTaskRecord[sceneUid].downloadUrl =
									taskResponse.data.file_url || '';
							}
						});
					},
					false,
					'app/updateDownloadTaskRecord'
				);
			};

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
						Object.keys(record).forEach((sceneUid) => {
							if (!state.sceneStatusRecord[sceneUid]) {
								state.sceneStatusRecord[sceneUid] = undefined;
							}
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

			const updateTaskSearchKey = (searchKey: string) => {
				set(
					(state) => {
						state.taskSearchKey = searchKey;
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
				chromeTabSendMessage({
					type: MESSAGE_TYPE.FLUSH_FOLDER_NODES,
				});
			};
			/**
			 * 创建打包任务
			 * @param file
			 * @returns
			 */
			const createParkTask = async (file: Realibox.File) => {
				chromeTabSendMessage({
					type: MESSAGE_TYPE.CREATE_PACK_TASK,
					data: {
						...file,
					},
				});
			};

			const runQueryTaskStatusCallback = () => {
				const queryTaskCallback = get().queryTaskCallback;
				if (!queryTaskCallback) return;
				queryTaskCallback();
				console.log('run callback');
				set(
					(state) => {
						state.queryTaskCallback = undefined;
					},
					false,
					'app/runQueryTaskStatusCallback'
				);
			};
			/**
			 * 查询打包任务状态,支持传入一个回调函数，在获取到结果之后调用
			 * @param job_uids
			 */
			const queryTaskStatus = async (
				callback: AppState['queryTaskCallback']
			) => {
				if (Object.keys(get().jobUidRecord).length === 0) return;
				if (callback) {
					set(
						(state) => {
							console.log('add callback!', callback);
							state.queryTaskCallback = callback;
						},
						false,
						'app/setQueryTaskStatusCallback'
					);
				}
				chromeTabSendMessage({
					type: MESSAGE_TYPE.QUERY_TASK_STATUS,
					data: {
						job_uids: Object.keys(get().jobUidRecord),
					},
				});
			};
			const downloadOne = async (task: DownloadTask) => {
				console.log('download task:', task);
				try {
					await chrome.downloads.download({
						url: `https:${task.downloadUrl}`,
					});
					set(
						(state) => {
							state.downloadTaskRecord[task.sceneUid].downloadStatus =
								'success';
						},
						false,
						'app/downloadFileSuccess'
					);
				} catch (err) {
					set(
						(state) => {
							state.downloadTaskRecord[task.sceneUid].downloadStatus = 'fail';
						},
						false,
						'app/downloadFileFail'
					);
				}
			};

			const downloadAll = () => {
				const tasks = Object.values(get().downloadTaskRecord).filter(
					(task) => !task.downloadStatus
				);
				tasks.forEach((task) => {
					downloadOne(task);
				});
			};

			return {
				...state,
				downloadOne,
				downloadAll,
				freshExploreFiles,
				createParkTask,
				queryTaskStatus,
				updateFileRecord,
				updateSearchKey,
				addJobUid,
				addDownloadTask,
				removeDownloadTask,
				updateDownloadTaskRecord,
				runQueryTaskStatusCallback,
				updateTaskSearchKey,
			};
		})
	)
);

export const useOriginApp = useApp;

export default createTrackedSelector(useApp);
