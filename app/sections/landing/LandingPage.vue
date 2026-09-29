<template>
  <LandingHeader
    :docs-url="docsUrl"
    :locale="locale" />
  <main>
    <LandingIntro
      :post-title="t('hero_sub')"
      :pre-title="t('hero_eyebrow')"
      :title="t('hero_title')">
      <template #badges>
        <LandingPlatformBadge
          title="Web App"
          type="web" />
        <LandingPlatformBadge
          title="Telegram Mini App"
          type="tg" />
      </template>
      <template #actions>
        <LandingActionButton
          :link="appUrl"
          :title="t('login')"
          type="site" />
        <LandingActionButton
          link="https://t.me/msgboard_bot"
          title="@msgboard_bot"
          type="telegram" />
        <div class="hero-quick-links">
          <a :href="laraueUrl('/blog/documentation/laraue-boards')">
            {{ t('documentation') }} &#8594;
          </a>
          <a :href="laraueUrl('/blog/projects/boards')">{{ t('project_description') }} &#8594;</a>
        </div>
      </template>
      <template #visual>
        <div class="hero-visual">
          <!-- Message → AI-cleaned card transformation -->
          <div class="transform-mockup">
            <div class="phone-mockup">
              <div class="phone-screen">
                <div class="phone-statusbar">
                  <span class="phone-time">{{ t('hv_time1') }}</span>
                  <span class="phone-island"></span>
                  <span class="phone-indicators">
                    <svg
                      fill="currentColor"
                      viewBox="0 0 18 12">
                      <rect
                        height="4"
                        rx="1"
                        width="3"
                        x="0"
                        y="8" />
                      <rect
                        height="7"
                        rx="1"
                        width="3"
                        x="5"
                        y="5" />
                      <rect
                        height="10"
                        rx="1"
                        width="3"
                        x="10"
                        y="2" />
                      <rect
                        height="12"
                        rx="1"
                        width="3"
                        x="15"
                        y="0" />
                    </svg>
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 26 12">
                      <rect
                        height="11"
                        rx="3.5"
                        width="22"
                        x="0.5"
                        y="0.5" />
                      <rect
                        fill="currentColor"
                        height="7"
                        rx="1.5"
                        stroke="none"
                        width="16"
                        x="2.5"
                        y="2.5" />
                      <path
                        d="M24.5 4v4"
                        stroke-linecap="round" />
                    </svg>
                  </span>
                </div>
                <div class="phone-status">
                  <svg
                    class="phone-back"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.4"
                    viewBox="0 0 24 24">
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                  <div class="phone-status-avatar"><LandingIcon name="chat" /></div>
                  <div>
                    <div class="phone-status-name">{{ t('hv_chat_title') }}</div>
                    <div class="phone-status-sub">{{ t('hv_chat') }}</div>
                  </div>
                </div>
                <div class="phone-body">
                  <div class="tg-bubble">
                    <div class="tg-bubble-header">
                      <div class="tg-bubble-avatar">{{ t('hv_sender_initials') }}</div>
                      <div class="tg-bubble-name">{{ t('hv_sender') }}</div>
                    </div>
                    <p class="tg-bubble-text">{{ t('hv_msg') }}</p>
                    <span class="tg-bubble-time">{{ t('hv_time1') }}</span>
                  </div>
                  <div class="tg-bubble reply">
                    <div class="tg-bubble-header">
                      <div class="tg-bubble-name">{{ t('hv_replier') }}</div>
                      <div class="tg-bubble-avatar you">{{ t('hv_replier_initials') }}</div>
                    </div>
                    <p class="tg-bubble-text command">{{ t('hv_command') }}</p>
                    <span class="tg-bubble-time">{{ t('hv_time2') }}</span>
                  </div>
                </div>
                <div class="phone-input">
                  <span class="phone-input-field">{{ t('hv_input') }}</span>
                  <span class="phone-input-send">
                    <svg
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        d="M3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            <div class="transform-arrow">
              <svg
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24">
                <path d="M12 4v14M12 18l-5-5M12 18l5-5" />
              </svg>
              <span>{{ t('hv_arrow') }}</span>
            </div>
            <div class="issue-card-mockup">
              <div class="issue-card-row">
                <span class="issue-card-key">{{ t('hv_key') }}</span>
                <span class="issue-card-status">&#9679; {{ t('hv_badge') }}</span>
              </div>
              <p class="issue-card-content">
                <strong>{{ t('hv_title') }}</strong>
                --- {{ t('hv_desc') }}
              </p>
              <div class="issue-card-footer">
                <div class="issue-card-avatar">{{ t('hv_sender_initials') }}</div>
                <span>{{ t('hv_sender') }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </LandingIntro>

    <!-- ══ USE CASES ══ -->
    <LandingSection
      :post-title="t('uc_sub')"
      :pre-title="t('uc_label')"
      :title="t('uc_title')"
      type="alt">
      <div class="use-cases-grid">
        <div class="use-case-card personal reveal">
          <div class="use-case-icon"><LandingIcon name="brain" /></div>
          <div class="use-case-title">{{ t('uc_personal_title') }}</div>
          <p class="use-case-desc">{{ t('uc_personal_desc') }}</p>
          <ul class="use-case-list">
            <li>{{ t('uc_p1') }}</li>
            <li>{{ t('uc_p2') }}</li>
            <li>{{ t('uc_p3') }}</li>
            <li>{{ t('uc_p4') }}</li>
          </ul>
          <a
            class="use-case-link"
            href="https://t.me/msgboard_bot"
            rel="noopener"
            target="_blank">
            {{ t('uc_p_cta') }} &#8594;
          </a>
        </div>
        <div class="use-case-card teams reveal">
          <div class="use-case-icon"><LandingIcon name="partners" /></div>
          <div class="use-case-title">{{ t('uc_teams_title') }}</div>
          <p class="use-case-desc">{{ t('uc_teams_desc') }}</p>
          <ul class="use-case-list">
            <li>{{ t('uc_t1') }}</li>
            <li>{{ t('uc_t2') }}</li>
            <li>{{ t('uc_t3') }}</li>
            <li>{{ t('uc_t4') }}</li>
            <li>{{ t('uc_t5') }}</li>
          </ul>
          <a
            class="use-case-link"
            :href="appUrl">
            {{ t('login') }} &#8594;
          </a>
        </div>
      </div>
    </LandingSection>

    <!-- ══ STRUCTURE ══ -->
    <LandingSection
      :post-title="t('struct_sub')"
      :pre-title="t('struct_label')"
      :title="t('struct_title')"
      type="plain">
      <div class="hierarchy reveal">
        <div class="hierarchy-box">
          <div class="hierarchy-box-label">{{ t('struct_org') }}</div>
          <div class="hierarchy-box-ex">{{ t('struct_org_ex') }}</div>
        </div>
        <div class="hierarchy-arrow">&#8594;</div>
        <div class="hierarchy-box">
          <div class="hierarchy-box-label">{{ t('struct_space') }}</div>
          <div class="hierarchy-box-ex">{{ t('struct_space_ex') }}</div>
        </div>
        <div class="hierarchy-arrow">&#8594;</div>
        <div class="hierarchy-box">
          <div class="hierarchy-box-label">{{ t('struct_board') }}</div>
          <div class="hierarchy-box-ex">{{ t('struct_board_ex') }}</div>
        </div>
        <div class="hierarchy-arrow">&#8594;</div>
        <div class="hierarchy-box highlight">
          <div class="hierarchy-box-label">{{ t('struct_issue') }}</div>
          <div class="hierarchy-box-ex">{{ t('struct_issue_ex') }}</div>
        </div>
      </div>
      <div class="structure-points">
        <div class="structure-point reveal">
          <div class="structure-point-title">{{ t('struct_p1t') }}</div>
          <p class="structure-point-desc">{{ t('struct_p1d') }}</p>
        </div>
        <div class="structure-point reveal">
          <div class="structure-point-title">{{ t('struct_p2t') }}</div>
          <p class="structure-point-desc">{{ t('struct_p2d') }}</p>
        </div>
        <div class="structure-point reveal">
          <div class="structure-point-title">{{ t('struct_p3t') }}</div>
          <p class="structure-point-desc">{{ t('struct_p3d') }}</p>
        </div>
      </div>
    </LandingSection>

    <!-- ══ MID-PAGE CTA ══ -->
    <LandingCallToAction
      :post-title="t('cta2_sub')"
      :pre-title="t('cta2_label')"
      :title="t('cta2_title')">
      <LandingActionButton
        :link="appUrl"
        :title="t('login')"
        type="site" />
      <LandingActionButton
        link="https://t.me/msgboard_bot"
        title="@msgboard_bot"
        type="telegram" />
    </LandingCallToAction>

    <!-- ══ FEATURES ══ -->
    <LandingFeaturesGrid
      id="features"
      :features="[
        {
          title: t('f1t'),
          icon: 'board',
          description: t('f1d'),
          link: laraueUrl('/blog/documentation/laraue-boards/getting-started/quick-start'),
        },
        {
          title: t('f2t'),
          icon: 'mail',
          description: t('f2d'),
          link: laraueUrl('/blog/documentation/laraue-boards/working-alone/telegram-messages'),
        },
        {
          title: t('f3t'),
          icon: 'camera',
          description: t('f3d'),
          link: laraueUrl('/blog/documentation/laraue-boards/features/media'),
        },
        {
          title: t('f4t'),
          icon: 'edit',
          description: t('f4d'),
          link: laraueUrl('/blog/documentation/laraue-boards/integrations/telegram-save-modes'),
        },
        {
          title: t('f5t'),
          icon: 'tag',
          description: t('f5d'),
          link: laraueUrl('/blog/documentation/laraue-boards/features/card-keys'),
        },
        {
          title: t('f6t'),
          icon: 'gear',
          description: t('f6d'),
          link: laraueUrl('/blog/documentation/laraue-boards/features/attributes'),
        },
        {
          title: t('f7t'),
          icon: 'partners',
          description: t('f7d'),
          link: laraueUrl('/blog/documentation/laraue-boards/concepts/organizations'),
        },
        {
          title: t('f8t'),
          icon: 'lock',
          description: t('f8d'),
          link: laraueUrl('/blog/documentation/laraue-boards/getting-started/authorization'),
        },
        {
          title: t('f9t'),
          icon: 'code',
          description: t('f9d'),
          link: 'https://github.com/win7user10/Laraue.Apps.Boards',
        },
        {
          title: t('f10t'),
          icon: 'sparkle',
          description: t('f10d'),
          link: laraueUrl('/blog/documentation/laraue-boards/integrations/telegram-save-modes'),
        },
        {
          title: t('f11t'),
          icon: 'search',
          description: t('f11d'),
          link: laraueUrl('/blog/documentation/laraue-boards/features/search'),
        },
      ]"
      :post-title="t('feat_sub')"
      :pre-title="t('feat_label')"
      :title="t('feat_title')" />

    <!-- ══ PLATFORMS ══ -->
    <LandingSection
      :post-title="t('pl_sub')"
      :pre-title="t('pl_label')"
      :title="t('pl_title')"
      type="alt">
      <div class="platforms-grid">
        <div class="platform-card reveal">
          <div class="platform-card-header">
            <div class="platform-card-icon web"><LandingIcon name="globe" /></div>
            <div>
              <div class="platform-card-name">{{ t('web_name') }}</div>
              <div class="platform-card-tag">boards.laraue.com</div>
            </div>
          </div>
          <p class="platform-card-desc">{{ t('web_desc') }}</p>
          <ul class="platform-card-features">
            <li>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ t('web_f1') }}</span>
            </li>
            <li>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ t('web_f2') }}</span>
            </li>
            <li>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ t('web_f3') }}</span>
            </li>
            <li>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ t('web_f4') }}</span>
            </li>
          </ul>
          <a
            class="platform-card-link web"
            :href="appUrl"
            style="align-self: flex-start">
            {{ t('open_webapp') }} &#8594;
          </a>
        </div>

        <div class="platform-card reveal">
          <div class="platform-card-header">
            <div class="platform-card-icon tg"><LandingIcon name="chat" /></div>
            <div>
              <div class="platform-card-name">{{ t('tg_name') }}</div>
              <div class="platform-card-tag">@msgboard_bot</div>
            </div>
          </div>
          <p class="platform-card-desc">{{ t('tg_desc') }}</p>
          <ul class="platform-card-features">
            <li>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ t('tg_f1') }}</span>
            </li>
            <li>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ t('tg_f2') }}</span>
            </li>
            <li>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ t('tg_f3') }}</span>
            </li>
            <li>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ t('tg_f4') }}</span>
            </li>
          </ul>
          <a
            class="platform-card-link tg"
            href="https://t.me/msgboard_bot"
            rel="noopener"
            style="align-self: flex-start"
            target="_blank">
            @msgboard_bot &#8594;
          </a>
        </div>

        <div class="platform-card reveal">
          <div class="platform-card-header">
            <div class="platform-card-icon mcp"><LandingIcon name="sparkle" /></div>
            <div>
              <div class="platform-card-name">{{ t('mcp_name') }}</div>
              <div class="platform-card-tag">{{ t('mcp_tag') }}</div>
            </div>
          </div>
          <p class="platform-card-desc">{{ t('mcp_desc') }}</p>
          <ul class="platform-card-features">
            <li>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ t('mcp_f1') }}</span>
            </li>
            <li>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ t('mcp_f2') }}</span>
            </li>
            <li>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ t('mcp_f3') }}</span>
            </li>
            <li>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ t('mcp_f4') }}</span>
            </li>
          </ul>
          <a
            class="platform-card-link mcp"
            :href="appUrl"
            style="align-self: flex-start">
            {{ t('mcp_cta') }} &#8594;
          </a>
        </div>
      </div>
    </LandingSection>

    <!-- ══ PRICING ══ -->
    <LandingPricing
      id="pricing"
      v-model:currency="currency"
      :cta-href="appUrl"
      :locale="locale"
      :post-title="t('pricing_sub')"
      :pre-title="t('pricing_label')"
      :tariffs="tariffs"
      :title="t('pricing_title')" />

    <!-- ══ OPEN SOURCE / BUILT IN THE OPEN ══ -->
    <LandingSection
      :post-title="t('os_sub')"
      :pre-title="t('os_label')"
      :title="t('os_title')"
      type="alt">
      <div class="use-cases-grid">
        <div class="use-case-card teams reveal">
          <div class="use-case-icon"><LandingIcon name="code" /></div>
          <div class="use-case-title">{{ t('os_code_title') }}</div>
          <p class="use-case-desc">{{ t('os_code_desc') }}</p>
          <ul class="use-case-list">
            <li>Laraue.Apps.Boards — .NET 10 / C#, PostgreSQL 18</li>
            <li>laraue-boards — Nuxt 4, Vue 3, TypeScript</li>
          </ul>
          <a
            class="use-case-link"
            href="https://github.com/win7user10/Laraue.Apps.Boards"
            rel="noopener"
            target="_blank">
            {{ t('os_code_cta') }} &#8594;
          </a>
        </div>
        <div class="use-case-card personal reveal">
          <div class="use-case-icon"><LandingIcon name="book" /></div>
          <div class="use-case-title">{{ t('os_devlog_title') }}</div>
          <p class="use-case-desc">{{ t('os_devlog_desc') }}</p>
          <a
            class="use-case-link"
            :href="laraueUrl('/blog/articles/building-jira-alternative-solo-why-and-repositories')">
            {{ t('os_devlog_cta') }} &#8594;
          </a>
        </div>
      </div>
      <p class="pricing-note reveal">{{ t('pr_note') }}</p>
    </LandingSection>

    <!-- ══ FAQ ══ -->
    <section
      id="faq"
      class="faq">
      <div class="faq-inner">
        <div class="section-label reveal">{{ t('faq_label') }}</div>
        <h2 class="section-title reveal">{{ t('faq_title') }}</h2>
        <div class="faq-list">
          <div
            v-for="(item, index) in faqItems"
            :key="index"
            class="faq-item reveal"
            :data-open="openFaq === index ? 'true' : null">
            <button
              :aria-controls="`faq-answer-${index}`"
              :aria-expanded="openFaq === index"
              class="faq-summary"
              type="button"
              @click="toggleFaq(index)">
              {{ item.q }}
            </button>
            <div class="faq-answer-wrap">
              <div class="faq-answer-inner">
                <p :id="`faq-answer-${index}`">{{ item.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ CTA ══ -->
    <LandingCallToAction
      :post-title="t('cta_sub')"
      :pre-title="t('cta_label')"
      :title="t('cta_title')">
      <LandingActionButton
        :link="appUrl"
        :title="t('login')"
        type="site" />
      <LandingActionButton
        link="https://t.me/msgboard_bot"
        title="@msgboard_bot"
        type="telegram" />
    </LandingCallToAction>
  </main>
  <LandingFooter
    :docs-url="docsUrl"
    :locale="locale"
    :privacy-url="laraueUrl('/privacy')" />
</template>

<script setup lang="ts">
import LandingActionButton from './components/LandingActionButton.vue'
import LandingCallToAction from './components/LandingCallToAction.vue'
import LandingFeaturesGrid from './components/LandingFeaturesGrid.vue'
import LandingFooter from './components/LandingFooter.vue'
import LandingHeader from './components/LandingHeader.vue'
import LandingIcon from './components/LandingIcon.vue'
import LandingIntro from './components/LandingIntro.vue'
import LandingPlatformBadge from './components/LandingPlatformBadge.vue'
import LandingPricing from './components/LandingPricing.vue'
import LandingSection from './components/LandingSection.vue'
import type { LandingPageDeps } from './LandingPage.deps'
import type { LandingLocale, LandingMessageKey } from './LandingPage.messages'
import type { LandingCurrency } from './LandingPage.types'
import { useLandingSeo } from './useLandingSeo'
import { useLandingText } from './useLandingText'

const props = defineProps<{ deps: LandingPageDeps; locale: LandingLocale }>()

const t = useLandingText(props.locale)

// The web app lives on the same host; /organizations sends signed-out users to /login.
const appUrl = '/organizations'
const laraueOrigin = 'https://laraue.com'
// Documentation and the blog stay on laraue.com until they move (BRD-241).
const laraueUrl = (path: string): string =>
  `${laraueOrigin}${props.locale === 'ru' ? '/ru' : ''}${path}`
const docsUrl = laraueUrl('/blog/documentation/laraue-boards')

const openFaq = ref<number>()
const toggleFaq = (index: number): void => {
  openFaq.value = openFaq.value === index ? undefined : index
}
const faqItems = Array.from({ length: 11 }, (_, index) => ({
  a: t(`faq${index + 1}a` as LandingMessageKey),
  q: t(`faq${index + 1}q` as LandingMessageKey),
}))

// Prices are loaded on the server for the first render (so they are in the HTML search engines see)
// and again in the browser when the visitor switches the currency.
const currency = ref<LandingCurrency>('USD')
const { data: tariffs } = await useQuery(
  () => `landing-tariffs-${currency.value}`,
  () => props.deps.getTariffs(currency.value),
  { watch: [currency] },
)

useLandingSeo(
  props.locale,
  t,
  faqItems.map((item) => ({ answer: item.a, question: item.q })),
  tariffs.value,
)
</script>

<style scoped>
.hero-quick-links {
  animation: fade-up var(--anim-duration-lg) calc(var(--anim-stagger) * 4) var(--anim-ease) both;
  display: flex;
  flex-basis: 100%;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 6px;
  opacity: 0;
}

.hero-quick-links a {
  color: var(--color-muted);
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color var(--duration-base);
}

.hero-quick-links a:hover {
  color: var(--color-text);
}

/* Hero: Telegram message -> issue card */
.transform-mockup {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 360px;
}

.phone-mockup {
  background: #1a1a1d;
  border-radius: 44px;
  box-shadow:
    var(--shadow-popover),
    inset 0 0 0 2px #3a3a3f;
  flex-shrink: 0;
  padding: 8px;
  width: 270px;
}

.phone-screen {
  background: var(--color-workspace);
  border-radius: 36px;
  overflow: hidden;
}

.phone-statusbar {
  align-items: center;
  background: var(--color-surface);
  display: flex;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  justify-content: space-between;
  padding: 10px 20px 4px;
}

.phone-island {
  background: #1a1a1d;
  border-radius: var(--radius-pill);
  height: 18px;
  width: 64px;
}

.phone-indicators {
  align-items: center;
  display: flex;
  gap: 5px;
}

.phone-indicators svg:first-child {
  height: 9px;
  width: 13px;
}

.phone-indicators svg:last-child {
  height: 10px;
  width: 20px;
}

.phone-status {
  align-items: center;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  gap: 8px;
  padding: 8px 14px 10px 10px;
}

.phone-back {
  color: var(--color-accent);
  flex-shrink: 0;
  height: 20px;
  width: 20px;
}

.phone-status-avatar {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: 50%;
  color: var(--color-accent);
  display: flex;
  flex-shrink: 0;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.phone-status-avatar :deep(.landing-icon) {
  height: 18px;
  width: 18px;
}

.phone-status-name {
  font-size: 13px;
  font-weight: var(--font-weight-bold);
}

.phone-status-sub {
  color: var(--color-muted);
  font-size: 10px;
}

.phone-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 190px;
  padding: 14px 12px;
}

.phone-input {
  align-items: center;
  background: var(--color-surface);
  border-top: 1px solid var(--color-divider);
  display: flex;
  gap: 8px;
  padding: 8px 12px 14px;
}

.phone-input-field {
  align-items: center;
  background: var(--color-soft);
  border-radius: var(--radius-pill);
  color: var(--color-muted);
  display: flex;
  flex: 1;
  font-size: 12px;
  height: 28px;
  padding: 0 12px;
}

.phone-input-send {
  align-items: center;
  background: var(--color-accent);
  border-radius: 50%;
  color: #fff;
  display: flex;
  height: 28px;
  justify-content: center;
  width: 28px;
}

.phone-input-send svg {
  height: 14px;
  width: 14px;
}

.tg-bubble {
  align-self: flex-start;
  animation: msg-reveal var(--anim-demo-duration) var(--anim-demo-step) var(--anim-ease) forwards;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px 12px 12px;
  max-width: 88%;
  opacity: 0;
  padding: 9px 12px;
  width: fit-content;
}

.tg-bubble-header {
  align-items: center;
  display: flex;
  gap: 6px;
  margin-bottom: 5px;
}

.tg-bubble-avatar {
  align-items: center;
  background: var(--color-accent);
  border-radius: 50%;
  color: #fff;
  display: flex;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: var(--font-weight-bold);
  height: 18px;
  justify-content: center;
  width: 18px;
}

.tg-bubble-name {
  font-size: 11px;
  font-weight: var(--font-weight-bold);
}

.tg-bubble-text {
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}

.tg-bubble-text.command {
  color: var(--color-accent);
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-semibold);
}

.tg-bubble-time {
  color: var(--color-muted);
  display: block;
  font-size: 9px;
  margin-top: 3px;
  text-align: right;
}

.tg-bubble.reply {
  align-self: flex-end;
  animation-delay: calc(var(--anim-demo-step) * 2);
  background: var(--color-accent-soft);
  border-color: transparent;
  border-radius: 12px 4px 12px 12px;
}

.tg-bubble.reply .tg-bubble-header {
  flex-direction: row-reverse;
}

.transform-arrow {
  align-items: flex-start;
  animation:
    msg-reveal var(--anim-demo-duration) calc(var(--anim-demo-step) * 3) var(--anim-ease) forwards,
    pulse-arrow var(--anim-pulse-duration)
      calc(var(--anim-demo-step) * 3 + var(--anim-demo-duration)) ease-in-out infinite;
  color: var(--color-muted);
  display: flex;
  gap: 8px;
  opacity: 0;
  width: 260px;
}

.transform-arrow svg {
  color: var(--color-accent);
  flex-shrink: 0;
  height: 18px;
  margin-top: 1px;
  width: 18px;
}

.transform-arrow span {
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  line-height: 1.5;
}

.issue-card-mockup {
  animation: msg-reveal var(--anim-demo-duration) calc(var(--anim-demo-step) * 4) var(--anim-ease)
    forwards;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-popover);
  opacity: 0;
  padding: 14px 16px;
  width: 260px;
}

