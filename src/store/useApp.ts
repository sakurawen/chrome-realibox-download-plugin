import DownloadTask from '@/store/entity/DownloadTask';
import { createTrackedSelector } from 'react-tracked';
import { sendMessage } from '@/shared/webextBridge';
import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type SceneUid = string;
type JobUid = string;

type FileRecordChangeCallback = (state: Pick<AppState, 'fileRecord'>) => void;

type AppState = {
	currentTab: 'explore' | 'batch' | 'download';
	fileRecord: Record<SceneUid, Realibox.File>; //当前所有文件
	searchKey: string; //文件浏览器搜索key
	exploreLoading: boolean;
	batch: {
		split: 'line' | 'default'; // line 回车区分，default 逗号区分
		parentId: string;
		batchSceneIds: string;
	};
	assessInfo: {
		//访问信息
		parent_id: string;
		folder_id: string;
		token: string;
	};
	taskSearchKey: string;
	queryTaskCallback?: () => void;
	jobUidRecord: Record<JobUid, SceneUid>; //查询工作id记录 jobs_uid->scene_uid
	downloadTaskRecord: Record<SceneUid, DownloadTask>; //下载任务记录
	sceneStatusRecord: Record<SceneUid, Realibox.TaskStatus>;
	dowbnloadTaskCount: number; //下载任务数量
};
interface AppAction {
	setCurrentTab: (tab: AppState['currentTab']) => void;
	downloadOne: (task: DownloadTask) => Promise<void>;
	downloadAll: () => void;
	freshExploreFiles: () => Promise<void>; //刷新文件夹
	queryTaskStatus: () => Promise<Realibox.QueryTaskResult[]>;
	createParkTask: (file: Realibox.File) => Promise<void>;
	updateDownloadTaskRecord: (data: Realibox.QueryTaskResult[]) => void;
	updateFileRecord: (
		record: Record<SceneUid, Realibox.File> | FileRecordChangeCallback
	) => void;
	updateSearchKey: (searchKey: string) => void;
	updateTaskSearchKey: (searchKey: string) => void;
	addJobUid: (jobUid: string, sceneUid: string) => void;
	addDownloadTask: (task: DownloadTask) => void;
	removeDownloadTask: (scene_uid: string) => void;
	updateAssessInfo: () => Promise<{
		parent_id: string;
		folder_id: string;
		token: string;
	}>;
  setDownloadTaskErr:(sceneId:string)=>void,
	setBatchSceneIds: (val: string) => void;
	setBatchParentId: (val: string) => void;
	setBatchSplit: (val: AppState['batch']['split']) => void;
	getBatchSceneIds: () => Array<string>;
}

