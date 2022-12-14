import { useApp } from '@/store';
import DownloadTask from '@/store/entity/DownloadTask';
import cx from 'classnames';
import { useDeferredValue, useEffect, useMemo } from 'react';

const getStatusText = (status: Realibox.TaskStatus) => {
	switch (true) {
		case status === 'ERROR':
			return '发生错误';
		case status === 'GET_DOWNLOAD':
			return '打包成功';
		case status === 'QUERY_STATUS':
			return '打包中';
	}
};

/**
 * 下载页面
 * @returns
 */
const Download = () => {
	const {
		downloadTaskRecord,
		removeDownloadTask,
		queryTaskStatus,
		downloadOne,
		taskSearchKey,
	} = useApp();

	const deferredTaskSearchKey = useDeferredValue(taskSearchKey);

	const taskList = useMemo(() => {
		const list = Object.values(downloadTaskRecord);
		if (deferredTaskSearchKey.trim().length === 0) return list;
		return list.filter(
			(item) =>
				item.title
					.toUpperCase()
					.includes(deferredTaskSearchKey.toUpperCase()) ||
				item.sceneUid.includes(deferredTaskSearchKey)
		);
	}, [downloadTaskRecord, deferredTaskSearchKey]);

	/**
	 * 监听查询任务状态
	 */
	useEffect(() => {
		let queryTimer: NodeJS.Timeout;
		const cycleQuery = () => {
			queryTaskStatus().then((res) => {
				if (res.some && res.some((task) => task.status === '110')) {
					queryTimer = setTimeout(() => {
						cycleQuery();
					}, 10000);
				}
			});
		};
		cycleQuery();
		return () => {
			clearTimeout(queryTimer);
		};
	}, [queryTaskStatus]);

	return (
		<div className='h-screen pb-8 pt-8'>
			<ul className='flex flex-wrap'>
				{taskList.map((task) => {
					return (
						<TaskListItem
							task={task}
							download={downloadOne}
							remove={removeDownloadTask}
						/>
					);
				})}
			</ul>
		</div>
	);
};

type TaskListItemProps = {
	task: DownloadTask;
	remove: (scene_uid: string) => void;
	download: (task: DownloadTask) => Promise<void>;
};

const TaskListItem = ({ task, download, remove }: TaskListItemProps) => {
	return (
		<li
			role='listitem'
			className='w-1/2 p-2'
			key={task.jobUid}>
			<div
				className='shadow-sm p-2 flex justify-between items-end hover:ring-indigo-50 ring-2 rounded ring-white/0 border-b-px border-gray-50'
				tabIndex={0}>
				<div>
					<div>
						<h2 className='text-base '>{task.title}</h2>
						<p className='text-sm text-black/80  mt-1'>
							场景ID:{task.sceneUid}
						</p>
					</div>
					<div className='mt-2  select-none'>
						<i
							className={cx(
								'inline-block not-italic text-xs mr-2 bg-indigo-100 w-[5em] text-center p-1 rounded-md shadow-indigo-300/20',
								{
									'bg-red-100': task.status === 'ERROR',
									'bg-green-100': task.status === 'GET_DOWNLOAD',
									'bg-blue-100': task.status === 'QUERY_STATUS',
								}
							)}>
							{getStatusText(task.status)}
						</i>
					</div>
				</div>
				{task.status === 'ERROR' ? (
					<button
						tabIndex={0}
						onClick={() => remove(task.sceneUid)}
						className='p-1 cursor-pointer hover:bg-indigo-200 hover:text-black rounded-md'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='w-5 h-5'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
							/>
						</svg>
					</button>
				) : (
					task.downloadUrl && (
						<button
							tabIndex={0}
							onClick={() => download(task)}
							className={cx(
								'p-1 cursor-pointer hover:bg-indigo-200 hover:text-black rounded-md',
								{
									'bg-red-50': task.downloadStatus === 'fail',
									'bg-green-50': task.downloadStatus === 'success',
								}
							)}>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={1.5}
								stroke='currentColor'
								className='w-5 h-5 '>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z'
								/>
							</svg>
						</button>
					)
				)}
			</div>
		</li>
	);
};

export default Download;
