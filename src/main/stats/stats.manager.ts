import { JellyfinStatsSource } from "./source/jellyfin.stats-source";
import { SensorsStatsSource } from "./source/sensors.stats-source";
import { SlskdStatsSource } from "./source/slskd.stats-source";
import { StatsSource } from "./source/stats-source";

export const STATS_SOURCES: StatsSource[] = [
	new SlskdStatsSource(),
	new JellyfinStatsSource(),
	new SensorsStatsSource(),
] as const;
