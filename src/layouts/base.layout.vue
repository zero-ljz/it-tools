<script lang="ts" setup>
import { NIcon, useThemeVars } from 'naive-ui';

import { RouterLink } from 'vue-router';
import { Home2, Menu2 } from '@vicons/tabler';

import { storeToRefs } from 'pinia';
import HeroGradient from '../assets/hero-gradient.svg?component';
import MenuLayout from '../components/MenuLayout.vue';
import NavbarButtons from '../components/NavbarButtons.vue';
import { useStyleStore } from '@/stores/style.store';
import { config } from '@/config';
import type { ToolCategory } from '@/tools/tools.types';
import { useToolStore } from '@/tools/tools.store';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';

const themeVars = useThemeVars();
const styleStore = useStyleStore();
const version = config.app.version;
const commitSha = config.app.lastCommitSha.slice(0, 7);
const repositoryUrl = 'https://github.com/zero-ljz/it-tools';
const sourceUrl = `${repositoryUrl}/tree/${commitSha || 'main'}`;
const isDevelopment = import.meta.env.DEV;
const { t } = useI18n();

const toolStore = useToolStore();
const { favoriteTools, toolsByCategory } = storeToRefs(toolStore);

const tools = computed<ToolCategory[]>(() => [
  ...(favoriteTools.value.length > 0 ? [{ name: t('tools.categories.favorite-tools'), components: favoriteTools.value }] : []),
  ...toolsByCategory.value,
]);
</script>

<template>
  <MenuLayout class="menu-layout" :class="{ isSmallScreen: styleStore.isSmallScreen }">
    <template #sider>
      <RouterLink to="/" class="hero-wrapper">
        <HeroGradient class="gradient" />
        <div class="text-wrapper">
          <div class="title">
            {{ $t('app.name', 'IT - TOOLS') }}
          </div>
          <div class="divider" />
          <div class="subtitle">
            {{ $t('home.subtitle') }}
          </div>
        </div>
      </RouterLink>

      <div class="sider-content">
        <div v-if="styleStore.isSmallScreen" flex flex-col items-center>
          <locale-selector w="90%" />

          <div flex justify-center>
            <NavbarButtons />
          </div>
        </div>

        <CollapsibleToolMenu :tools-by-category="tools" />

        <div class="footer">
          <div>
            {{ $t('app.name', 'My App') }}

            <c-link target="_blank" rel="noopener" :href="sourceUrl">
              v{{ version }}
            </c-link>

            <template v-if="commitSha && commitSha.length > 0">
              -
              <c-link
                target="_blank"
                rel="noopener"
                type="primary"
                :href="sourceUrl"
              >
                {{ commitSha }}
              </c-link>
            </template>
          </div>
          <div>Based on IT-Tools by Corentin Thomasset</div>
          <small class="modification-info">
            Modified version / 修改版本 (2026) ·
            <a target="_blank" rel="noopener" :href="sourceUrl">Source / 源码</a> ·
            <a target="_blank" rel="noopener" :href="`${repositoryUrl}/blob/main/LICENSE`">GPLv3</a>
          </small>
          <small class="filing-info">
            <a target="_blank" rel="noopener" href="https://beian.miit.gov.cn/">湘ICP备2023012254号-1</a>
            <br>
            <a
              target="_blank"
              rel="noopener"
              href="https://beian.mps.gov.cn/#/query/webSearch?code=43012102000907"
            >
              <img
                alt=""
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAABjFBMVEVHcEzoxWzs04visWL++9725r7dpFXitWH89t337Lr52Ifov3f25qPcsX7gqlb06Zzu46rewXLlvHCdaFjvvl/crGrgvov387jz6ZLt3oDkvFnTk3DKhFvZr4LDfz7oxnzv2X//+dD/74ati3q0lH7Rrnbou1Doulr/1ljVPCLqv1fuzGbVHhjbSScFAWMAAXgBAW3ryFzksVHWj0nSBQnlmDpzd4Dpx2PdmEbrsEnw13TrwWDdn0U8GTzVazK5kVqYeljIIhDMAALKPSO9BA79xU3UxXXrXyNtf4/90GjqcDKRinm+TiUABn756XDepEz1x1f74mzVkjzThT3TLhyrq4LjrUr8lzlRNlHdhDX1fy6ZXzNdXG9NB0TXYTHQFg3XdTjyy27pgj69qXHekET/ulXBvIN0Y2HPuX+clYT2qjwZN5DuvlDx02nYnljNrFJWTm/JWSrZAAZgHlCxDg79KwoAG45pAjaEj5n9LRTEazOBWDqEaUriqVfbbTc2Gk2njVnOeDq1gD8ACJEMcLh/AAAAJnRSTlMA7JHrCGHK/hxBusIqreg9f/XQ+dLgnAKr4fQUXUic++xMvtHLbxvU4Y4AAAFpSURBVBjTY2CAAA5WFWVWDnEGJMDJKxxdXeMgzKuIEGOxt42ucvdiD7W1Z4GJcXBHOESZaOqahIdGcEFFeQTrY6J0dEJ04108zeoZecCC/N6+De4mIfHxmk7uaQbeYEEOEW/9Jt0iHU1NHSdNNwMzJZAbVLMyfe2jTAqDtFLivdwMMjUEgCrFTDOa0119nO0S6owD0/XTssSAKkUjE7MNfJJ0neM0veL0sq1MRYEq+RpTPfRLSuN8EpIqXQw8XIOBguK8Np4ZZbEljo6Ous7l+hme6kxAQe6UWs8KAz292GI9A30zDfYwbnEGcfk8Y9PEDAeP5PyYAjNtUwsjBaCZrOr+xnYBGhqulhp+GpHGRoacINezSmkFB2mrG6lr51oYazNyQsJN1NBQXcvQWlvLRt3KnI8fHKhcflbsRuph1moW/urq5n4SkNBkklILyLFUs9QKUDOXFICGvri0jBwbGx8zGzeTLFgIAGesR4U7iOtUAAAAAElFTkSuQmCC"
              >
              湘公网安备 43012102000907号
            </a>
          </small>
        </div>
      </div>
    </template>

    <template #content>
      <div flex items-center justify-center gap-2>
        <c-button
          circle
          variant="text"
          :aria-label="$t('home.toggleMenu')"
          @click="styleStore.isMenuCollapsed = !styleStore.isMenuCollapsed"
        >
          <NIcon size="25" :component="Menu2" />
        </c-button>

        <c-tooltip :tooltip="$t('home.home')" position="bottom">
          <c-button to="/" circle variant="text" :aria-label="$t('home.home')">
            <NIcon size="25" :component="Home2" />
          </c-button>
        </c-tooltip>

        <c-tooltip :tooltip="$t('home.uiLib')" position="bottom">
          <c-button v-if="isDevelopment" to="/c-lib" circle variant="text" :aria-label="$t('home.uiLib')">
            <icon-mdi:brush-variant text-20px />
          </c-button>
        </c-tooltip>

        <command-palette />

        <locale-selector v-if="!styleStore.isSmallScreen" />

        <div>
          <NavbarButtons v-if="!styleStore.isSmallScreen" />
        </div>
      </div>
      <slot />
    </template>
  </MenuLayout>
