declare module Realibox {
	type File = {
		count: number;
		create_time: number;
		ext: string;
		id: string;
		link: null;
		name: string;
		object_type: number;
		object_uid: string;
		ordering: number;
		parent_id: string;
		scenes: any[];
		status: number;
		tags: string[];
		thumbnail: string;
		update_time: numbers;
		user_avatar_url: string;
		user_id: string;
		user_nickname: string;
		scene_uid: string; // 场景id
	};
	// 任务状态
	type TaskStatus =
		| 'QUERY_STATUS'
		| 'GET_DOWNLOAD'
		| 'ERROR'
		| undefined;
	type QueryTaskResult = {
		data: {
			file_url?: string;
		};
		job_uid: string;
		message: string;
		name: string | null;
		status: '110' | '200';
	};
	type QueryTaskResponse = {
		code: number;
		info: {};
		list: {
			data: Array<QueryTaskResult>;
		};
	};
}


