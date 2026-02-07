import { z } from 'zod';

const querySchema = z.object({
	limit: z.coerce.number().min(1).max(100).default(100),
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
		// Build filter
		const filter: any = { status: { _eq: 'published' } };

		// If slug is provided, filter by translation slug
		if (slug) {
			filter.translations = {
				slug: { _eq: slug }
			};
		}

		const disciplinesPromise = directusServer.request(
			readItems('disciplines', {
				limit,
				page,
				sort: ['-sort'],
				fields: [
					'id',
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
			aggregate('disciplines', {
				aggregate: { count: '*' },
				query: {
					filter: { status: { _eq: 'published' } },
				},
			}),
		);

		let [disciplines, countResult] = await Promise.all([disciplinesPromise, countPromise]);

		return {
			disciplines,
			count: Number((countResult[0] as any)?.count) || 0,
		};
	} catch {
		throw createError({ statusCode: 500, message: 'Failed to fetch paginated disciplines' });
	}
});
