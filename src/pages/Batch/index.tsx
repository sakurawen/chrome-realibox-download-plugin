import { sendMessage } from '@/shared/webextBridge';
import { useApp } from '@/store';
import DownloadTask from '@/store/entity/DownloadTask';
import { toast } from '@/utils';
import { RadioGroup } from '@headlessui/react';
import cx from 'classnames';

const createTask = (parent_id: string, scene_uid: string) => {
	return async () => {
		try {
			const result = await sendMessage<{
				job_uid: string;
				scene_uid: string;
				name: string;
			}>(
				(type) => type.BACKGROUND_CREATE_PACK_TASK,
				{
					parent_id,
					scene_uid,
				},
				'background'
			);
			return result;
		} catch {
			// 报错的时候抛出场景id
			throw new Error(scene_uid);
		}
	};
};

/**
 * 按照scene_id 批次下载
 * @returns
 */
const Batch = () => {
	const {
		batch,
		setBatchParentId,
		setBatchSceneIds,
		setBatchSplit,
		getBatchSceneIds,
		addDownloadTask,
		addJobUid,
		downloadTaskCount,
		setBatchLoading,
		setDownloadTaskErr,
		downloadTaskRecord,
		resetBatch,
	} = useApp();

	const handleAddTaskBatch = () => {
		const sceneIds = getBatchSceneIds();
		const parentId = batch.parentId;
		if (sceneIds.length === 0 || parentId.replace(/\s/g, '').length === 0)
			return;
		console.log('batch:', {
			parentId,
			sceneIds,
		});
		const createFuncMap: Record<string, ReturnType<typeof createTask>> = {};
		sceneIds.forEach((sceneId) => {
			if (downloadTaskRecord[sceneId]) {
				toast.fail(`sid:${sceneId}已有打包任务`);
				return;
			}
			createFuncMap[sceneId] = createTask(parentId, sceneId);
		});
		setBatchLoading(true);
		Promise.allSettled(Object.values(createFuncMap).map((func) => func()))
			.then((results) => {
				const failTaskScenes: string[] = [];
				results.forEach((result) => {
					// fail
					if (result.status === 'rejected') {
						const failSceneId = result.reason.message;
						failTaskScenes.push(failSceneId);
						setDownloadTaskErr(failSceneId);
						return;
					}
					// success
					const { job_uid, scene_uid, name } = result.value;
					if (!job_uid) {
						return;
					}
					const task = new DownloadTask({
						status: 'QUERY_STATUS',
						jobUid: job_uid,
						title: name,
						sceneUid: scene_uid,
						order: downloadTaskCount + 1,
					});
					addJobUid(job_uid, scene_uid);
					addDownloadTask(task);
				});
				if (failTaskScenes.length === 0) {
					toast.success('打包任务批次，添加成功');
				} else {
					failTaskScenes.forEach((sceneId) => {
						toast.error(`创建打包任务失败,sid:${sceneId}`);
					});
					toast.success(
						`创建打包任务成功场景数量：${
							results.length - failTaskScenes.length
						}`
					);
				}
			})
			.finally(() => {
				setBatchLoading(false);
			});
	};

	/**
	 * 更新场景id划分符号
	 * @param value
	 */
	const handleBatchSplitSymbolChange = (value: 'default' | 'line') => {
		console.log('sp change:', value);
		setBatchSplit(value);
	};

	return (
		<div className='px-2 pt-10 h-screen '>
			<div
				className={cx(
					'h-full w-full z-50 fixed text-indigo-600 top-0 left-0 bg-indigo-50/50 backdrop-blur flex justify-center items-center',
					[batch.loading ? 'flex' : 'hidden']
				)}>
				添加任务批次中...
			</div>
			<div className=' space-y-4'>
				<div>
					<p>场景ID划分</p>
					<RadioGroup
						defaultValue='default'
						onChange={handleBatchSplitSymbolChange}
						className='pt-2 text-xs space-x-2 '>
						<RadioGroup.Option
							as='button'
							className={({ checked }) => `
                text-center focus:ring-2 inline-block p-1 rounded w-24 ${
									checked ? 'bg-indigo-100' : 'bg-gray-100'
								}
              `}
							value='default'>
							按逗号
						</RadioGroup.Option>
						<RadioGroup.Option
							as='button'
							className={({ checked }) => `
              text-center focus:ring-2 inline-block p-1 rounded w-24 ${
								checked ? 'bg-indigo-100' : 'bg-gray-100'
							}
            `}
							value='line'>
							按行
						</RadioGroup.Option>
					</RadioGroup>
				</div>
				<div>
					<label
						className='inline-block mb-2'
						htmlFor='ParentId'>
						Parent ID:
					</label>
					<input
						placeholder='输入 parent_id'
						className='block w-full p-2 outline-none border-none rounded ring-1  ring-indigo-100 focus:ring-indigo-200 focus:ring-2'
						type='text'
						value={batch.parentId}
						onChange={(e) => setBatchParentId(e.target.value)}
						id='ParentId'
					/>
				</div>
				<div>
					<label
						htmlFor='BatchInput '
						className='inline-block mb-2'>
						场景ID:
					</label>
					<textarea
						value={batch.batchSceneIds}
						onChange={(e) => setBatchSceneIds(e.target.value)}
						className='w-full p-2 outline-none border-none rounded ring-1  ring-indigo-100 focus:ring-indigo-200 focus:ring-2'
						name='scene_ids'
						id='BatchInput'
						placeholder='输入多个 scene_id'
						rows={10}></textarea>
				</div>
				<div className='space-x-2 flex'>
					<button
						onClick={handleAddTaskBatch}
						tabIndex={0}
						className='p-2 inline-flex focus:ring-2 items-center justify-center bg-indigo-100 text-black rounded hover:bg-indigo-200'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='w-4 h-4 mr-1'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75'
							/>
						</svg>
						<span>批量添加打包任务</span>
					</button>
					<button
						tabIndex={0}
						className='p-2 inline-flex focus:ring-2  items-center justify-center bg-indigo-100 text-black rounded hover:bg-indigo-200'
						onClick={resetBatch}>
						Reset
					</button>
				</div>
			</div>
		</div>
	);
};
export default Batch;
