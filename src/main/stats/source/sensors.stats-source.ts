import { execAsync } from "ags/process";
import { Statistic, StatsSource } from "./stats-source";
import { toSizeSuffix } from "@util/unit";

type SensorAdapter = {
	Adapter: string;
} & {
	[K in string as K extends "Adapter" ? never : K]: Record<string, number>;
};

type SensorInfo = {
	value: number;
	min?: number;
	max?: number;
};

type FlattenedAdapter = {
	adapter: string;
	sensors: Record<string, SensorInfo>;
};

interface SensorStructure {
	icon: string;
	adapter: string;
	sensor: string;
	label: string;
	min?: number;
	max?: number;
}

const TEENYBOOK_VALUES: SensorStructure[] = [
	{
		icon: "sensors-fan-symbolic",
		adapter: "macsmc_hwmon-isa-0000",
		sensor: "Fan",
		label: `{RAW} RPM`,
	},
	{
		icon: "power-symbolic",
		adapter: "macsmc_hwmon-isa-0000",
		sensor: "Total System Power",
		label: `{SIMPLIFY}W`,
		min: 0,
		max: 35,
	},
];

export class SensorsStatsSource extends StatsSource {
	constructor() {
		super("Sensors");

		this.poll().catch(console.error);
	}

	private async poll() {
		const response = await execAsync(["sensors", "-j"]);
		const json = JSON.parse(response) as Record<string, SensorAdapter>;

		const flattenedList: Record<string, FlattenedAdapter> = {};

		for (const [key, adapter] of Object.entries(json)) {
			const flattened: FlattenedAdapter = {
				adapter: adapter.Adapter,
				sensors: {},
			};

			for (const key of Object.keys(adapter)) {
				if (key != "Adapter") {
					const record = adapter[key];

					const inputKey = Object.keys(record).find((key) =>
						key.endsWith("_input"),
					);
					if (inputKey) {
						const prefix = inputKey.substring(
							0,
							inputKey.length - "_input".length,
						);

						const info: SensorInfo = {
							value: record[inputKey],
							min: record[`${prefix}_min`],
							max: record[`${prefix}_max`],
						};
						flattened.sensors[key] = info;
					}
				}
			}

			flattenedList[key] = flattened;
		}

		const stats: Statistic[] = [];

		for (const template of TEENYBOOK_VALUES) {
			// todo: CHANGE
			const adapter = flattenedList[template.adapter];
			if (adapter) {
				const sensorInfo = adapter.sensors[template.sensor];
				if (sensorInfo) {
					let percent = 0;
					if (template.min !== undefined && template.max !== undefined) {
						percent =
							((sensorInfo.value - template.min) /
								(template.max - template.min)) *
							100;
					} else if (
						sensorInfo.min !== undefined &&
						sensorInfo.max !== undefined
					) {
						percent =
							((sensorInfo.value - sensorInfo.min) /
								(sensorInfo.max - sensorInfo.min)) *
							100;
					}

					const label = template.label
						.replace("{RAW}", sensorInfo.value.toString())
						.replace("{SIMPLIFY}", toSizeSuffix(sensorInfo.value));

					const stat: Statistic = {
						id: `${template.adapter} ${template.sensor}`,
						icon: template.icon,
						type: "percent",
						label: label,
						percent: Math.max(0, Math.min(100, percent)),
					};
					stats.push(stat);
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
}
