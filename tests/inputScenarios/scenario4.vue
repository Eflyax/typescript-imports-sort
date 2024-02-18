<script lang="ts" setup>
import type {IAgent} from '@/types';
import {Icon} from '@iconify/vue';
import {NButton,NDropdown, NTooltip} from 'naive-ui';
import type {IClient} from '@/types';
import {reactive, computed, onMounted} from 'vue';
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
