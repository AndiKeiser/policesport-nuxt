<script setup lang="ts">

interface AudioItem {
	id: string;
	directus_file: string;
	sort?: number;
}

interface AudioProps {
	data: {
		id: string;
		tagline?: string;
		headline?: string;
		items: AudioItem[];
	};
}

const props = defineProps<AudioProps>();

const sortedItems = computed(() => {
	if (!props.data.items) return [];
	return [...props.data.items].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
});

const { setAttr } = useVisualEditing();
</script>

<template>
	<section class="relative">
		<Tagline
			v-if="data.tagline"
			:tagline="data.tagline"
			:data-directus="setAttr({ collection: 'block_audio', item: data.id, fields: 'tagline', mode: 'popover' })"
		/>
		<Headline
			v-if="data.headline"
			:headline="data.headline"
			:data-directus="setAttr({ collection: 'block_audio', item: data.id, fields: 'headline', mode: 'popover' })"
		/>

		<div
			v-if="sortedItems.length"
			class="mt-8 grid grid-cols-1 gap-4"
			:data-directus="setAttr({ collection: 'block_gallery', item: data.id, fields: 'items', mode: 'modal' })"
		>
			<div
				v-for="(item, index) in sortedItems"
				:key="item.id"
				class="relative overflow-hidden rounded-lg group hover:shadow-lg transition-shadow duration-300 cursor-pointer"
			>
				<DirectusAudio
					:uuid="item.directus_files_id"
					:alt="`Gallery item ${item.id}`"
					class="w-full">
				</DirectusAudio>
			</div>
		</div>
	</section>
</template>