.issue-card-row {
  align-items: center;
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.issue-card-key {
  color: var(--color-accent);
  font-family: var(--font-family-mono);
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
}

.issue-card-status {
  align-items: center;
  background: var(--color-soft);
  border-radius: var(--radius-pill);
  color: var(--color-muted);
  display: flex;
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  gap: 5px;
  margin-left: auto;
  padding: 3px 9px;
}

.issue-card-content {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  font-size: 13px;
  -webkit-line-clamp: 2;
  line-height: 1.5;
  margin: 0 0 12px;
  overflow: hidden;
}

.issue-card-footer {
  align-items: center;
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.issue-card-avatar {
  align-items: center;
  background: var(--color-accent);
  border-radius: 50%;
  color: #fff;
  display: flex;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: var(--font-weight-bold);
  height: 18px;
  justify-content: center;
  width: 18px;
}

.issue-card-footer span {
  color: var(--color-muted);
  font-size: 11px;
}

@media (width <= 720px) {
  .transform-mockup {
    max-width: none;
  }
}

/* Cards shared by use cases, platforms, hierarchy and FAQ */
.use-case-card,
.platform-card,
.hierarchy-box,
.faq-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-card);
}

.use-case-card,
.platform-card {
  transition:
    box-shadow var(--duration-base),
    transform var(--duration-base);
}

