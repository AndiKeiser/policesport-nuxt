<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	modelValue: string | string[];
	name: string;
	options?: { value: string; text: string }[];
	placeholder?: string;
	multiple?: boolean;
}>();

const emits = defineEmits(['update:modelValue']);

const localValueMultiple = computed({
	get: () => {
		// For multiple selection, ensure we return an array
		if (Array.isArray(props.modelValue)) return props.modelValue;
		if (props.modelValue) return [props.modelValue as string];
		return [];
	},
	set: (value: string[]) => emits('update:modelValue', value),
});

const localValueSingle = computed({
	get: () => props.modelValue as string,
	set: (value: string) => emits('update:modelValue', value),
});

const isSelected = (optionValue: string) => {
	if (!props.multiple) return false;
	return localValueMultiple.value.includes(optionValue);
};

const toggleOption = (optionValue: string) => {
	if (!props.multiple) {
		localValueSingle.value = optionValue;
		return;
	}

	const values = [...localValueMultiple.value];
	const index = values.indexOf(optionValue);

	if (index > -1) {
		values.splice(index, 1);
	} else {
		values.push(optionValue);
	}

	localValueMultiple.value = values;
};
</script>

<template>
	<div v-if="multiple" class="space-y-2">
		<div class="flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px] bg-background">
			<span v-if="localValueMultiple.length === 0" class="text-muted-foreground">
				{{ placeholder || 'Select options' }}
			</span>
			<span
				v-for="value in localValueMultiple"
				:key="value"
				class="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded text-sm"
			>
				{{ options?.find(opt => opt.value === value)?.text }}
				<button
					type="button"
					@click.prevent="toggleOption(value)"
					class="hover:bg-accent-foreground/20 rounded-full p-0.5"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</span>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
			<button
				v-for="option in options ?? []"
				:key="option.value"
				type="button"
				@click.prevent="toggleOption(option.value)"
				:class="[
					'px-4 py-2 border rounded-md text-left transition-colors',
					isSelected(option.value)
						? 'bg-accent text-accent-foreground border-accent'
						: 'bg-background hover:bg-accent/10 border-input'
				]"
			>
				<span class="flex items-center gap-2">
					<span
						:class="[
							'flex items-center justify-center w-4 h-4 border rounded',
							isSelected(option.value)
								? 'bg-accent-foreground border-accent-foreground'
								: 'border-input'
						]"
					>
						<svg
							v-if="isSelected(option.value)"
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					</span>
					{{ option.text }}
				</span>
			</button>
		</div>
	</div>
	<Select v-else v-model="localValueSingle">
		<SelectTrigger :id="props.name">
			<SelectValue :placeholder="props.placeholder || 'Select an option'" />
		</SelectTrigger>
		<SelectContent>
			<SelectGroup>
				<SelectItem v-for="option in props.options ?? []" :key="option.value" :value="option.value">
					{{ option.text }}
				</SelectItem>
			</SelectGroup>
		</SelectContent>
	</Select>
</template>
