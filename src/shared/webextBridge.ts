import {
	sendMessage as sM,
	onMessage as oM,
	Destination,
	OnMessageCallback,
	GetDataType,
} from 'webext-bridge';
import { JsonValue } from 'type-fest';

export const MESSAGE_TYPE = {
	DEVTOLLS_FLUSH_FOLDER_NODES: 'DEVTOLLS_FLUSH_FOLDER_NODES', //devtools刷新文件夹
	BACKGROUND_CREATE_PACK_TASK: 'BACKGROUND_CREATE_PACK_TASK', //background创建打包任务
	BACKGROUND_QUERY_TASK_STATUS: 'BACKGROUND_QUERY_TASK_STATUS', //background查询打包状态
	BACKGROUND_FLUSH_FOLDER_NODES: 'BACKGROUND_FLUSH_FOLDER_NODES', //background更新文件夹信息
	BACKGROUND_UPDATE_ACCESS_INFO: 'BACKGROUND_UPDATE_ACCESS_INFO', //background更新访问信息
	CONTENT_UPDATE_ACCESS_INFO: 'CONTENT_UPDATE_ACCESS_INFO', //content更新访问信息
	ping_background: 'ping_background',
} as const;

export type MESSAGE_TYPE_KEY = keyof typeof MESSAGE_TYPE;


type TypeSelector = (type: typeof MESSAGE_TYPE) => MESSAGE_TYPE_KEY;

/**
 * send message
 * @param typeSelector 类型选择器
 * @param data 携带数据
 * @param destination 目的地 content-script｜bakcground｜
 * @returns
 */
export const sendMessage = async <T extends JsonValue>(
	typeSelector: TypeSelector | MESSAGE_TYPE_KEY,
	data: GetDataType<MESSAGE_TYPE_KEY, JsonValue>,
	destination: Destination
) => {
	let type: MESSAGE_TYPE_KEY;
	if (typeof typeSelector === 'function') {
		type = typeSelector(MESSAGE_TYPE);
	} else {
		type = typeSelector;
	}
	return await sM<T, MESSAGE_TYPE_KEY>(type, data, destination);
};

/**
 *
 * @param typeSelector 类型选择器
 * @param onMessageCallback 回调
 * @returns
 */
export const onMessage = <T extends JsonValue>(
	typeSelector: TypeSelector | MESSAGE_TYPE_KEY,
	onMessageCallback: OnMessageCallback<T>
) => {
	let type: MESSAGE_TYPE_KEY;
	if (typeof typeSelector === 'function') {
		type = typeSelector(MESSAGE_TYPE);
	} else {
		type = typeSelector;
	}
	return oM<T, MESSAGE_TYPE_KEY>(type, onMessageCallback);
};