.use-case-card:hover,
.platform-card:hover {
  box-shadow: var(--shadow-popover);
  transform: translateY(-3px);
}

/* Use cases */
.use-cases-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr 1fr;
  margin-top: 48px;
}

.use-cases-grid .use-case-card:nth-child(2) {
  animation-delay: var(--anim-stagger);
}

.use-case-card {
  padding: 36px 36px 32px;
}

.use-case-icon,
.platform-card-icon {
  align-items: center;
  background: var(--color-accent-soft);
  border-radius: var(--radius-card);
  color: var(--color-accent);
  display: flex;
  justify-content: center;
}

.use-case-icon {
  height: 44px;
  margin-bottom: 16px;
  width: 44px;
}

.use-case-icon :deep(.landing-icon) {
  height: 22px;
  width: 22px;
}

.use-case-title {
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  margin-bottom: 10px;
}

.use-case-desc {
  color: var(--color-muted);
  font-size: 15px;
  line-height: 1.65;
  margin-bottom: 24px;
}

.use-case-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 28px;
}

.use-case-list li {
  align-items: flex-start;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-body);
  gap: 10px;
  line-height: 1.4;
}

.use-case-list li::before {
  color: var(--color-accent);
  content: '✓';
  flex-shrink: 0;
  font-weight: var(--font-weight-bold);
  margin-top: 1px;
}

