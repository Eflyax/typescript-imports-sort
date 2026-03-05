<template>
	<!-- Single attribute → one line -->
	<n-layout-content content-style="padding: 24px;">
		<!-- Multiple attributes → multi-line, sorted by category -->
		<MyComponent
			@click="handleClick"
			class="my-class"
			v-if="condition"
			:key="item.id"
			v-for="item in items"
			style="color: red"
			id="main"
			ref="myRef"
			v-model="value"
			v-tooltip="'hello'"
			v-focus
			v-html="rawHtml"
		/>

		<!-- :is → DEFINITION (1), colon prefix ignored in alpha sort -->
		<component
			v-if="activeView === EView.A"
			:company-code="activeCompany"
			:is="ActiveComponent"
		/>

		<!-- OTHER_ATTR: colon ignored in alpha sort → :align before class before :wrap -->
		<n-flex
			:wrap="true"
			class="details"
			:align="center"
		/>

		<!-- Events sorted by name -->
		<base-input
			@update:value="onUpdate"
			v-model:value="search"
			@blur="onBlur"
			:placeholder="$t('Search')"
			class="search"
		/>
	</n-layout-content>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import type {Component} from 'vue';
</script>
