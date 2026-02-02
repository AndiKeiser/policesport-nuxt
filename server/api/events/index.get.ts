import { z } from 'zod';

const querySchema = z.object({
	limit: z.coerce.number().min(1).max(100).default(6),
	page: z.coerce.number().min(1).default(1),
	slug: z.string().optional(),
});



export default defineEventHandler(async (event) => {
	const query = await getValidatedQuery(event, querySchema.safeParse);

	if (!query.success) {
		throw createError({ statusCode: 400, message: 'Invalid query parameters' });
	}

	const { limit, page, slug } = query.data;


	try {
		// Get current date in ISO format
		const now = new Date().toISOString();

		// Build filter - hide events where end_date is in the past
		const filter: any = {
			status: { _eq: 'published' },
			end_date: { _gte: now } as any,
		};

		// If slug is provided, filter by translation slug
		if (slug) {
			filter.translations = {
				slug: { _eq: slug }
			};
		}

		const eventsPromise = directusServer.request(
			readItems('events', {
				limit,
				page,
				sort: ['start_date'],
				fields: [
					'id',
					'start_date',
					'end_date',
					{
						translations: ['id', 'languages_code', 'title', 'slug'],
					},
					{
						image: ['id', 'focal_point_x', 'focal_point_y', 'width', 'height'],
					},
				],
				filter,
			}),
		);

		const countPromise = directusServer.request(
			aggregate('events', {
				aggregate: { count: '*' },
				query: {
					filter: {
						status: { _eq: 'published' },
						end_date: { _gte: now } as any,
					},
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
