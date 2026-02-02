export default defineEventHandler(async (event) => {
	try {
		const [globals, headerNavigation, footerNavigation, disciplines] = await Promise.all([
			directusServer.request(
				readSingleton('globals', {
					fields: ['title', 'description', 'logo', 'logo_dark_mode', 'social_links', 'accent_color', 'favicon'],
				}),
			),
			directusServer.request(
				readItem('navigation', 'main', {
					fields: [
						'id',
						'title',
						{
							items: [
								'id',
								'title',
								'url',
								'type',
								'show_disciplines',
								{
									page: ['id', 'permalink'],
									post: ['id', 'slug'],
									children: ['id', 'title', 'url', 'type', {
										page: ['id', 'permalink'],
										post: ['id', 'slug']
									}],
								},
							],
						},
					],
					deep: {
						items: {
							_sort: ['sort'],
							children: {
								_sort: ['sort'],
							},
						},
					},
				}),
			),

			directusServer.request(
				readItem('navigation', 'footer', {
					fields: [
						'id',
						'title',
						{
							items: [
								'id',
								'title',
								'url',
								'type',
								{
									page: ['id', 'permalink'],
									post: ['id', 'slug'],
									children: ['id', 'title', 'url', 'type', {
										page: ['id', 'permalink'],
										post: ['id', 'slug']
									}],
								},
							],
						},
					],
					deep: {
						items: {
							_sort: ['sort'],
							children: {
								_sort: ['sort'],
							},
						},
					},
				}),
			),

			// Fetch all disciplines with show_in_navigation = true
			directusServer.request(
				readItems('disciplines', {
					fields: [
						'id',
						{
							translations: ['id', 'languages_code', 'title', 'slug'],
						},
					],
					filter: {
						status: { _eq: 'published' },
						show_in_navigation: { _eq: true },
					},
					sort: ['sort'],
				}),
			),
		]);

		return { globals, headerNavigation, footerNavigation, disciplines };
	} catch {
		throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
	}
});
