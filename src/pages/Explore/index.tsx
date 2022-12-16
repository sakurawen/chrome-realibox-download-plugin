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
		exploreLoading,
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
			<div className='fixed z-20 bottom-0 left-0 w-full bg-white py-2'>
				<div className='w-full'>
					<div className='flex flex-wrap items-center select-none  px-2 space-x-4'>
						<div className='flex items-center text-xs space-x-1'>
							<i className='block w-4 h-4 rounded bg-indigo-100'></i>
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
				className='explore relative overflow-auto h-screen pb-8 pt-8'>
				<div
					className={cx(
						'explore-loading absolute flex transition-all justify-center   items-center z-10  h-full w-full top-0 left-0 bg-white',
						[exploreLoading ? 'visible opacity-100' : 'invisible opacity-0']
					)}>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={1.5}
						stroke='currentColor'
						className='w-12 h-12 animate-spin'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z'
						/>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
						/>
					</svg>
				</div>
				<ul className='p-1 flex flex-wrap justify-start items-center'>
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
														'bg-indigo-100':
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
												onDragStart={(e) => e.preventDefault()}
												className='w-full pointer-events-none select-none rounded-md  object-cover aspect-video'
												src={'https:' + item.thumbnail}
												alt='thumbnail'
											/>
											<div className='absolute bottom-0 left-1 w-full overflow-hidden text-xs whitespace-pre-wrap text-gray-500 '>
												<span className='select-all cursor-pointer inline-block rounded max-w-[80%] overflow-hidden text-ellipsis text-indigo-50 px-1 bg-black/40'>
													{item.scene_uid}
												</span>
											</div>
										</div>
										<div className='pl-1 flex w-full h-7 justify-between overflow-hidden items-center mt-2'>
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
