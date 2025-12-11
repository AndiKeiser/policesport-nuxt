import { z } from 'zod';

const querySchema = z.object({
	limit: z.coerce.number().min(1).max(100).default(6),
	page: z.coerce.number().min(1).default(1),
});

export default defineEventHandler(async (event) => {
	const query = await getValidatedQuery(event, querySchema.safeParse);

	if (!query.success) {
		throw createError({ statusCode: 400, message: 'Invalid query parameters' });
	}

	const { limit, page } = query.data;

	try {
		const eventsPromise = directusServer.request(
			readItems('events', {
				limit,
				page,
				sort: ['-start_date'],
				fields: [
					'id',
					'start_date',
					'end_date',
					{
						translations: ['id', 'languages_code', 'title'],
					},
					{
						image: ['id', 'focal_point_x', 'focal_point_y', 'width', 'height'],
					},
				],
				filter: { status: { _eq: 'published' } },
			}),
		);

		const countPromise = directusServer.request(
			aggregate('events', {
				aggregate: { count: '*' },
				query: {
					filter: { status: { _eq: 'published' } },
				},
			}),
		);

		let [events, countResult] = await Promise.all([eventsPromise, countPromise]);

		return {
			events,
			count: Number((countResult[0] as any)?.count) || 0,
		};
	} catch {
		throw createError({ statusCode: 500, message: 'Failed to fetch paginated events' });
	}
});
