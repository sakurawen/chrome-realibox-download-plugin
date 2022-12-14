import { useApp } from '@/store';
import cx from 'classnames';

const Batch = () => {
	const {
		batch,
		setBatchParentId,
		setBatchSceneIds,
		setBatchSplit,
		getBatchSceneIds,
	} = useApp();
	const splitLine = batch.split === 'line';
	const splitDefault = batch.split === 'default';

	const handleStart = () => {
		console.log('scene ids list:', getBatchSceneIds());
	};
	return (
		<div className='px-2 pt-10 h-screen'>
			<div className=' space-y-4'>
				<div>
					<p>场景ID划分</p>
					<div className='pt-2 text-xs space-x-2'>
						<button
							onClick={() => setBatchSplit('default')}
							className={cx('p-1 rounded bg-gray-100 w-24', {
								'!bg-indigo-100': splitDefault,
							})}>
							按逗号
						</button>
						<button
							onClick={() => setBatchSplit('line')}
							className={cx('p-1 rounded bg-gray-100 w-24', {
								'!bg-indigo-100': splitLine,
							})}>
							按行
						</button>
					</div>
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
					<button onClick={handleStart} className='p-2 inline-flex items-center justify-center bg-indigo-100 text-black rounded hover:bg-indigo-200'>
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
