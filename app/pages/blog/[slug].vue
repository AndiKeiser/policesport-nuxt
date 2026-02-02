<script setup lang="ts">
import type { Post, DirectusUser } from '#shared/types/schema';
import { useDirectusTranslation } from '~/composables/useDirectusTranslation';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const route = useRoute();
const { enabled, state } = useLivePreview();
const { isVisualEditingEnabled, apply, setAttr } = useVisualEditing();
const postUrl = useRequestURL();
const { getTranslation } = useDirectusTranslation();


const slug = route.params.slug as string;

const wrapperRef = ref<HTMLElement | null>(null);

const {
	public: { directusUrl },
} = useRuntimeConfig();

const { data, error, refresh } = await useFetch<{
	post: Post;
	relatedPosts: Post[];
}>(() => `/api/posts/${slug}`, {
	key: `posts-${slug}`,
	query: {
		preview: enabled.value ? true : undefined,
		token: enabled.value ? state.token : undefined,
	},
});

console.log(data);

if (!data.value || error.value) {
	throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true });
}

const post = computed(() => data.value?.post);
const relatedPosts = computed(() => data.value?.relatedPosts);
// const author = computed(() => post.value?.author as Partial<DirectusUser>);

const swiperModules = [Navigation, Pagination];

const galleryImages = computed(() => {
	console.log(post.value.gallery);
	if (!post.value?.gallery || !Array.isArray(post.value.gallery)) return [];
	return post.value.gallery.filter((item: any) => item && typeof item === 'object');
});

onMounted(() => {
	if (!isVisualEditingEnabled.value) return;
	apply({
		directusUrl,
		onSaved: () => refresh(),
	});
});

useSeoMeta({
	title: post.value?.seo?.title || post.value?.title,
	description: post.value?.seo?.meta_description || post.value?.description,
	ogTitle: post.value?.seo?.title || post.value?.title,
	ogDescription: post.value?.seo?.meta_description || post.value?.description,
	ogUrl: postUrl.toString(),
});

</script>
<template>
	<div v-if="post" ref="wrapperRef">
		<Container class="py-12">
			<div v-if="post.image" class="mb-8 w-full">
				<div
					class="relative w-full h-[400px] overflow-hidden rounded-lg"
					:data-directus="
						setAttr({ collection: 'posts', item: post.id, fields: ['image', 'meta_header_image'], mode: 'modal' })
					"
				>
					<DirectusImage
						:uuid="post.image as string"
						:file="typeof post.image === 'object' ? post.image : undefined"
						:alt="post.title || 'post header image'"
						class="object-cover w-full h-full"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
						fill
					/>
				</div>
			</div>

			<Headline
				:headline="getTranslation(post, 'title')"
				as="h2"
				class="!text-accent mb-4"
				:data-directus="setAttr({ collection: 'posts', item: post.id, fields: ['title', 'slug'], mode: 'popover' })"
			/>

			<Separator class="h-[1px] bg-gray-300 my-8" />

			<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_400px] gap-12">
				<main class="text-left">
					<Text
						:content="getTranslation(post, 'content') || ''"
						:data-directus="
							setAttr({
								collection: 'posts',
								item: post.id,
								fields: ['content', 'meta_header_content'],
								mode: 'drawer',
							})
						"
					/>
				</main>

				<aside class="space-y-6 p-6 rounded-lg max-w-[496px] h-fit bg-background-muted">
					<p
						v-if="getTranslation(post, 'description')"
						:data-directus="setAttr({ collection: 'posts', item: post.id, fields: 'description', mode: 'popover' })"
					>
						{{ getTranslation(post, 'description') }}
					</p>

					<div>
						<!-- <Separator class="h-[1px] bg-gray-300 my-4" /> -->
						<h3 class="font-bold mb-4">Verwandte Beiträge</h3>
						<div class="space-y-4">
							<NuxtLink
								v-for="relatedPost in relatedPosts"
								:key="relatedPost.id"
								:to="`/blog/${relatedPost.slug}`"
								class="flex items-center space-x-4 hover:text-accent group"
							>
								<div v-if="relatedPost.image" class="relative shrink-0 w-[150px] h-[100px] overflow-hidden rounded-lg">
									<DirectusImage
										:uuid="relatedPost.image as string"
										:alt="getTranslation(relatedPost, 'title') || 'related post image'"
										class="object-cover transition-transform duration-300 group-hover:scale-110"
										fill
										sizes="(max-width: 768px) 100px, (max-width: 1024px) 150px, 150px"
									/>
								</div>
								<span class="font-heading">{{ getTranslation(relatedPost, 'title') }}</span>
							</NuxtLink>
						</div>
					</div>
				</aside>
			</div>

			<!-- Gallery Section -->
			<div v-if="galleryImages.length" class="mt-12">
				<h2 class="text-2xl font-heading font-semibold mb-6">Galerie</h2>
				<Swiper
					:modules="swiperModules"
					:slides-per-view="1"
					:space-between="30"
					:navigation="true"
					:pagination="{ clickable: true }"
					class="rounded-lg"
				>
					<SwiperSlide v-for="(item, index) in galleryImages" :key="index">
						<div class="relative w-full aspect-video overflow-hidden rounded-lg bg-muted">
							<DirectusImage
								:uuid="typeof item === 'string' ? item : (typeof (item as any).directus_files_id === 'string' ? (item as any).directus_files_id : (item as any).directus_files_id?.id)"
								:file="typeof (item as any).directus_files_id === 'object' ? (item as any).directus_files_id : undefined"
								:alt="`Gallery image ${index + 1}`"
								class="w-full h-full object-cover"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
								fill
							/>
						</div>
					</SwiperSlide>
				</Swiper>
			</div>
		</Container>
	</div>
	<div v-else class="text-center text-xl mt-[20%]">404 - Post Not Found</div>
</template>
