// Scenario 12: Nested interface member sorting (recursive)

export interface INavItem {
	children?: Array<{
		title: string;
		to: {
			name: string;
			params?: Record<string, string>;
		};
	}>;
	icon: Component;
	title: string;
	to: {
		name: string;
		params?: Record<string, string>;
	};
}
