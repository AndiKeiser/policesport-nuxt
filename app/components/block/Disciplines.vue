<script setup lang="ts">
import type { Discipline } from '#shared/types/schema';
import { useDirectusTranslation } from '~/composables/useDirectusTranslation';

interface DisciplinesProps {
	data: {
		id?: string;
		tagline?: string;
		headline?: string;
		disciplines: Discipline[];
	};
}



const props = defineProps<DisciplinesProps>();
const { getTranslation } = useDirectusTranslation();

const { setAttr } = useVisualEditing();


</script>

<template>
	<div>
		<Tagline
			v-if="data.tagline"
			:tagline="data.tagline"
			:data-directus="
				setAttr({
					collection: 'block_disciplines',
					item: data.id,
					fields: 'tagline',
					mode: 'popover',
				})
			"
		/>
		<Headline
			v-if="data.headline"
			:headline="data.headline"
			:data-directus="setAttr({ collection: 'block_disciplines', item: data.id, fields: 'headline', mode: 'popover' })"
		/>

		<div
			class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8"
			:data-directus="
				setAttr({
					collection: 'block_disciplines',
					item: data.id,
					fields: ['collection', 'limit'],
					mode: 'popover',
				})
			"
		>
			<template v-if="data.disciplines?.length">
				<NuxtLink
					v-for="discipline in data.disciplines"
					:key="discipline.id"
					:to="`/disciplines/${getTranslation(discipline, 'slug')}`"
					class="group block overflow-hidden rounded-lg"
				>

					
					<div class="relative w-full h-[256px] overflow-hidden rounded-lg">
						<DirectusImage
							v-if="discipline.image"
							:uuid="typeof discipline.image === 'string' ? discipline.image : discipline.image?.id"
							:file="typeof discipline.image === 'object' ? discipline.image : undefined"
							:alt="discipline.title"
							class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
							sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
						/>
					</div>
					
					<div class="p-4">
						<h3 class="text-lg font-heading font-semibold">
							{{ discipline.title }}
						</h3>
					</div>
					
				
				</NuxtLink>
			</template>
			<p v-else class="col-span-full text-center text-muted-foreground">No disciplines available.</p>
		</div>
	</div>
</template>
