// 1. Multiple objects in multiline array
const
	FUNCTIONAL_PAGES = [
		{slug: '/employees', title: 'Zaměstnanci', menuSection: 'employees', menuOrder: 0},
		{slug: '/reservations', title: 'Rezervace', menuSection: 'reservations', menuOrder: 0}
	];

// 2. Single object inline
const SINGLE = [{name: 'foo', value: 42}];

// 3. Already multiline — normalize to canonical form
const ALREADY_MULTI = [
	{
		name: 'bar',
		value: 1
	}
];

// 4. Nested object/array values stay inline
const WITH_NESTED = [{name: 'foo', config: {a: 1, b: 2}, tags: ['x', 'y']}];

// 5. Array of primitives — skip
const PRIMITIVES = ['foo', 'bar', 'baz'];

// 6. let assignment
let PAGES = [{slug: '/home', title: 'Home'}];
