import { useDeferredValue, useMemo, useRef } from 'react';
import cx from 'classnames';
import { useApp } from '@/store';

function Explore() {
	const {
		searchKey,
		fileRecord,
		createParkTask,
		downloadTaskRecord,
		sceneStatusRecord,
	} = useApp();
	const exploreContainerRef = useRef<HTMLDivElement>(null);

	/**
	 * 筛选key
	 */
	const deferredSearchKey = useDeferredValue(searchKey);

	const fileList = useMemo(() => {
		const list = Object.values(fileRecord);
		if (deferredSearchKey.trim().length === 0) return list;
		return list.filter(
			(item) =>
				item.name.toUpperCase().includes(deferredSearchKey.toUpperCase()) ||
				item.scene_uid.includes(deferredSearchKey)
		);
	}, [fileRecord, deferredSearchKey]);

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
				className='explore overflow-auto h-screen pb-8 pt-8'>
				<ul className='p-1 mt-2 flex flex-wrap justify-start items-center'>
					{fileList.map((item) => {
						return (
							<li
								role='listitem'
								className='w-1/2 select-none md:w-1/4 xl:w-[16.6%] 2xl:w-[12.5%] p-2'
								key={item.id}>
								<div
									tabIndex={0}
									className='shadow-sm w-full relative  hover:ring-indigo-100 hover:ring-2  rounded-md pb-2 pt-1 mb-2 flex justify-between items-center px-1'>
									<div className='w-full'>
										<div className='w-full relative'>
											<i
												className={cx(
													'block w-4 h-4 absolute  top-1 left-1 rounded',
													{
														'bg-blue-100':
															sceneStatusRecord[item.scene_uid] ===
															'QUERY_STATUS',
														'bg-green-100':
															sceneStatusRecord[item.scene_uid] ===
															'GET_DOWNLOAD',
														'bg-red-100':
															sceneStatusRecord[item.scene_uid] === 'ERROR',
													}
												)}></i>
											<img
												className='w-full rounded-md  object-cover aspect-video'
												src={'https:' + item.thumbnail}
												alt='thumbnail'
											/>
											<div className='absolute bottom-0 left-0 overflow-hidden text-xs whitespace-pre-wrap text-gray-500 '>
												<span className='inline-block rounded text-indigo-50 px-1 bg-black/40'>
													{item.scene_uid}
												</span>
											</div>
										</div>
										<div className='pl-1 flex w-full justify-between overflow-hidden items-center mt-2'>
											<div className='whitespace-nowrap max-w-[80%] overflow-hidden text-ellipsis'>
												{item.name}
											</div>
											<button
												tabIndex={0}
												onClick={() => handleStartPack(item)}
												className={cx(
													' hover:bg-indigo-100 hover:ring-indigo-300 hover:ring-2 ring-inset cursor-pointer hover:text-black p-0.5 rounded-md',
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
											</button>
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
