import { useRef, useEffect, EffectCallback } from 'react';

const useOnceEffect = (cb: EffectCallback) => {
	const used = useRef(false);
	useEffect(() => {
		if (!used.current) {
			used.current = true;
			cb();
		}
	}, []);
};

export default useOnceEffect;
