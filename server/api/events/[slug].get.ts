export default defineEventHandler(async (event) => {
	const slug = getRouterParam(event, 'slug');

	if (!slug) {
		throw createError({ statusCode: 400, message: 'Slug is required' });
	}

	// Handle live preview
	const query = getQuery(event);
	const { preview, token: rawToken } = query;
	const token = preview === 'true' && rawToken ? String(rawToken) : null;

	try {
		const eventsPromise = directusServer.request(
			withToken(
				token as string,
				readItems('events', {
					filter: {
						translations: {
							slug: { _eq: slug },
						},
					},
					limit: 1,
					fields: [
						'id',
						'start_date',
						'end_date',
						'status',
						'location',
						'images',
						{
							translations: ['id', 'languages_code', 'title', 'content', 'slug', 'link'],
						},
						{
							image: ['id', 'focal_point_x', 'focal_point_y', 'width', 'height'],
						},
						'seo',
					],
				}),
			),
		);

		// This is a really naive implementation of related posts. Just a basic check to ensure we don't return the same post. You might want to do something more sophisticated.
		const relatedEventsPromise = directusServer.request(
			withToken(
				token as string,
				readItems('events', {
					filter: {
						translations: {
							slug: { _neq: slug }
						}
					},
					fields: [
						'id',
						'start_date',
						'end_date',
						{
							translations: ['id', 'languages_code', 'title', 'slug'],
						},
						{
							image: ['id'],
						},
					],
					limit: 2,
				}),
			),
		);

		const [events, relatedEvents] = await Promise.all([eventsPromise, relatedEventsPromise]);

		if (!events.length) {
			throw createError({ statusCode: 404, message: `Event not found: ${slug}` });
		}

		return { event: events[0], relatedEvents: relatedEvents };
	} catch (error) {
		throw createError({ statusCode: 500, message: `Failed to fetch event: ${slug}`, data: error });
	}
});