.use-case-link,
.platform-card-link {
  align-items: center;
  color: var(--color-accent);
  display: inline-flex;
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  gap: 6px;
  text-decoration: none;
  transition: gap 0.15s;
}

.use-case-card:hover .use-case-link,
.platform-card-link:hover {
  gap: 10px;
}

/* Structure */
.hierarchy {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 48px;
}

.hierarchy-box {
  border-radius: var(--radius-card);
  flex: 1;
  min-width: 140px;
  padding: 16px 20px;
}

.hierarchy-box.highlight {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
}

.hierarchy-box-label {
  color: var(--color-accent);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.hierarchy-box-ex {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
}

.hierarchy-arrow {
  color: var(--color-muted);
  flex-shrink: 0;
  font-size: 18px;
}

.structure-points {
  display: grid;
  gap: 28px;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 44px;
}

.structure-point-title {
  font-size: 16px;
  font-weight: var(--font-weight-bold);
  margin-bottom: 8px;
}

.structure-point-desc {
  color: var(--color-muted);
  font-size: var(--font-size-body);
  line-height: 1.65;
}

@media (width <= 900px) {
  .structure-points {
    grid-template-columns: 1fr;
  }
}

@media (width <= 720px) {
  .hierarchy {
    align-items: stretch;
    flex-direction: column;
  }

  .hierarchy-arrow {
    text-align: center;
    transform: rotate(90deg);
  }
}

/* Platforms */
.platforms-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 48px;
}

