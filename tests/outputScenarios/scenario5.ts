import {ChevronDown as IconChevronDown, ChevronUp as IconChevronUp} from '@vicons/tabler';
import {getThemeSnippetList} from '@/components/snippets/themeSnippetList';
import {HelpFilled as IconHelpFilled} from '@vicons/material';
import {mdiChevronDown, mdiChevronRight, mdiHome} from '@mdi/js';
import {
	NButton,
	NIcon,
	NPopover
} from 'naive-ui';
import {productGetters} from '@/composables/getters/productGetters';
import {ProductQueryIdentifier} from '@library/types';
import {SystemEvents} from '@/helpers/SystemEvents';
import {useHead, useLayout, useNuxtApp, useRoute} from '#imports';
import truckGraySvg from '@/assets/icons/truck_gray.svg';
import type {IBadge, IVariant} from '@library/types';
