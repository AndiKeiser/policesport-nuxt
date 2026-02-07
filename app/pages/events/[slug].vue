<script setup lang="ts">
import type { Event, DirectusUser } from '#shared/types/schema';
import { useDirectusTranslation } from '~/composables/useDirectusTranslation';

const route = useRoute();
const { enabled, state } = useLivePreview();
const { isVisualEditingEnabled, apply, setAttr } = useVisualEditing();
const eventUrl = useRequestURL();
const { getTranslation } = useDirectusTranslation();
const { t, locale } = useI18n();
const slug = route.params.slug as string;
const wrapperRef = ref<HTMLElement | null>(null);

const {
	public: { directusUrl },
} = useRuntimeConfig();

const { data, error, refresh } = await useFetch<{
	event: Event;
	relatedEvents: Event[];
}>(() => `/api/events/${slug}`, {
	key: `events-${slug}`,
	query: {
		preview: enabled.value ? true : undefined,
		token: enabled.value ? state.token : undefined,
	},
});

if (!data.value || error.value) {
	throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true });
}

const event = computed(() => data.value?.event);
const relatedEvents = computed(() => data.value?.relatedEvents);
// const author = computed(() => event.value?.author as Partial<DirectusUser>);

onMounted(() => {
	if (!isVisualEditingEnabled.value) return;
	apply({
		directusUrl,
		onSaved: () => refresh(),
	});
});

const formatStartDate = (dateString: string | null | undefined) => {
	if (!dateString) return '';
	const date = new Date(dateString);
	return new Intl.DateTimeFormat(locale.value, {
		day: 'numeric',
	}).format(date);
};

const formatDate = (dateString: string | null | undefined) => {
	if (!dateString) return '';
	const date = new Date(dateString);
	return new Intl.DateTimeFormat(locale.value, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(date);
};


useSeoMeta({
	title: event.value?.seo?.title || getTranslation(event.value as any, 'title'),
	description: event.value?.seo?.meta_description,
	ogTitle: event.value?.seo?.title || getTranslation(event.value as any, 'title'),
	ogDescription: event.value?.seo?.meta_description,
	ogUrl: eventUrl.toString(),
});
</script>
<template>
	<div v-if="event" ref="wrapperRef">
		<Container class="py-12">
			<div v-if="event.image" class="mb-8 w-full">
				<div
					class="relative w-full h-[400px] overflow-hidden rounded-lg"
					:data-directus="
						setAttr({ collection: 'events', item: event.id, fields: ['image', 'meta_header_image'], mode: 'modal' })
					"
				>
					<DirectusImage
						:uuid="typeof event.image === 'string' ? event.image : event.image?.id"
						:file="typeof event.image === 'object' ? event.image : undefined"
						:alt="getTranslation(event as any, 'title')"
						class="object-cover w-full h-full"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
						fill
					/>
				</div>
			</div>

			<Headline
				:headline="getTranslation(event as any, 'title')"
				as="h2"
				class="!text-accent mb-4"
				:data-directus="setAttr({ collection: 'events', item: event.id, fields: ['title', 'slug'], mode: 'popover' })"
			/>

			<Separator class="h-[1px] bg-gray-300 my-8" />

			<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_400px] gap-12">
				<main class="text-left">
					<div class="text-muted-foreground mb-4">
						
						{{ t('events.dateRange', { start: formatStartDate(event.start_date), end: formatDate(event.end_date) }) }}
						

						<!-- <span>{{ formatStartDate(event.start_date) }}. - {{ formatDate(event.end_date) }}</span> -->
						<span v-if="event.location"> / {{ event.location }}</span>
					</div>

					<Text
						:content="getTranslation(event as any, 'content') || ''"
						:data-directus="
							setAttr({
								collection: 'events',
								item: event.id,
								fields: ['content'],
								mode: 'drawer',
							})
						"
					/>
				</main>

			</div>
		</Container>
	</div>
	<div v-else class="text-center text-xl mt-[20%]">404 - Event Not Found</div>
</template>
