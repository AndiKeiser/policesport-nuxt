<script setup lang="ts">
interface PageBuilderProps {
	sections: PageBlock[];
}

const props = defineProps<PageBuilderProps>();
console.log(props.sections);
const validBlocks = computed(() =>
	props.sections.filter(
		(block): block is PageBlock & { collection: string; item: object } =>
			typeof block.collection === 'string' && !!block.item && typeof block.item === 'object',
	),
);

console.log(validBlocks);
</script>

<template>
	<div v-for="block in validBlocks" :key="block.id" :data-background="block.background" class="py-16">
		<Container>
			<BaseBlock :block="block" />
		</Container>
	</div>
</template>
