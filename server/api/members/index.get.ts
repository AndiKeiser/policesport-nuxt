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
		const membersPromise = directusServer.request(
			readItems('members', {
				limit,
				page,
				sort: ['-lastname'],
				fields: ['id', 'lastname', 'firstname', 'email', 'portrait'],
				filter: { status: { _eq: 'published' } },
			}),
		);

		const countPromise = directusServer.request(
			readItems('members', {
				aggregate: { count: '*' },
				filter: { status: { _eq: 'published' } },
			}),
		);

		let [members, count] = await Promise.all([membersPromise, countPromise]);

		return {
			members,
			count: Number(count[0]?.count) || 0,
		};
	} catch {
		throw createError({ statusCode: 500, message: 'Failed to fetch paginated members' });
	}
});