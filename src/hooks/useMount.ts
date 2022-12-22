import { useEffect, EffectCallback } from 'react';

const useMount = (cb: EffectCallback) => {
	useEffect(() => {
		cb();
	}, []);
};

export default useMount;
