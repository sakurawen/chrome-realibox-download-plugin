/// <reference types="vite/client" />
import type Browser, { Runtime } from 'webextension-polyfill';

declare global {
	const browser: Browser.Browser;
	type RuntimePort = Runtime.Port;
}
