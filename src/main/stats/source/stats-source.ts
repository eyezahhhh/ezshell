export type StatId = string | number;

export type Statistic = {
	id: StatId;
} & {
	type: "percent";
	label: string;
	icon: string;
	title?: string | null;
	percent: number;
};

export interface StatsModule {
	title: string | null;
	stats: Statistic[];
}

export type StatsSourceCallback = (modules: StatsModule[]) => void;

export abstract class StatsSource {
	private readonly callbacks = new Set<StatsSourceCallback>();
	private modules: StatsModule[] = [];

	protected constructor(private readonly name: string) {}

	protected update(modules: StatsModule[]) {
		this.modules = modules;
		for (const callback of this.callbacks) {
			callback(this.modules);
		}
	}

	public getModules(): StatsModule[] {
		return this.modules;
	}

	public getName() {
		return this.name;
	}

	public addListener(callback: StatsSourceCallback) {
		this.callbacks.add(callback);

		return () => this.removeListener(callback);
	}

	public removeListener(callback: StatsSourceCallback) {
		this.callbacks.delete(callback);
	}
}
