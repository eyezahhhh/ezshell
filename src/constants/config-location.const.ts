// @ts-nocheck

import { HOME } from "./home.const";

export const CONFIG_LOCATION: string =
	typeof CONFIG !== "undefined"
		? CONFIG.toString()
		: `${HOME}/.config/eyezah-ui/config.yaml`;
