export function toSizeSuffix(number: number) {
	const suffixes = ["K", "M", "G", "T"];

	const simplify = (number: number) => {
		if (number >= 100) {
			return Math.round(number);
		}
		return Math.round(number * 10) / 10;
	};

	for (let i = suffixes.length; i > 0; i--) {
		const pow = Math.pow(1000, i);
		if (number > pow) {
			return `${simplify(number / pow)} ${suffixes[i - 1]}`;
		}
	}

	return `${simplify(number)} `;
}
