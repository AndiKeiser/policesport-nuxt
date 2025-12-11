<script setup lang="ts">
import { getDirectusAssetURL } from '@@/server/utils/directus-utils';
import { watch, ref } from 'vue';

interface DirectusAudioProps {
	uuid: string;
	alt: string;
	[key: string]: any;
}

const props = defineProps<DirectusAudioProps>();

const src = ref(getDirectusAssetURL(props.uuid));

watch(
	() => props.uuid,
	(newUuid) => {
		src.value = getDirectusAssetURL(newUuid);
	},
);
</script>

<template>
	<audio controls :src="src" v-bind="{ ...props, uuid: undefined }">
	</audio>
</template>
