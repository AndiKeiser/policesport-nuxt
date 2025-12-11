export const useDirectusTranslation = () => {
	const { locale } = useI18n();

	// Map i18n locale codes to Directus language codes
	const localeMap: Record<string, string> = {
		'de': 'de-DE',
		'fr': 'fr-FR',
	};

	/**
	 * Get translated content from Directus translations array
	 * @param item - The item with translations (e.g., Post, Page, etc.)
	 * @param field - The field to get translation for (e.g., 'title', 'description')
	 * @returns The translated value or empty string if not found
	 */
	const getTranslation = <T extends Record<string, any>>(
		item: T,
		field: keyof T
	): string => {
		if (!item.translations || !Array.isArray(item.translations)) return '';

		const directusLocale = localeMap[locale.value] || locale.value;

		const translation = item.translations.find(
			(t: any) => t.languages_code === directusLocale
		);

		return translation?.[field as string] || '';
	};

	return {
		getTranslation,
	};
};