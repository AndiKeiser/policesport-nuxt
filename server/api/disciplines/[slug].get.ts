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
		const disciplinesPromise = directusServer.request(
			withToken(
				token as string,
				readItems('disciplines', {
					filter: {
						translations: {
							slug: { _eq: slug },
						},
					},
					limit: 1,
					fields: [
						'id',
						'status',
						{
							image: ['id', 'focal_point_x', 'focal_point_y', 'width', 'height'],
						},
						{
							translations: ['id', 'languages_code', 'title', 'description', 'rules', 'slug'],
						},
					],
				}),
			),
		);

		const [disciplines] = await Promise.all([disciplinesPromise]);

		if (!disciplines.length) {
			throw createError({ statusCode: 404, message: `Discipline not found: ${slug}` });
		}

		const discipline = disciplines[0];

		// Fetch related posts for this discipline
		const relatedPostsPromise = directusServer.request(
			withToken(
				token as string,
				readItems('posts', {
					filter: {
						disciplines: {
							disciplines_id: { _eq: discipline?.id },
						},
						status: { _eq: 'published' },
					},
					fields: [
						'id',
						'slug',
						'published_at',
						{
							translations: ['id', 'languages_code', 'title', 'description', 'slug'],
						},
						{
							image: ['id', 'focal_point_x', 'focal_point_y', 'width', 'height'],
						},
					],
					sort: ['-published_at'],
					limit: 6,
				}),
			),
		);

		// Fetch members with this discipline
		const relatedMembersPromise = directusServer.request(
			withToken(
				token as string,
				readItems('members', {
					filter: {
						disciplines: {
							disciplines_id: { _eq: discipline?.id },
						},
						status: { _eq: 'published' },
					},
					fields: [
						'id',
						'firstname',
						'lastname',
						'police_station',
						'title',
						'email',
						'phone',
						{
							portrait: ['id', 'focal_point_x', 'focal_point_y', 'width', 'height'],
						},
					],
					sort: ['lastname', 'firstname'],
				}),
			),
		);

		const [relatedPosts, relatedMembers] = await Promise.all([relatedPostsPromise, relatedMembersPromise]);

		return { discipline, relatedPosts, relatedMembers };
	} catch (error) {
		throw createError({ statusCode: 500, message: `Failed to fetch discipline: ${slug}`, data: error });
	}
});
