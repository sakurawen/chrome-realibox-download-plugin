import {
	sendMessage as sM,
	onMessage as oM,
	Destination,
	OnMessageCallback,
	GetDataType,
} from 'webext-bridge';
import { MESSAGE_TYPE, MESSAGE_TYPE_KEY } from '@/shared/message';
import { JsonValue } from 'type-fest';

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
