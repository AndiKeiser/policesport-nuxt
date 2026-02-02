<script setup lang="ts">
import type { Discipline, Post, Member } from '#shared/types/schema';
import { useDirectusTranslation } from '~/composables/useDirectusTranslation';

const route = useRoute();
const { enabled, state } = useLivePreview();
const { isVisualEditingEnabled, apply, setAttr } = useVisualEditing();
const eventUrl = useRequestURL();
const { getTranslation } = useDirectusTranslation();

const slug = route.params.slug as string;
const wrapperRef = ref<HTMLElement | null>(null);

const {
	public: { directusUrl },
} = useRuntimeConfig();

const { data, error, refresh } = await useFetch<{
	discipline: Discipline;
	relatedPosts: Post[];
	relatedMembers: Member[];
}>(() => `/api/disciplines/${slug}`, {
	key: `disciplines-${slug}`,
	query: {
		preview: enabled.value ? true : undefined,
		token: enabled.value ? state.token : undefined,
	},
});

if (!data.value || error.value) {
	throw createError({ statusCode: 404, statusMessage: 'Discipline not found', fatal: true });
}

const discipline = computed(() => data.value?.discipline);
const relatedPosts = computed(() => data.value?.relatedPosts || []);
const relatedMembers = computed(() => data.value?.relatedMembers || []);

const getFullName = (member: Member) => {
	const parts = [member.firstname, member.lastname].filter(Boolean);
	return parts.join(' ') || 'Member';
};

onMounted(() => {
	if (!isVisualEditingEnabled.value) return;
	apply({
		directusUrl,
		onSaved: () => refresh(),
	});
});
</script>
<template>
	<div v-if="discipline" ref="wrapperRef">
		<Container class="py-12">
			<div v-if="discipline.image" class="mb-8 w-full">
				<div
					class="relative w-full h-[400px] overflow-hidden rounded-lg"
					:data-directus="
						setAttr({ collection: 'disciplines', item: discipline.id, fields: ['image', 'meta_header_image'], mode: 'modal' })
					"
				>
					<DirectusImage
						:uuid="typeof discipline.image === 'string' ? discipline.image : discipline.image?.id"
						:file="typeof discipline.image === 'object' ? discipline.image : undefined"
						:alt="getTranslation(discipline as any, 'title')"
						class="object-cover w-full h-full"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
						fill
					/>
				</div>
			</div>

			<Headline
				:headline="getTranslation(discipline as any, 'title')"
				as="h2"
				class="!text-accent mb-4"
				:data-directus="setAttr({ collection: 'disciplines', item: discipline.id, fields: ['title', 'slug'], mode: 'popover' })"
			/>

			<Separator class="h-[1px] bg-gray-300 my-8" />

			<div class="grid grid-cols-1 gap-12">
				<main class="text-left">
					<div v-if="getTranslation(discipline as any, 'description')" class="mb-8">
						<Text
							:content="getTranslation(discipline as any, 'description') || ''"
							:data-directus="
								setAttr({
									collection: 'disciplines',
									item: discipline.id,
									fields: ['description'],
									mode: 'drawer',
								})
							"
						/>
					</div>

					<div v-if="getTranslation(discipline as any, 'rules')">
						<h2 class="text-2xl font-heading font-semibold mb-4">Regeln</h2>
						<Text
							:content="getTranslation(discipline as any, 'rules') || ''"
							:data-directus="
								setAttr({
									collection: 'disciplines',
									item: discipline.id,
									fields: ['rules'],
									mode: 'drawer',
								})
							"
						/>
					</div>

					

					<div v-if="relatedPosts.length" class="mt-12">
						<h2 class="text-2xl font-heading font-semibold mb-6">Neuigkeiten</h2>
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<NuxtLink
								v-for="post in relatedPosts"
								:key="post.id"
								:to="`/blog/${getTranslation(post as any, 'slug')}`"
								class="group block overflow-hidden rounded-lg hover:shadow-lg transition-shadow"
							>
								<div v-if="post.image" class="relative w-full aspect-video overflow-hidden">
									<DirectusImage
										:uuid="typeof post.image === 'string' ? post.image : post.image?.id"
										:file="typeof post.image === 'object' ? post.image : undefined"
										:alt="getTranslation(post as any, 'title')"
										class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
										sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
									/>
								</div>
								<div class="p-4">
									<h3 class="text-lg font-heading font-semibold mb-2 group-hover:text-accent transition-colors">
										{{ getTranslation(post as any, 'title') }}
									</h3>
									<p v-if="getTranslation(post as any, 'description')" class="text-sm text-muted-foreground line-clamp-2">
										{{ getTranslation(post as any, 'description') }}
									</p>
									<p v-if="post.published_at" class="text-xs text-muted-foreground mt-2">
										{{ new Date(post.published_at).toLocaleDateString('de-DE') }}
									</p>
								</div>
							</NuxtLink>
						</div>
					</div>

					<div v-if="relatedMembers.length" class="mt-12">
						<h2 class="text-2xl font-heading font-semibold mb-6">Resortleiter</h2>
						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							<div
								v-for="member in relatedMembers"
								:key="member.id"
								class="group flex flex-col items-center text-center"
							>
								<div class="relative w-full aspect-[4/3] overflow-hidden rounded-lg mb-4">
									<DirectusImage
										v-if="member.portrait"
										:uuid="typeof member.portrait === 'string' ? member.portrait : member.portrait?.id"
										:file="typeof member.portrait === 'object' ? member.portrait : undefined"
										:alt="getFullName(member)"
										class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
										sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
									/>
									<div
										v-else
										class="w-full h-full bg-muted flex items-center justify-center"
									>
										<span class="text-muted-foreground text-4xl">{{ member.firstname?.charAt(0) || 'M' }}</span>
									</div>
								</div>
								<div class="space-y-1">
									<h3 class="text-lg font-heading font-semibold">
										{{ getFullName(member) }}
									</h3>
									<p v-if="member.title" class="text-sm text-muted-foreground">
										{{ member.title }}
									</p>
									<p v-if="member.police_station" class="text-sm text-muted-foreground">
										{{ member.police_station }}
									</p>
									<p v-if="member.phone" class="text-sm text-muted-foreground">
										{{ member.phone }}
									</p>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</Container>
	</div>
	<div v-else class="text-center text-xl mt-[20%]">404 - Discipline Not Found</div>
</template>