.platforms-grid .platform-card:nth-child(2) {
  animation-delay: var(--anim-stagger);
}

.platforms-grid .platform-card:nth-child(3) {
  animation-delay: calc(var(--anim-stagger) * 2);
}

.platform-card {
  display: flex;
  flex-direction: column;
  padding: 32px;
}

.platform-card-header {
  align-items: center;
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}

.platform-card-icon {
  flex-shrink: 0;
  height: 48px;
  width: 48px;
}

.platform-card-icon :deep(.landing-icon) {
  height: 24px;
  width: 24px;
}

.platform-card-name {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
}

.platform-card-tag {
  color: var(--color-muted);
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.06em;
  margin-top: 2px;
  text-transform: uppercase;
}

.platform-card-desc {
  color: var(--color-muted);
  flex: 1;
  font-size: 15px;
  line-height: 1.65;
  margin-bottom: 24px;
}

.platform-card-features {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 28px;
}

.platform-card-features li {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: 13px;
  gap: 8px;
}

.platform-card-features li svg {
  flex-shrink: 0;
  height: 14px;
  stroke: var(--color-accent);
  width: 14px;
}

/* Open source */
.pricing-note {
  color: var(--color-muted);
  font-size: var(--font-size-body);
  margin-top: 36px;
  text-align: center;
}