</template>

<style lang="less" scoped>
// ::v-deep(.n-layout-scroll-container) {
//     @percent: 4%;
//     @position: 25px;
//     @size: 50px;
//     @color: #eeeeee25;
//     background-image: radial-gradient(@color @percent, transparent @percent),
//         radial-gradient(@color @percent, transparent @percent);
//     background-position: 0 0, @position @position;
//     background-size: @size @size;
// }

.footer {
  text-align: center;
  color: #838587;
  margin-top: 20px;
  padding: 20px 0;
}

.modification-info {
  display: block;
  margin-top: 4px;

  a {
    color: inherit;
  }
}

.filing-info {
  display: block;
  margin-top: 8px;
  line-height: 1.8;

  a {
    color: inherit;
    text-decoration: none;
  }

  img {
    margin: 0;
    vertical-align: middle;
  }
}

.sider-content {
  padding-top: 160px;
  padding-bottom: 200px;
}

.hero-wrapper {
  position: absolute;
  display: block;
  left: 0;
  width: 100%;
  z-index: 10;
  overflow: hidden;

  .gradient {
    margin-top: -65px;
  }

  .text-wrapper {
    position: absolute;
    left: 0;
    width: 100%;
    text-align: center;
    top: 16px;
    color: #fff;

    .title {
      font-size: 25px;
      font-weight: 600;
    }

    .divider {
      width: 50px;
      height: 2px;
      border-radius: 4px;
      background-color: v-bind('themeVars.primaryColor');
      margin: 0 auto 5px;
    }

    .subtitle {
      font-size: 16px;
    }
  }
}
</style>
