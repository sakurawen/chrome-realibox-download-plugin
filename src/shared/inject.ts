
/**
 * 注入重写 history api 脚本
 */
export const injectHistoryApiReplaceScript = () => {
	import('@/background/inject/historyApiReplace').then((res) => {
		browser.devtools.inspectedWindow.eval(`
    (${res.default})()
  `);
	});
};