/* FAQ */
.faq {
  background: var(--color-workspace);
  border-bottom: 1px solid var(--color-divider);
  padding: 88px 60px;
}

.faq-inner {
  margin: 0 auto;
  max-width: 820px;
}

.section-label {
  align-items: center;
  color: var(--color-accent);
  display: flex;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  gap: 8px;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.section-label::after {
  background: var(--color-accent);
  content: '';
  flex: 1;
  height: 1px;
  max-width: 40px;
  opacity: 0.5;
}

.section-title {
  font-size: clamp(26px, 3vw, 40px);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 16px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 40px;
}

.faq-item {
  border-radius: var(--radius-card);
  padding: 20px 24px;
}

.faq-summary {
  align-items: center;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  gap: 12px;
  justify-content: space-between;
  margin: 0;
  padding: 0;
  text-align: left;
  width: 100%;
}

.faq-summary::after {
  color: var(--color-muted);
  content: '+';
  flex-shrink: 0;
  font-size: 20px;
  font-weight: 400;
  transition: transform var(--anim-duration) var(--anim-ease);
}

.faq-item[data-open='true'] .faq-summary::after {
  transform: rotate(45deg);
}

.faq-answer-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--anim-duration) var(--anim-ease);
}

.faq-item[data-open='true'] .faq-answer-wrap {
  grid-template-rows: 1fr;
}

.faq-answer-inner {
  overflow: hidden;
}

.faq-item p {
  color: var(--color-muted);
  font-size: 15px;
  line-height: 1.7;
  margin-top: 14px;
}

@media (width <= 900px) {
  .use-cases-grid,
  .platforms-grid {
    grid-template-columns: 1fr;
  }
}

@media (width <= 720px) {
  .faq {
    padding: 60px 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-quick-links {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes msg-reveal {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-arrow {
  0%,
  100% {
    opacity: 0.55;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(2px);
  }
}
</style>
