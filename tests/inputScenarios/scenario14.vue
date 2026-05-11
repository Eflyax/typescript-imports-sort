<template>
	<!-- Multi-line tag with inline text content: expand -->
	<div class="actions">
		<n-button
			type="primary"
			:loading="isSaving"
			:test-id="`${testId}-save-btn`"
			@click="save()"
		>{{ $t('Save') }}</n-button>

		<!-- Single-line tag with attribute and inline text content: expand -->
		<h3 class="area-title">{{ $t(area.label) }}</h3>

		<!-- Single attribute + inline content: expand -->
		<n-button type="warning">{{ $t('Delete') }}</n-button>

		<!-- Already expanded: leave unchanged -->
		<n-button
			type="default"
			@click="cancel()"
		>
			{{ $t('Cancel') }}
		</n-button>

		<!-- No attributes: leave unchanged -->
		<strong>bold text</strong>
	</div>
</template>
