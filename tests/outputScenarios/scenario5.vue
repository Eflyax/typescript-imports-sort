<template>
	<!-- Single attribute → one line -->
	<n-layout-content content-style="padding: 24px;">
		<!-- Multiple attributes → multi-line, sorted by category -->
		<MyComponent
			v-for="item in items"
			v-if="condition"
			id="main"
			:key="item.id"
			ref="myRef"
			v-model="value"
			v-focus
			v-tooltip="'hello'"
			class="my-class"
			style="color: red"
			@click="handleClick"
			v-html="rawHtml"
		/>

		<!-- :is → DEFINITION (1), colon prefix ignored in alpha sort -->
		<component
			:is="ActiveComponent"
			v-if="activeView === EView.A"
			:company-code="activeCompany"
		/>

		<!-- OTHER_ATTR: colon ignored in alpha sort → :align before class before :wrap -->
		<n-flex
			:align="center"
			class="details"
			:wrap="true"
		/>

		<!-- Events sorted by name -->
		<base-input
			v-model:value="search"
			class="search"
			:placeholder="$t('Search')"
			@update:value="onUpdate"
			@blur="onBlur"
		/>
	</n-layout-content>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import type {Component} from 'vue';
</script>
