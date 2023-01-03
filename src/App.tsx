import '@/App.css';
import useMount from '@/hooks/useMount';
import Batch from '@/pages/Batch';
import Download from '@/pages/Download';
import Explore from '@/pages/Explore';
import { sendMessage } from '@/shared/webextBridge';
import { useApp } from '@/store';
import { Tab } from '@headlessui/react';
import cx from 'classnames';
import { useMemo } from 'react';
import { Toaster } from 'react-hot-toast';

const tabIdxMap = {
	0: 'explore',
	1: 'batch',
	2: 'download',
} as const;

const App = () => {
	const {
		downloadTaskCount,
		searchKey,
		taskSearchKey,
		downloadTaskRecord,
		assessInfo,
		currentTab,
		freshExploreFiles,
		updateSearchKey,
		updateTaskSearchKey,
		resetApp,
		setCurrentTab,
	} = useApp();

	useMount(() => {
		freshExploreFiles();
	});

	const isExploreTab = currentTab === 'explore';
	const enableInput = currentTab === 'explore' || currentTab === 'download';

	const handleUpdateSearchKey = (value: string) => {
		if (isExploreTab) {
			updateSearchKey(value);
			return;
		}
		updateTaskSearchKey(value);
	};

	const handleFreshFolder = async () => {
		const newAssessInfo = await sendMessage<{ folder_id: string }>(
			(type) => type.CONTENT_UPDATE_ACCESS_INFO,
			null,
			'content-script'
		);
		// 没切换文件夹则不请求
		if (assessInfo.folder_id === newAssessInfo.folder_id) {
			return;
		}
		freshExploreFiles();
	};

	const handleTabChange = (idx: number) => {
		const tabValue = tabIdxMap[idx as keyof typeof tabIdxMap];
		setCurrentTab(tabValue);
		if (tabValue !== 'explore') return;
		handleFreshFolder();
	};

	return (
		<div className='App w-full'>
			<Toaster position='top-right' />
			<Tab.Group
				defaultIndex={0}
				onChange={handleTabChange}>
				<Tab.List className='fixed   z-20 box-border border-b border-indigo-50 pr-2 top-0 left-0  w-full h-8 bg-white  flex items-center'>
					<div className='flex w-full'>
						<Tab
							className={({ selected }) =>
								`focus:outline-1 focus:outline-indigo-300   flex pt-1  align-middle  items-center px-2 text-sm whitespace-nowrap ${
									selected ? 'text-black  bg-indigo-50 border-indigo-500 ' : ''
								} border-white/0 border-b-2  pb-1 `
							}>
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
						</Tab>
						<Tab
							className={({ selected }) =>
								`focus:outline-1 focus:outline-indigo-300   flex pt-1  align-middle items-center px-2 text-sm whitespace-nowrap ${
									selected ? 'text-black  bg-indigo-50 border-indigo-500 ' : ''
								} border-white/0 border-b-2  pb-1 `
							}>
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
									d='M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5'
								/>
							</svg>
							<span>Batch</span>
						</Tab>
						<Tab
							className={({ selected }) =>
								`focus:outline-1 focus:outline-indigo-300   flex pt-1  align-middle items-center px-2 text-sm whitespace-nowrap ${
									selected ? 'text-black  bg-indigo-50 border-indigo-500 ' : ''
								} border-white/0 border-b-2  pb-1 `
							}>
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
										'!inline-flex': downloadTaskCount !== 0,
									}
								)}>
								{downloadTaskCount}
							</i>
						</Tab>
						<div
							className={cx('flex-1 flex items-center justify-end', {
								hidden: !enableInput,
							})}>
							<div className='hidden  flex-1 h-full sm:flex justify-center items-center mx-4'>
								<input
									onChange={(e) => handleUpdateSearchKey(e.target.value)}
									value={isExploreTab ? searchKey : taskSearchKey}
									placeholder={
										isExploreTab
											? '搜索文件(输入文件名或者场景ID)'
											: '搜索下载任务(输入文件名或者场景ID)'
									}
									className='block w-full text-xs border-none   text-black outline-none'
									type='text'
								/>
							</div>
							<button
								className={cx(
									'whitespace-nowrap focus:ring-2 text-xs select-none py-1 px-2 rounded  hover:bg-indigo-200  bg-indigo-100 group text-black text-center  hidden justify-center items-center',
									{
										'!inline-flex': isExploreTab,
									}
								)}
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
							<button
								onClick={resetApp}
								className={cx(
									'whitespace-nowrap focus:ring-2 ml-2 text-xs select-none py-1 px-2 rounded  hidden hover:bg-indigo-200  bg-indigo-100 disabled:cursor-not-allowed disabled:!bg-gray-100 group text-black text-center  justify-center items-center',
									{
										'!inline-flex': !isExploreTab,
									}
								)}>
								<span>重置下载列表</span>
							</button>
						</div>
					</div>
				</Tab.List>
				<Tab.Panels>
					<Tab.Panel>
						<Explore />
					</Tab.Panel>
					<Tab.Panel>
						<Batch />
					</Tab.Panel>
					<Tab.Panel>
						<Download />
					</Tab.Panel>
				</Tab.Panels>
			</Tab.Group>
		</div>
	);
};

export default App;
