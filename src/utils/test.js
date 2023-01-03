/**
 * @param tasks
 * @param maxTaskCount
 */
const runImpl = (
	tasks,
	conf = { limit: 10 },
	params = {
		count: 0,
		current: 0,
		results: [],
		taskMap: new WeakMap(),
	}
) => {
	const { limit, resolveAll, resolveItem, rejectItem } = conf;
	if (params.current > tasks.length - 1) return;
	for (let i = params.current; i < tasks.length; i++) {
		if (params.count >= limit) {
			break;
		}
		const task = tasks[i];
		params.count += 1;
		params.current += 1;
		const currentTaskIndex = params.taskMap.get(task);
		try {
			task()
				.then((res) => {
					resolveItem?.(res);
					params.results[currentTaskIndex] = res;
				})
				.catch((err) => {
					rejectItem?.(err);
					params.results[currentTaskIndex] = err;
				})
				.finally(() => {
					params.count -= 1;
					if (params.count < limit) {
						runImpl(tasks, conf, params);
					}
					if (params.results.filter((i) => '' + i).length === tasks.length) {
						resolveAll?.(params.results);
					}
				});
		} catch (err) {
			console.log(err);
		}
	}
};

/**
 *
 * @param tasks
 * @param conf
 */
export const run = (tasks, conf) => {
	const taskMap = new WeakMap();
	tasks.forEach((task, i) => {
		taskMap.set(task, i);
	});
	const params = {
		count: 0,
		current: 0,
		results: [],
		taskMap,
	};
	runImpl(tasks, conf, params);
};

const TaskNew = (val, type, delay) => {
	return () =>
		new Promise((resolve, reject) => {
			setTimeout(() => {
				if (type === 'resolve') {
					resolve(val);
				}
				if (type === 'reject') {
					reject(val);
				}
			}, delay);
		});
};

run(
	[
		TaskNew('wuhu1', 'resolve', 500),
		TaskNew('wuhu2', 'reject', 1500),
		TaskNew('wuhu3', 'resolve', 200),
		TaskNew('wuhu4', 'resolve', 4000),
		TaskNew('wuhu5', 'reject', 1500),
		TaskNew('wuhu6', 'resolve', 200),
		TaskNew('wuhu7', 'resolve', 1),
	],
	{
		limit: 4,
		resultOrder: 'index',
		resolveItem(result) {
			console.log('rrrrresult:', result);
		},
		rejectItem(err) {
			console.log('rrrreason:', err);
		},
		resolveAll(results) {
			console.log('aaaaaaall:', results);
		},
	}
);
