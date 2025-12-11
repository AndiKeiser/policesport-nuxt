<script setup lang="ts">
import { getDirectusAssetURL, getFocalPoint } from '@@/server/utils/directus-utils';
import { watch, ref, computed } from 'vue';
import type { DirectusFile } from '#shared/types/schema';

interface DirectusImageProps {
	uuid: string;
	alt: string;
	width?: number;
	height?: number;
	file?: DirectusFile;
	[key: string]: any;
}

const props = withDefaults(defineProps<DirectusImageProps>(), {
	width: undefined,
	height: undefined,
	file: undefined,
});

const src = ref(getDirectusAssetURL(props.uuid));

const objectPosition = computed(() => {
	if (props.file) {
		return getFocalPoint(props.file);
	}
	return '50% 50%';
});

watch(
	() => props.uuid,
	(newUuid) => {
		src.value = getDirectusAssetURL(newUuid);
	},
);
</script>

<template>
	<img
		:src="src"
		:style="{ objectPosition }"
		v-bind="{ ...props, uuid: undefined, file: undefined }"
	/>
</template>
