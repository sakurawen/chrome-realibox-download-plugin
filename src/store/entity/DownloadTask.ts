import { immerable } from 'immer';

type DownloadTaskParam = {
	jobUid: string;
	title: string;
	sceneUid: string;
	order: number;
	status: Realibox.TaskStatus;
};

class DownloadTask {
	[immerable] = true;
	jobUid: string = '';
	title: string = '';
	sceneUid: string = '';
	status: Realibox.TaskStatus;
	err: any = undefined;
	downloadUrl: string = '';
	downloadStatus: undefined | 'success' | 'fail';
	order = 0;
	constructor({ jobUid, status, title, sceneUid, order }: DownloadTaskParam) {
		this.jobUid = jobUid;
		this.status = status;
		this.sceneUid = sceneUid;
		this.title = title;
		this.order = order;
	}
}

export default DownloadTask;
