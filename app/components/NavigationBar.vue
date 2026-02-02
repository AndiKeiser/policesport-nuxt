<script setup lang="ts">
import { Menu, ChevronDown } from 'lucide-vue-next';
import SearchModal from '~/components/base/SearchModel.vue';
import type { Discipline } from '#shared/types/schema';
import { useDirectusTranslation } from '~/composables/useDirectusTranslation';

interface NavigationItem {
	id: string;
	title: string;
	url?: string;
	page?: { permalink: string };
	children?: NavigationItem[];
	show_disciplines?: boolean;
}

// Using template ref to expose the navigation bar to the layout for visual editing
const navigationRef = useTemplateRef('navigationRef');
defineExpose({ navigationRef });

interface Navigation {
	items: NavigationItem[];
}

interface Globals {
	logo?: string;
	logo_dark_mode?: string;
}

const props = defineProps<{
	navigation: Navigation;
	globals: Globals;
	disciplines: Discipline[];
}>();

const menuOpen = ref(false);
const runtimeConfig = useRuntimeConfig();
const { setAttr } = useVisualEditing();
const { getTranslation } = useDirectusTranslation();

const lightLogoUrl = computed(() =>
	props.globals?.logo ? `${runtimeConfig.public.directusUrl}/assets/${props.globals.logo}` : '/images/logo.svg',
);

const darkLogoUrl = computed(() =>
	props.globals?.logo_dark_mode ? `${runtimeConfig.public.directusUrl}/assets/${props.globals.logo_dark_mode}` : '',
);

const handleLinkClick = () => {
	menuOpen.value = false;
};
</script>

<template>
	<header ref="navigationRef" class="sticky top-0 z-50 w-full bg-white text-foreground border-b border-solid">
		<Container class="flex items-center justify-between p-4">
			<NuxtLink to="/" class="flex-shrink-0">
				<img :src="lightLogoUrl" alt="Logo" class="w-[80px] h-auto dark:hidden" width="150" height="100" />
				<img
					v-if="darkLogoUrl"
					:src="darkLogoUrl"
					alt="Logo (Dark Mode)"
					class="w-[80px] h-auto hidden dark:block"
					width="150"
					height="100"
				/>
			</NuxtLink>

			<nav class="flex items-center gap-4">
				<!-- <SearchModal /> -->
				<NavigationMenu
					class="hidden md:flex"
					:data-directus="
						setAttr({ collection: 'navigation', item: props.navigation.id, fields: ['items'], mode: 'modal' })
					"
				>
					<NavigationMenuList class="flex gap-6 ">
						<NavigationMenuItem v-for="section in props.navigation.items" :key="section.id">
							<template v-if="section.children?.length || section.show_disciplines">
								<NavigationMenuTrigger
									class="font-heading !text-nav hover:bg-background"
								>
									{{ section.title }}
								</NavigationMenuTrigger>
								<NavigationMenuContent class="min-w-[200px] rounded-md  bg-background p-4">
									<ul class="min-h-[100px] h-full flex flex-col gap-2 relative">
										<li v-for="child in section.children" :key="child.id">
											<NavigationMenuLink as-child>
												<NuxtLink :to="child.page?.permalink || child.url || '#'" class="font-heading text-nav">
													{{ child.title }}
												</NuxtLink>
											</NavigationMenuLink>
										</li>
										<template v-if="section.show_disciplines">
											<li>
												<NavigationMenuLink as-child>
													<NuxtLink :to="`/disziplinen`" class="font-heading text-nav">
														{{ 'Alle Disziplinen' }}
													</NuxtLink>
												</NavigationMenuLink>
											</li>
											<li v-for="discipline in props.disciplines" :key="discipline.id">
												<NavigationMenuLink as-child>
													<NuxtLink :to="`/disciplines/${getTranslation(discipline as any, 'slug')}`" class="font-heading text-nav">
														{{ getTranslation(discipline as any, 'title') }}
													</NuxtLink>
												</NavigationMenuLink>
											</li>
										</template>
									</ul>
								</NavigationMenuContent>
							</template>

							<NavigationMenuLink v-else as-child>
								<NuxtLink :to="section.page?.permalink || section.url || '#'" class="font-heading text-nav p-2">
									{{ section.title }}
								</NuxtLink>
							</NavigationMenuLink>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>

				<LanguageSwitcher />

				<!-- Menu Mobile -->
				<div class="flex md:hidden">
					<DropdownMenu v-model:open="menuOpen">
						<DropdownMenuTrigger as-child>
							<Button
								variant="link"
								size="icon"
								aria-label="Open menu"
								class="text-black size-10 white dark:text-white dark:hover:text-accent"
							>
								<Menu className="w-12 h-12" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							align="start"
							class="top-full w-screen p-6 shadow-md max-w-full overflow-hidden bg-background"
						>
							<div class="flex flex-col gap-4">
								<div v-for="section in props.navigation.items" :key="section.id">
									<Collapsible v-if="section.children?.length || section.show_disciplines">
										<CollapsibleTrigger
											class="font-heading text-nav hover:text-accent w-full text-left flex items-center focus:outline-none"
										>
											<span>{{ section.title }}</span>
											<ChevronDown class="size-4 ml-1 hover:rotate-180 active:rotate-180 focus:rotate-180" />
										</CollapsibleTrigger>
										<CollapsibleContent class="ml-4 mt-2 flex flex-col gap-2">
											<NuxtLink
												v-for="child in section.children"
												:key="child.id"
												:to="child.page?.permalink || child.url || '#'"
												class="font-heading text-nav"
												@click="handleLinkClick"
											>
												{{ child.title }}
											</NuxtLink>
											<template v-if="section.show_disciplines">
												<NuxtLink
													v-for="discipline in props.disciplines"
													:key="discipline.id"
													:to="`/disciplines/${getTranslation(discipline as any, 'slug')}`"
													class="font-heading text-nav"
													@click="handleLinkClick"
												>
													{{ getTranslation(discipline as any, 'title') }}
												</NuxtLink>
											</template>
										</CollapsibleContent>
									</Collapsible>

									<NuxtLink
										v-else
										:to="section.page?.permalink || section.url || '#'"
										class="font-heading text-nav"
										@click="handleLinkClick"
									>
										{{ section.title }}
									</NuxtLink>
								</div>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</nav>
		</Container>
	</header>
</template>
