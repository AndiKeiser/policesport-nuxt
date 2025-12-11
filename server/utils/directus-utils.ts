export function getDirectusAssetURL(fileOrString: string | DirectusFile | null | undefined): string {
	if (!fileOrString) return '';

	const runtimeConfig = useRuntimeConfig();
	const directusUrl = runtimeConfig.public.directusUrl;

	if (typeof fileOrString === 'string') {
		return `${directusUrl}/assets/${fileOrString}`;
	}

	return `${directusUrl}/assets/${fileOrString.id}`;
}

export function getFocalPoint(file: DirectusFile | null | undefined): string {
	if (!file || typeof file === 'string') return '50% 50%';

	// If no focal point is set, default to center
	if (file.focal_point_x == null || file.focal_point_y == null) {
		return '50% 50%';
	}

	// If no width/height available, assume focal point is already in percentage
	if (!file.width || !file.height) {
		return '50% 50%';
	}

	// Convert pixel coordinates to percentages
	const xPercent = (file.focal_point_x / file.width) * 100;
	const yPercent = (file.focal_point_y / file.height) * 100;

	return `${xPercent}% ${yPercent}%`;
}
