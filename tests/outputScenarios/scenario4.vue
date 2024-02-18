<script lang="ts" setup>
import {computed, onMounted, reactive} from 'vue';
import {Icon} from '@iconify/vue';
import {
	NButton,
	NDropdown,
	NTooltip
} from 'naive-ui';
import type {IAgent, IClient} from '@/types';
import type {PropType} from 'vue';

const
	props = defineProps({
		someObject: {
			type: Object,
			default: null
		},
	});

onMounted(async() => {
	// some code
});

</script>

<template>
	<div id="scenario4">
	</div>
</template>
