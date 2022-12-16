import { toast as t } from 'react-hot-toast';

const success = (msg: string) => {
	t.success(msg, {
		style: {
			border: '1px solid #818cf8',
			padding: '4px 6px',
			color: '#818cf8',
		},
		iconTheme: {
			primary: '#818cf8',
			secondary: 'white',
		},
	});
};

const fail = (msg: string) => {
	t.error(msg, {
    duration:5000,
		style: {
			border: '1px solid #f43f5e',
			padding: '4px 6px',
			color: '#f43f5e',
		},
		iconTheme: {
			primary: '#f43f5e',
			secondary: 'white',
		},
	});
};

export const toast = {
	success,
	fail,
};
