// Scenario 12: Nested interface member sorting (recursive)

export interface INavItem {
	to: {
		params?: Record<string, string>;
		name: string;
	};
	title: string;
	icon: Component;
	children?: Array<{
		to: {
			params?: Record<string, string>;
			name: string;
		};
		title: string;
	}>;
}
