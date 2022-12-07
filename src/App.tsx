import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';
import img from './assets/ve-1.png';

function App() {
	const [count, setCount] = useState(0);

	const handleShowMessage = () => {
		chrome.notifications.create({
			type: 'basic',
			title: 'Hi there 👋',
			iconUrl: img,
			message: 'Just a reminder that you rock!',
			buttons: [{ title: 'I know ☺️' }],
			priority: 0,
		});
	};

	const getToken = () => {
    chrome.runtime.sendMessage({type:"getInitData"})
		chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
			chrome.tabs.sendMessage(tabs[0].id || 0, {
				type: 'getInitData',
			});
		});
	};
	const [token, setToken] = useState('');

	useEffect(() => {
		if (token) return;
		const listenDataInit = ({ type, data }: { type: string; data: any }) => {
			if (type !== 'setInitData') return;
			const { token } = data;
			setToken(token);
		};
		chrome.runtime.onMessage.addListener(listenDataInit);
		return () => {
			chrome.runtime.onMessage.removeListener(listenDataInit);
		};
	}, []);

	return (
		<div className='App'>
			<div>
				<a
					href='https://vitejs.dev'
					target='_blank'>
					<img
						src='vite.svg'
						className='logo'
						alt='Vite logo'
					/>
				</a>
				<a
					href='https://reactjs.org'
					target='_blank'>
					<img
						src={reactLogo}
						className='logo react'
						alt='React logo'
					/>
				</a>
			</div>
			<div className='card'>
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<br />
				<button onClick={handleShowMessage}>show message!</button>
				<br />
				<button onClick={getToken}>get Token</button>
				<br />
				{token && <p>token:{token}</p>}
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className='read-the-docs'>
				Click on the Vite and React logos to learn more
			</p>
		</div>
	);
}

export default App;
