<script setup lang="ts">
import type { Member } from '#shared/types/schema';

interface MembersProps {
	data: {
		id?: string;
		tagline?: string;
		headline?: string;
		members: Member[];
	};
}



const props = defineProps<MembersProps>();

const { setAttr } = useVisualEditing();

const getFullName = (member: Member) => {
	console.log(member);
	const parts = [member.firstname, member.lastname].filter(Boolean);
	return parts.join(' ') || 'Member';
};
</script>

<template>
	<div>
		<Tagline
			v-if="data.tagline"
			:tagline="data.tagline"
			:data-directus="
				setAttr({
					collection: 'block_members',
					item: data.id,
					fields: 'tagline',
					mode: 'popover',
				})
			"
		/>
		<Headline
			v-if="data.headline"
			:headline="data.headline"
			:data-directus="setAttr({ collection: 'block_members', item: data.id, fields: 'headline', mode: 'popover' })"
		/>

		<div
			class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
			:data-directus="
				setAttr({
					collection: 'block_members',
					item: data.id,
					fields: 'members',
					mode: 'modal',
				})
			"
		>
			<template v-if="data.members?.length">
				<div
					v-for="member in data.members"
					:key="member.id"
					class="group flex flex-col items-center text-center"
				>
					<div class="relative w-full aspect-square overflow-hidden rounded-lg mb-4">
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
						
						<!-- <p v-if="member.email" class="text-sm text-accent hover:underline">
							<a :href="`mailto:${member.email}`">{{ member.email }}</a>
						</p> -->
						<p v-if="member.phone" class="text-sm text-muted-foreground">
							{{ member.phone }}
						</p>
					</div>
				</div>
			</template>
			<p v-else class="col-span-full text-center text-muted-foreground">No members available.</p>
		</div>
	</div>
</template>
