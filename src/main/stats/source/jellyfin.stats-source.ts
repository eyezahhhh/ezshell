import Config from "@util/config";
import { Statistic, StatsModule, StatsSource } from "./stats-source";
import { fetch } from "@util/http";

interface ScheduledTask {
	Name: string;
	State: string; // "Idle"
	CurrentProgressPercentage?: number;
	Id: string;
	LastExecutionResult: {
		StartTimeUtc: string;
		EndTimeUtc: string;
		Status: string; // "Completed"
		Name: string;
		Key: string;
		Id: string;
		ErrorMessage?: string;
		LongErrorMessage?: string;
	};
	Triggers: {}[]; // todo: implement
	Description: string;
	Category: string;
	IsHidden: boolean;
	Key: string;
}

export class JellyfinStatsSource extends StatsSource {
	private readonly address = Config.getString("stats.jellyfin.address", true);
	private readonly apiKey = Config.getString("stats.jellyfin.apiKey", true);

	constructor() {
		super("Jellyfin");

		if (this.address && this.apiKey) {
			(async () => {
				while (1) {
					try {
						await this.poll();
					} catch (e) {
						console.error(e);
					}
					await new Promise<void>((r) => setTimeout(r, 3_000));
				}
			})();
		}
	}

	private async poll() {
		if (!this.address || !this.apiKey) {
			throw new Error(`Cannot poll Jellyfin without address and API key`);
		}

		try {
			const response = await fetch(`${this.address}/ScheduledTasks`, {
				headers: this.headers(),
			});

			if (response.status != 200) {
				throw new Error(`Jellyfin responded with code ${response.status}`);
			}

			const data: ScheduledTask[] = await response.json();

			const stats: Statistic[] = data
				.filter((task) => task.CurrentProgressPercentage !== undefined)
				.map((task) => ({
					id: task.Key,
					type: "percent",
					icon: "multimedia-video-player-symbolic",
					title: task.Name,
					label: `${Math.round(task.CurrentProgressPercentage! * 10) / 10}%`,
					percent: task.CurrentProgressPercentage!,
				}));

			if (stats.length) {
				this.update([
					{
						title: null,
						stats,
					},
				]);
				return;
			}
		} catch (e) {
			// console.error(e);
		}

		if (this.getModules().length) {
			this.update([]);
		}
	}

	private headers() {
		return {
			Authorization: `MediaBrowser Token="${this.apiKey}"`,
		};
	}
}
