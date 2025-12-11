<script setup lang="ts">
import Hero from '~/components/block/Hero.vue';
import RichText from '~/components/block/RichText.vue';
import Gallery from '~/components/block/Gallery.vue';
import Pricing from '~/components/block/Pricing.vue';
import Posts from '~/components/block/Posts.vue';
import Events from '~/components/block/Events.vue';
import Form from '~/components/block/FormBlock.vue';
import Video from '~/components/block/Video.vue';
import Audio from '~/components/block/Audio.vue';
import Members from '~/components/block/Members.vue';
import Disciplines from '~/components/block/Disciplines.vue';

interface BaseBlockProps {
	block: {
		collection: string;
		item: any;
		id: string;
	};
}

const props = defineProps<BaseBlockProps>();
const blockRef = ref<HTMLElement | null>(null);

const components: Record<string, any> = {
	block_hero: Hero,
	block_richtext: RichText,
	block_gallery: Gallery,
	block_pricing: Pricing,
	block_posts: Posts,
	block_disciplines: Disciplines,
	block_events: Events,
	block_members: Members,
	block_form: Form,
	block_video: Video,
	block_audio: Audio,
};

const Component = computed(() => components[props.block.collection] || null);
const componentData = computed(() => props.block.item);

</script>

<template>
	<div ref="blockRef" class="relative">
		<component :is="Component" v-if="Component" :id="`block-${block.id}`" :data="componentData" />
	</div>
</template>
