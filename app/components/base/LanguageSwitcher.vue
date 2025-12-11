<script setup lang="ts">
const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const switchLanguage = (localeCode: string) => {
	const path = switchLocalePath(localeCode);
	navigateTo(path);
};

const isActive = (localeCode: string) => {
	return locale.value === localeCode;
};
</script>

<template>
	<div class="flex items-center gap-1 rounded-md p-1">
		<Button
			v-for="loc in locales"
			:key="loc.code"
			variant="ghost"
			size="sm"
			@click="switchLanguage(loc.code)"
			:class="[
				'px-3 py-1 text-xs font-medium transition-colors',
				isActive(loc.code)
					? 'bg-primary text-primary-foreground hover:bg-primary/90'
					: 'text-muted-foreground hover:text-foreground hover:bg-accent'
			]"
			:aria-label="`Switch to ${loc.name}`"
		>
			{{ loc.code.toUpperCase() }}
		</Button>
	</div>
</template>
