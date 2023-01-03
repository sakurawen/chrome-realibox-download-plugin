// 当前任务数量

type Task<T> = () => Promise<T>;

type Tasks<T> = Array<Task<T>>;

type RunConfiguration<T> = {
	limit: number;
	resolveItem?(result: T): void;
	rejectItem?(err: unknown): void;
	finishAll?(results: unknown[]): void;
};

/**
 * @param tasks
 * @param maxTaskCount
 */
const runImpl = <T>(
	tasks: Tasks<T>,
	conf: RunConfiguration<T> = { limit: 10 },
	setting: {
		count: number;
		current: number;
		results: Array<unknown>;
		taskMap: WeakMap<Function, number>;
	}
) => {
	const { limit, finishAll, resolveItem, rejectItem } = conf;
	if (setting.current > tasks.length - 1) return;
	for (let i = setting.current; i < tasks.length; i++) {
		if (setting.count >= limit) {
			break;
		}
		const task = tasks[i];
		setting.count += 1;
		setting.current += 1;
		let currentIndex = setting.taskMap.get(task) as number;
		try {
			task()
				.then((res) => {
					resolveItem?.(res);
					setting.results[currentIndex] = res;
				})
				.catch((err) => {
					rejectItem?.(err);
					setting.results[currentIndex] = err;
				})
				.finally(() => {
					setting.count -= 1;
					if (setting.count < limit) {
						runImpl(tasks, conf, setting);
					}
					// filter emtpy
					if (setting.results.filter((i) => '' + i).length === tasks.length) {
						finishAll?.(setting.results);
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
export const run = <T>(tasks: Tasks<T>, conf: RunConfiguration<T>) => {
	const taskMap = new WeakMap<Function, number>();
	tasks.forEach((task, i) => {
		taskMap.set(task, i);
	});
	const setting = {
		count: 0,
		current: 0,
		results: [],
		taskMap,
	};
	runImpl(tasks, conf, setting);
};
