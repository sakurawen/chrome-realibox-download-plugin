import '@/App.css';
import Download from '@/pages/Download';
import Explore from '@/pages/Explore';
import { useApp } from '@/store';
import * as Tabs from '@radix-ui/react-tabs';
import cx from 'classnames';
import { useEffect, useMemo } from 'react';
import { MESSAGE_TYPE } from '@/utils';
import DownloadTask from '@/store/entity/DownloadTask';

const App = () => {
	const {
		dowbnloadTaskCount,
		fileRecord,
		updateFileRecord,
		addJobUid,
		addDownloadTask,
		searchKey,
		updateSearchKey,
		freshExploreFiles,
	} = useApp();
	const fileList = useMemo(() => Object.values(fileRecord), [fileRecord]);

	useEffect(() => {
		if (!chrome.runtime) return;
		const listenMessageResult = ({
			type,
			data,
		}: {
			type: string;
			data: any;
		}) => {
			console.log(`type:${type},data:`, data);
			switch (true) {
				// 刷新文件列表
				case type === MESSAGE_TYPE.FLUSH_FOLDER_NODES_RESULT: {
					updateFileRecord(data);
					return;
				}
				// 查询打包任务状态
				case type === MESSAGE_TYPE.QUERY_TASK_STATUS_RESULT: {
					return;
				}
				// 创建打包任务
				case type === MESSAGE_TYPE.CREATE_PACK_TASK_RESULT: {
					const { job_uid, scene_uid, name } = data;
					if (!job_uid) {
						updateFileRecord((state) => {
							state.fileRecord[scene_uid].task_status = 'ERROR';
						});
						return;
					}
					updateFileRecord((state) => {
						state.fileRecord[scene_uid].task_status = 'QUERY_STATUS';
					});
					const task = new DownloadTask({
						status: 'QUERY_STATUS',
						jobUid: job_uid,
						title: name,
						sceneUid: scene_uid,
						order: dowbnloadTaskCount + 1,
					});
					addJobUid(job_uid);
					addDownloadTask(task);
					return;
				}
			}
		};
		chrome.runtime.onMessage.addListener(listenMessageResult);
		return () => {
			chrome.runtime.onMessage.removeListener(listenMessageResult);
		};
	}, [fileList]);

	return (
		<div className='App w-full'>
			<Tabs.Root defaultValue='explore'>
				<div className='fixed box-border border-b border-indigo-50 pr-2 top-0 left-0  w-full h-8 bg-white  z-10 flex items-center'>
					<Tabs.List className='flex'>
						<Tabs.TabsTrigger
							className='flex pt-1  align-middle items-center  px-2 text-sm data-[state=active]:text-black data-[state=active]:bg-indigo-50 data-[state=active]:border-indigo-200 border-white/0 border-b-2  pb-1  '
							value='explore'>
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
									d='M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z'
								/>
							</svg>
							<span>Explore</span>
						</Tabs.TabsTrigger>
						<Tabs.TabsTrigger
							className='flex pt-1 align-middle items-center pl-2 pr-3 text-sm data-[state=active]:text-black data-[state=active]:bg-indigo-50 data-[state=active]:border-indigo-200 border-white/0 border-b-2  pb-1  '
							value='download'>
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
									d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3'
								/>
							</svg>
							<span>Download</span>
							<i
								className={cx(
									'hidden w-5 h-5 ml-1 rounded-full not-italic scale-75 bg-indigo-500 text-white text-xs justify-center items-center',
									{
										'!inline-flex': dowbnloadTaskCount !== 0,
									}
								)}>
								{dowbnloadTaskCount}
							</i>
						</Tabs.TabsTrigger>
					</Tabs.List>
					<div className='flex-1 h-full flex justify-center items-center mx-4'>
						<input
							onChange={(e) => updateSearchKey(e.target.value)}
							value={searchKey}
							placeholder='Search files'
							className='block w-full text-xs border-none   text-black outline-none'
							type='text'
						/>
					</div>
					<button
						className='text-xs py-1 px-2 rounded  hover:ring-2 ring-indigo-200  bg-indigo-100 group text-black text-center  inline-flex justify-center items-center'
						onClick={freshExploreFiles}>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='sm:block hidden w-4 h-4 mr-2 group-hover:animate-spin '>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
							/>
						</svg>
						<span>Refresh</span>
					</button>
				</div>
				<Tabs.Content value='explore'>
					<Explore />
				</Tabs.Content>
				<Tabs.Content value='download'>
					<Download />
				</Tabs.Content>
			</Tabs.Root>
		</div>
	);
};

export default App;
