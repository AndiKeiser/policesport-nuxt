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

		const postsPromise = directusServer.request(
			readItems('posts', {
				limit,
				page,
				sort: ['-published_at'],
				fields: [
					'id',
					'slug',
					'published_at',
					'gallery',
					{
						translations: ['id', 'languages_code', 'title', 'description', 'slug'],
					},
					{
						image: ['id', 'focal_point_x', 'focal_point_y', 'width', 'height'],
					},
				],
				filter,
			}),
		);

		const countPromise = directusServer.request(
			aggregate('posts', {
				aggregate: { count: '*' },
				query: {
					filter,
				},
			}),
		);

		let [posts, countResult] = await Promise.all([postsPromise, countPromise]);

		return {
			posts,
			count: Number((countResult[0] as any)?.count) || 0,
		};
	} catch {
		throw createError({ statusCode: 500, message: 'Failed to fetch paginated posts' });
	}
});
