export interface SampleDocument {
	label: string;
	json: string;
}

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
	{
		label: "User profile",
		json: JSON.stringify(
			{
				id: 1024,
				name: "Ada Lovelace",
				email: "ada@example.com",
				active: true,
				roles: ["admin", "editor"],
				address: { city: "London", country: "UK" },
				lastLogin: null,
			},
			null,
			2,
		),
	},
	{
		label: "Users list",
		json: JSON.stringify(
			{
				data: [
					{ id: 1, name: "User One", email: "one@example.com", active: true },
					{ id: 2, name: "User Two", email: "two@example.com", active: false },
					{ id: 3, name: "User Three", email: "three@example.com", active: true },
				],
				meta: { page: 1, perPage: 10, total: 3 },
			},
			null,
			2,
		),
	},
	{
		label: "Nested config",
		json: JSON.stringify(
			{
				app: {
					name: "JSONDeveloper",
					version: "2.0.0",
					features: { visualizer: true, graph: true, extension: true },
					servers: [
						{ region: "us-east", url: "https://us-east.example.com" },
						{ region: "eu-west", url: "https://eu-west.example.com" },
					],
				},
			},
			null,
			2,
		),
	},
];