const useApp = create<AppState & AppAction>()(
	immer(
		devtools((set, get) => {
			const state: AppState = {
				fileRecord: {},
				currentTab: 'explore',
				assessInfo: {
					parent_id: '',
					folder_id: '',
					token: '',
				},
				batch: {
					split: 'default',
					parentId: '',
					batchSceneIds: '',
				},
				exploreLoading: false,
				queryTaskCallback: undefined,
				searchKey: '',
				taskSearchKey: '',
				jobUidRecord: {},
				sceneStatusRecord: {},
				dowbnloadTaskCount: 0,
				downloadTaskRecord: {},
			};

			const setBatchSplit = (val: AppState['batch']['split']) => {
				set(
					(state) => {
						state.batch.split = val;
					},
					false,
					'app/setBatchSplit'
				);
			};

			const setBatchSceneIds = (sceneIds: string) => {
				set(
					(state) => {
						state.batch.batchSceneIds = sceneIds;
					},
					false,
					'app/setBatchSceneIds'
				);
			};

			const setBatchParentId = (parentId: string) => {
				set(
					(state) => {
						state.batch.parentId = parentId;
					},
					false,
					'app/setBatchSceneIds'
				);
			};
			const setCurrentTab = (tab: AppState['currentTab']) => {
				set(
					(state) => {
						state.currentTab = tab;
					},
					false,
					'app/setCurrentTab'
				);
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
			const updateDownloadTaskRecord = (data: Realibox.QueryTaskResult[]) => {
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

			/**
			 * 更新任务搜索key
			 * @param searchKey
			 */
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
				set(
					(state) => {
						state.exploreLoading = true;
					},
					false,
					'app/exploreLoadingStart'
				);
				try {
					await updateAssessInfo();
					const result = await sendMessage<Record<string, Realibox.File>>(
						(type) => type.BACKGROUND_FLUSH_FOLDER_NODES,
						null,
						'background'
					);
					updateFileRecord(result);
				} finally {
					// 最少loading 500ms
					setTimeout(() => {
						set(
							(state) => {
								state.exploreLoading = false;
							},
							false,
							'app/exploreLoadingEnd'
						);
					}, 500);
				}
			};

			/**
			 * 创建打包任务
			 * @param file
			 * @returns
			 */
			const createParkTask = async (file: Realibox.File) => {
				try {
					const result = await sendMessage<any>(
						(type) => type.BACKGROUND_CREATE_PACK_TASK,
						file,
						'background'
					);
					const { job_uid, scene_uid, name } = result;
					if (!job_uid) {
						return;
					}
					const task = new DownloadTask({
						status: 'QUERY_STATUS',
						jobUid: job_uid,
						title: name,
						sceneUid: scene_uid,
						order: get().dowbnloadTaskCount + 1,
					});
					addJobUid(job_uid, scene_uid);
					addDownloadTask(task);
				} catch (err) {
					setDownloadTaskErr(file.scene_uid);
				}
			};

      /**
       * 标记下载任务失败
       * @param sceneId 
       */
			const setDownloadTaskErr = (sceneId: string) => {
				set(
					(state) => {
						if (!state.sceneStatusRecord[sceneId]) return;
						state.sceneStatusRecord[sceneId] = 'ERROR';
					},
					false,
					'app/createParkTaskError'
				);
			};

			/**
			 * 查询打包任务状态,支持传入一个回调函数，在获取到结果之后调用
			 * @param job_uids
			 */
			const queryTaskStatus = async () => {
				if (Object.keys(get().jobUidRecord).length === 0) return;
				const result = await sendMessage<any>(
					(type) => type.BACKGROUND_QUERY_TASK_STATUS,
					{
						job_uids: Object.keys(get().jobUidRecord),
					},
					'background'
				);
				if (result.length === 0) return;
				console.log('query task result:', result, get().downloadTaskRecord);
				updateDownloadTaskRecord(result);
				return result;
			};

			/**
			 * 单个下载
			 * @param task
			 */
			const downloadOne = async (task: DownloadTask) => {
				console.log('download task:', task);
				try {
					await browser.downloads.download({
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

			/**
			 * 下载全部
			 */
			const downloadAll = () => {
				const tasks = Object.values(get().downloadTaskRecord).filter(
					(task) => !task.downloadStatus
				);
				tasks.forEach((task) => {
					downloadOne(task);
				});
			};

			/**
			 * 更新访问信息
			 * @returns
			 */
			const updateAssessInfo = async () => {
				const result = await sendMessage<{
					parent_id: string;
					folder_id: string;
					token: string;
				}>((type) => type.CONTENT_UPDATE_ACCESS_INFO, null, 'content-script');
				set(
					(state) => {
						state.assessInfo = result;
					},
					false,
					'app/updateAssessInfo'
				);
				return result;
			};

			const getBatchSceneIds = () => {
				const batchSceneIdsStr = get().batch.batchSceneIds.replace(/\s/g, '');
				const batchSplit = get().batch.split;
				if (batchSceneIdsStr.length === 0) return [];
				if (batchSplit === 'default') {
					return batchSceneIdsStr.split(',').filter((i) => !!i);
				}
				if (batchSplit === 'line') {
					return batchSceneIdsStr.split('\n').filter((i) => !!i);
				}
				return [];
			};
			return {
				...state,
				setCurrentTab,
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
				updateTaskSearchKey,
				updateAssessInfo,
				setBatchParentId,
				setBatchSceneIds,
				setBatchSplit,
				getBatchSceneIds,
        setDownloadTaskErr
			};
		})
	)
);

export const useOriginApp = useApp;

export default createTrackedSelector(useApp);
