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
		task_status?: TaskStatus;
	};
	type TaskStatus = 'GET_SCENE_UID' | 'QUERY_STATUS' | 'GET_DOWNLOAD' | 'ERROR'; // 当前状态
}
