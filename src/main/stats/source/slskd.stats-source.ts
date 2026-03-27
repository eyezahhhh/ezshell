import { fetch } from "@util/http";
import { Statistic, StatsSource } from "./stats-source";
import { toSizeSuffix } from "@util/unit";
import Config from "@util/config";

interface SlskdFile {
	id: string;
	username: string;
	direction: "Download" | "Upload";
	filename: string;
	size: number;
	startOffset: number;
	state: string;
	stateDescripton: string;
	requestedAt: string;
	enqueuedAt: string;
	bytesTransferred: number;
	averageSpeed: number;
	bytesRemaining: number;
	percentComplete: number;
}

interface SlskdDirectory {
	directory: string;
	fileCount: number;
	files: SlskdFile[];
}

interface SlskdFileUser {
	username: string;
	directories?: SlskdDirectory[];
}

export class SlskdStatsSource extends StatsSource {
	private readonly address = Config.getString("stats.slskd.address", true);
	private readonly apiKey = Config.getString("stats.slskd.apiKey", true);

	constructor() {
		super("Slskd");

		if (this.address && this.apiKey) {
			(async () => {
				while (1) {
					try {
						await this.poll();
					} catch (e) {
						// console.error(e);
					}
					await new Promise<void>((r) => setTimeout(r, 3_000));
				}
			})();
		}
	}

	private async poll() {
		if (!this.address || !this.apiKey) {
			throw new Error(`Cannot poll Slskd without address and API key`);
		}

		const users: SlskdFileUser[] = [];

		users.push(
			...(await fetch(`${this.address}/api/v0/transfers/downloads`, {
				headers: this.headers(),
			}).then((r) => r.json())),
		);

		users.push(
			...(await fetch(`${this.address}/api/v0/transfers/uploads`, {
				headers: this.headers(),
			}).then((r) => r.json())),
		);

		const stats: Statistic[] = [];
		for (const user of users) {
			for (const directory of user.directories || []) {
				for (const file of directory.files) {
					if (file.state == "InProgress") {
						stats.push({
							id: file.id,
							type: "percent",
							icon:
								file.direction == "Download"
									? "download-symbolic"
									: "upload-symbolic",
							title: file.filename.split("\\").pop()!,
							label: `${toSizeSuffix(file.averageSpeed)}B/s`,
							percent: file.percentComplete,
						});
					}
				}
			}
		}

		if (stats.length) {
			this.update([
				{
					title: null,
					stats,
				},
			]);
		} else if (this.getModules().length) {
			this.update([]);
		}
	}

	private headers() {
		return {
			"X-API-Key": this.apiKey!,
		};
	}
}
