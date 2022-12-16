import { useApp } from '@/store';
import { RadioGroup } from '@headlessui/react';
import { toast } from '@/utils';
import { sendMessage } from '@/shared/webextBridge';
import DownloadTask from '@/store/entity/DownloadTask';
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
		} catch (err) {
			throw err;
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
		dowbnloadTaskCount,
		setDownloadTaskErr,
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
		const createFunMap: Record<string, ReturnType<typeof createTask>> = {};
		sceneIds.forEach((sceneId) => {
			createFunMap[sceneId] = createTask(parentId, sceneId);
		});
		Object.keys(createFunMap).forEach((sceneId) => {
			const createFn = createFunMap[sceneId];
			createFn()
				.then((result) => {
					const { job_uid, scene_uid, name } = result;
					if (!job_uid) {
						return;
					}
					const task = new DownloadTask({
						status: 'QUERY_STATUS',
						jobUid: job_uid,
						title: name,
						sceneUid: scene_uid,
						order: dowbnloadTaskCount + 1,
					});
					addJobUid(job_uid, scene_uid);
					addDownloadTask(task);
				})
				.catch((err) => {
					setDownloadTaskErr(sceneId);
					console.error('batch create task error:', err);
					toast.fail(`创建打包任务失败,场景ID${sceneId}`);
				});
		});
	};

	/**
	 * 更新场景id划分符号
	 * @param value
	 */
	const handleBatchSplitSymbolChange = (value: 'default' | 'line') => {
		setBatchSplit(value);
	};

	return (
		<div className='px-2 pt-10 h-screen'>
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
                text-center inline-block p-1 rounded w-24 ${
									checked ? 'bg-indigo-100' : 'bg-gray-100'
								}
              `}
							value='default'>
							按逗号
						</RadioGroup.Option>
						<RadioGroup.Option
							as='button'
							className={({ checked }) => `
              text-center inline-block p-1 rounded w-24 ${
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
						rows={10}></textarea>
				</div>
				<div>
					<button
						onClick={handleAddTaskBatch}
						className='p-2 inline-flex items-center justify-center bg-indigo-100 text-black rounded hover:bg-indigo-200'>
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
				</div>
			</div>
		</div>
	);
};
export default Batch;
