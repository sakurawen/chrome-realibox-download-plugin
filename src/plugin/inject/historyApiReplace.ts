const replaceHistoryApi = () => {
	const originHistoryPushState = history.pushState;
	const originHistoryReplaceState = history.replaceState;
	const override = {
		pushState: function (...args: any) {
			originHistoryPushState.apply(this, args);
			window.postMessage(
				{
					type: 'folderChange',
				},
				'*'
			);
		},
		replaceState: function (...args: any) {
			originHistoryReplaceState.apply(this, args);
			window.postMessage(
				{
					type: 'folderChange',
				},
				'*'
			);
		},
	};
	history.pushState = override.pushState;
	history.replaceState = override.replaceState;
};

export default replaceHistoryApi;
