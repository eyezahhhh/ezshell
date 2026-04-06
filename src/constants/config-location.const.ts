// @ts-nocheck

import { HOME } from "./home.const";

export const CONFIG_LOCATION: string =
	typeof CONFIG !== "undefined"
		? CONFIG.toString()
		: `${HOME}/.config/ezshell/config.yaml`;
