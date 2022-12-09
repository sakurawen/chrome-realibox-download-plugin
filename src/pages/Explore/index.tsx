import { useDeferredValue, useMemo, useRef } from 'react';
import cx from 'classnames';
import { useApp } from '@/store';

function Explore() {
	const {
		searchKey,
		fileRecord,
		createParkTask,
		downloadTaskRecord,
	} = useApp();
	const exploreContainerRef = useRef<HTMLDivElement>(null);


	/**
	 * 筛选key
	 */
	const deferredSearchKey = useDeferredValue(searchKey);

	const fileList = useMemo(() => Object.values(fileRecord), [fileRecord]);

	/**
	 * 当前可供下载的节点
	 */
	const filterNodes = useMemo(() => {
		if (deferredSearchKey.trim().length === 0) return fileList;
		return fileList.filter((item) => item.name.includes(deferredSearchKey));
	}, [deferredSearchKey, fileList]);

	/**
	 *
	 * @param parent_id
	 * @param scene_uid
	 */
	const handleStartPack = (file: Realibox.File) => {
		createParkTask(file);
	};

	return (
		<>
			<div className='fixed z-10 bottom-0 left-0 w-full bg-white py-2'>
				<div className='w-full'>
					<div className='flex flex-wrap items-center select-none  px-2 space-x-4'>
						<div className='flex items-center text-xs space-x-1'>
							<i className='block w-4 h-4 rounded bg-blue-100'></i>
							<span>打包中</span>
						</div>
						<div className='flex items-center text-xs space-x-1'>
							<i className='block w-4 h-4 rounded bg-green-100'></i>
							<span>已获取下载地址</span>
						</div>
						<div className='flex items-center text-xs space-x-1'>
							<i className='block w-4 h-4 rounded bg-red-100'></i>
							<span>发生错误</span>
						</div>
					</div>
				</div>
			</div>
			<div
				ref={exploreContainerRef}
				className='explore overflow-auto h-screen  pt-8'>
				<ul className='p-1 mt-2 flex flex-wrap justify-start items-center'>
					{filterNodes.map((item) => {
						return (
							<li
								className='w-1/2 select-none md:w-1/4 lg:w-[12.5%] 2xl:w-1/12 p-2'
								key={item.id}>
								<div className='shadow-sm w-full  hover:ring-indigo-100 hover:ring-2  rounded-md pb-2 pt-1 mb-2 flex justify-between items-center px-1'>
									<div className='w-full'>
										<div className='w-full relative'>
											<i
												className={cx(
													'block w-4 h-4 absolute  top-1 left-1 rounded',
													{
														'bg-blue-100': item.task_status === 'QUERY_STATUS',
														'bg-emerald-500':
															item.task_status === 'GET_DOWNLOAD',
														'bg-red-100': item.task_status === 'ERROR',
													}
												)}></i>
											<img
												className='w-full rounded-md  object-cover aspect-video'
												src={'https:' + item.thumbnail}
												alt='thumbnail'
											/>
										</div>
										<div className='pl-1 flex w-full justify-between overflow-hidden items-center mt-2'>
											<div className='whitespace-nowrap max-w-[80%] overflow-hidden text-ellipsis'>
												{item.name}
											</div>
											<div
												onClick={() => handleStartPack(item)}
												className={cx(
													' hover:bg-indigo-100 cursor-pointer hover:text-black p-0.5 rounded-md',
													{
														hidden:
															downloadTaskRecord[item.scene_uid]?.status ===
																'ERROR' ||
															downloadTaskRecord[item.scene_uid]?.status,
													}
												)}>
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
														d='M12 6v12m6-6H6'
													/>
												</svg>
											</div>
										</div>
									</div>
								</div>
							</li>
						);
					})}
				</ul>
			</div>
		</>
	);
}

export default Explore;
