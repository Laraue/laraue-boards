<template>
  <LandingHeader
    :docs-url="docsUrl"
    :locale="locale" />
  <main>
      <LandingIntro
          :pre-title="t('hero_eyebrow')"
          :title="t('hero_title')"
          :post-title="t('hero_sub')">
        <template #badges>
          <LandingPlatformBadge type="web" title="Web App" />
          <LandingPlatformBadge type="tg" title="Telegram Mini App" />
        </template>
        <template #actions>
          <LandingActionButton :title="t('login')" :link="appUrl" type="site" />
          <LandingActionButton title="@msgboard_bot" link="https://t.me/msgboard_bot" type="telegram" />
          <div class="hero-quick-links">
            <a :href="laraueUrl('/blog/documentation/laraue-boards')">{{ t('documentation') }} &#8594;</a>
            <a :href="laraueUrl('/blog/projects/boards')">{{ t('project_description') }} &#8594;</a>
          </div>
        </template>
        <template #background>
          <div class="hero-bg-glow"></div>
        </template>
        <template #visual>
          <div class="hero-visual">
            <!-- Message → AI-cleaned card transformation -->
            <div class="transform-mockup">
              <div class="phone-mockup">
                <div class="phone-notch"><div class="phone-notch-bar"></div></div>
                <div class="phone-status">
                  <div class="phone-status-avatar"><LandingIcon name="chat" /></div>
                  <div>
                    <div class="phone-status-name">{{ t('hv_chat_title') }}</div>
                    <div class="phone-status-sub">{{ t('hv_chat') }}</div>
                  </div>
                  <div class="phone-status-dot"></div>
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
              </div>
              <div class="transform-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v14M12 18l-5-5M12 18l5-5"/></svg>
                <span>{{ t('hv_arrow') }}</span>
              </div>
              <div class="issue-card-mockup">
                <div class="issue-card-row">
                  <span class="issue-card-key">{{ t('hv_key') }}</span>
                  <span class="issue-card-status">&#9679; {{ t('hv_badge') }}</span>
                </div>
                <p class="issue-card-content"><strong>{{ t('hv_title') }}</strong> --- {{ t('hv_desc') }}</p>
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
      <LandingSection :pre-title="t('uc_label')" :title="t('uc_title')" :post-title="t('uc_sub')" type="cream">
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
            <a href="https://t.me/msgboard_bot" class="use-case-link" target="_blank" rel="noopener">{{ t('uc_p_cta') }} &#8594;</a>
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
            <a :href="appUrl" class="use-case-link">{{ t('login') }} &#8594;</a>
          </div>
        </div>
      </LandingSection>

      <!-- ══ STRUCTURE ══ -->
      <LandingSection :pre-title="t('struct_label')" :title="t('struct_title')" :post-title="t('struct_sub')" type="light">
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
      <LandingCallToAction :title="t('cta2_title')" :pre-title="t('cta2_label')" :post-title="t('cta2_sub')">
        <LandingActionButton :title="t('login')" :link="appUrl" type="site" />
        <LandingActionButton title="@msgboard_bot" link="https://t.me/msgboard_bot" type="telegram" />
      </LandingCallToAction>

      <!-- ══ FEATURES ══ -->
      <LandingFeaturesGrid
          id="features"
          :pre-title="t('feat_label')"
          :title="t('feat_title')"
          :post-title="t('feat_sub')"
          :features="[
        {
          title: t('f1t'),
          icon: 'board',
          description: t('f1d'),
          link: laraueUrl('/blog/documentation/laraue-boards/getting-started/quick-start')
        },
        {
          title: t('f2t'),
          icon: 'mail',
          description: t('f2d'),
          link: laraueUrl('/blog/documentation/laraue-boards/working-alone/telegram-messages')
        },
        {
          title: t('f3t'),
          icon: 'camera',
          description: t('f3d'),
          link: laraueUrl('/blog/documentation/laraue-boards/features/media')
        },
        {
          title: t('f4t'),
          icon: 'edit',
          description: t('f4d'),
          link: laraueUrl('/blog/documentation/laraue-boards/integrations/telegram-save-modes')
        },
        {
          title: t('f5t'),
          icon: 'tag',
          description: t('f5d'),
          link: laraueUrl('/blog/documentation/laraue-boards/features/card-keys')
        },
        {
          title: t('f6t'),
          icon: 'gear',
          description: t('f6d'),
          link: laraueUrl('/blog/documentation/laraue-boards/features/attributes')
        },
        {
          title: t('f7t'),
          icon: 'partners',
          description: t('f7d'),
          link: laraueUrl('/blog/documentation/laraue-boards/concepts/organizations')
        },
        {
          title: t('f8t'),
          icon: 'lock',
          description: t('f8d'),
          link: laraueUrl('/blog/documentation/laraue-boards/getting-started/authorization')
        },
        {
          title: t('f9t'),
          icon: 'code',
          description: t('f9d'),
          link: 'https://github.com/win7user10/Laraue.Apps.Boards'
        },
        {
          title: t('f10t'),
          icon: 'sparkle',
          description: t('f10d'),
          link: laraueUrl('/blog/documentation/laraue-boards/integrations/telegram-save-modes')
        },
        {
          title: t('f11t'),
          icon: 'search',
          description: t('f11d'),
          link: laraueUrl('/blog/documentation/laraue-boards/features/search')
        }
      ]" />

      <!-- ══ PLATFORMS ══ -->
      <LandingSection :pre-title="t('pl_label')" :title="t('pl_title')" :post-title="t('pl_sub')" type="light">
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
              <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f1') }}</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f2') }}</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f3') }}</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('web_f4') }}</span></li>
            </ul>
            <a :href="appUrl" class="platform-card-link web" style="align-self:flex-start">{{ t('open_webapp') }} &#8594;</a>
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
              <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('tg_f1') }}</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('tg_f2') }}</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('tg_f3') }}</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('tg_f4') }}</span></li>
            </ul>
            <a href="https://t.me/msgboard_bot" class="platform-card-link tg" style="align-self:flex-start" target="_blank" rel="noopener">@msgboard_bot &#8594;</a>
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
              <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('mcp_f1') }}</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('mcp_f2') }}</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('mcp_f3') }}</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('mcp_f4') }}</span></li>
            </ul>
            <a :href="appUrl" class="platform-card-link mcp" style="align-self:flex-start">{{ t('mcp_cta') }} &#8594;</a>
          </div>

        </div>
      </LandingSection>


      <!-- ══ OPEN SOURCE / BUILT IN THE OPEN ══ -->
      <LandingSection :pre-title="t('os_label')" :title="t('os_title')" :post-title="t('os_sub')" type="cream">
        <div class="use-cases-grid">
          <div class="use-case-card teams reveal">
            <div class="use-case-icon"><LandingIcon name="code" /></div>
            <div class="use-case-title">{{ t('os_code_title') }}</div>
            <p class="use-case-desc">{{ t('os_code_desc') }}</p>
            <ul class="use-case-list">
              <li>Laraue.Apps.Boards — .NET 10 / C#, PostgreSQL 18</li>
              <li>laraue-boards — Nuxt 4, Vue 3, TypeScript</li>
            </ul>
            <a href="https://github.com/win7user10/Laraue.Apps.Boards" class="use-case-link" target="_blank" rel="noopener">{{ t('os_code_cta') }} &#8594;</a>
          </div>
          <div class="use-case-card personal reveal">
            <div class="use-case-icon"><LandingIcon name="book" /></div>
            <div class="use-case-title">{{ t('os_devlog_title') }}</div>
            <p class="use-case-desc">{{ t('os_devlog_desc') }}</p>
            <a :href="laraueUrl('/blog/articles/building-jira-alternative-solo-why-and-repositories')" class="use-case-link">{{ t('os_devlog_cta') }} &#8594;</a>
          </div>
        </div>
        <p class="pricing-note reveal">{{ t('pr_note') }}</p>
      </LandingSection>

      <!-- ══ FAQ ══ -->
      <section class="faq" id="faq">
        <div class="faq-inner">
          <div class="section-label reveal">{{ t('faq_label') }}</div>
          <h2 class="section-title reveal">{{ t('faq_title') }}</h2>
          <div class="faq-list">
            <div class="faq-item reveal" :data-open="openFaq === index ? 'true' : null" v-for="(item, index) in faqItems" :key="index">
              <button
                  class="faq-summary"
                  type="button"
                  :aria-expanded="openFaq === index"
                  :aria-controls="`faq-answer-${index}`"
                  @click="toggleFaq(index)"
              >
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
      <LandingCallToAction :title="t('cta_title')" :pre-title="t('cta_label')" :post-title="t('cta_sub')">
        <LandingActionButton :title="t('login')" :link="appUrl" type="site" />
        <LandingActionButton title="@msgboard_bot" link="https://t.me/msgboard_bot" type="telegram" />
      </LandingCallToAction>
  </main>
  <LandingFooter
    :docs-url="docsUrl"
    :locale="locale"
    :privacy-url="laraueUrl('/privacy')" />
</template>

<script setup lang="ts">
import type { LandingLocale, LandingMessageKey } from './LandingPage.messages'

import LandingActionButton from './components/LandingActionButton.vue'
import LandingCallToAction from './components/LandingCallToAction.vue'
import LandingFeaturesGrid from './components/LandingFeaturesGrid.vue'
import LandingFooter from './components/LandingFooter.vue'
import LandingHeader from './components/LandingHeader.vue'
import LandingIcon from './components/LandingIcon.vue'
import LandingIntro from './components/LandingIntro.vue'
import LandingPlatformBadge from './components/LandingPlatformBadge.vue'
import LandingSection from './components/LandingSection.vue'
import { useLandingText } from './useLandingText'

const props = defineProps<{ locale: LandingLocale }>()

const t = useLandingText(props.locale)

// The web app lives on the same host; /organizations sends signed-out users to /login.
const appUrl = '/organizations'
const laraueOrigin = 'https://laraue.com'
// Documentation and the blog stay on laraue.com until they move (BRD-241).
const laraueUrl = (path: string): string =>
  `${laraueOrigin}${props.locale === 'ru' ? '/ru' : ''}${path}`
const docsUrl = laraueUrl('/blog/documentation/laraue-boards')

useHead({
  htmlAttrs: { lang: props.locale },
  titleTemplate: (title) => title ?? '',
})

useSeoMeta({
  description: t('seoDescription'),
  title: t('seoTitle'),
})

const openFaq = ref<number>()
const toggleFaq = (index: number): void => {
  openFaq.value = openFaq.value === index ? undefined : index
}
const faqItems = Array.from({ length: 11 }, (_, index) => ({
  a: t(`faq${index + 1}a` as LandingMessageKey),
  q: t(`faq${index + 1}q` as LandingMessageKey),
}))
</script>

<style scoped>
section {
  --msg-blue: #2d7dd2;
  --msg-blue-light: #e8f2fc;
  --msg-green: #2d8a55;
  --msg-green-light: #e6f7ee;
}

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
  color: rgba(247,244,238,.65);
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: rgba(247,244,238,.3);
  text-underline-offset: 3px;
  transition: color .2s,text-decoration-color .2s;
}

.hero-quick-links a:hover {
  color: #fff;
  text-decoration-color: rgba(255,255,255,.6);
}

.section-label {
  align-items: center;
  color: var(--accent);
  display: flex;
  font-size: 11px;
  font-weight: 700;
  gap: 8px;
  letter-spacing: .14em;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.section-label::after {
  background: var(--accent);
  content: '';
  flex: 1;
  height: 1px;
  max-width: 40px;
  opacity: .5;
}

.section-title {
  font-family: var(--serif);
  font-size: clamp(26px,3vw,42px);
  letter-spacing: -.3px;
  line-height: 1.12;
  margin-bottom: 16px;
}

.section-sub {
  color: var(--muted);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.7;
}

.hero-bg-glow {
  background: radial-gradient(circle at 88% -8%, rgba(45,125,210,.24) 0%, transparent 55%), radial-gradient(circle at 4% 106%, rgba(200,75,47,.16) 0%, transparent 55%);
  inset: 0;
  pointer-events: none;
  position: absolute;
}

.hero-visual {
  animation: fade-up .9s .25s ease both;
  position: relative;
}

.transform-mockup {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 360px;
}

.phone-mockup {
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 28px;
  box-shadow: 0 24px 64px rgba(0,0,0,.4),0 4px 16px rgba(0,0,0,.2);
  flex-shrink: 0;
  overflow: hidden;
  width: 260px;
}

.phone-notch {
  align-items: center;
  background: rgba(0,0,0,.4);
  display: flex;
  height: 28px;
  justify-content: center;
}

.phone-notch-bar {
  background: rgba(255,255,255,.2);
  border-radius: 2px;
  height: 4px;
  width: 60px;
}

.phone-status {
  align-items: center;
  background: rgba(34,158,217,.9);
  display: flex;
  gap: 10px;
  padding: 12px 16px;
}

.phone-status-avatar {
  align-items: center;
  background: rgba(255,255,255,.2);
  border-radius: 50%;
  color: #fff;
  display: flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  width: 32px;
}

.phone-status-avatar :deep(.landing-icon) {
  height: 18px;
  width: 18px;
}

.phone-status-name {
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.phone-status-sub {
  color: rgba(255,255,255,.65);
  font-size: 10px;
}

.phone-status-dot {
  background: #6edd9a;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(110,221,154,.25);
  height: 7px;
  margin-left: auto;
  width: 7px;
}

.phone-body {
  background: rgba(0,0,0,.25);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
}

.tg-bubble {
  align-self: flex-start;
  animation: msgReveal var(--anim-demo-duration) var(--anim-demo-step) var(--anim-ease) forwards;
  background: rgba(255,255,255,.1);
  border-radius: 4px 12px 12px 12px;
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
  background: #229ed9;
  border-radius: 50%;
  color: #fff;
  display: flex;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 700;
  height: 18px;
  justify-content: center;
  width: 18px;
}

.tg-bubble-name {
  color: rgba(255,255,255,.85);
  font-size: 11px;
  font-weight: 700;
}

.tg-bubble-text {
  color: rgba(255,255,255,.85);
  font-size: 12px;
  font-style: italic;
  line-height: 1.5;
  margin: 0;
}

.tg-bubble-time {
  color: rgba(255,255,255,.4);
  display: block;
  font-size: 9px;
  font-style: normal;
  margin-top: 3px;
  text-align: right;
}

.tg-bubble.reply {
  align-self: flex-end;
  animation-delay: calc(var(--anim-demo-step) * 2);
  background: rgba(200,75,47,.28);
  border-radius: 12px 4px 12px 12px;
}

.tg-bubble.reply .tg-bubble-header {
  flex-direction: row-reverse;
}

.tg-bubble-avatar.you {
  background: var(--accent);
}

.tg-bubble-text.command {
  color: #fff;
  font-family: var(--mono, monospace);
  font-style: normal;
  font-weight: 600;
}

.transform-arrow {
  align-items: flex-start;
  animation: msgReveal var(--anim-demo-duration) calc(var(--anim-demo-step) * 3) var(--anim-ease) forwards,pulseArrow var(--anim-pulse-duration) calc(var(--anim-demo-step) * 3 + var(--anim-demo-duration)) ease-in-out infinite;
  color: rgba(255,255,255,.4);
  display: flex;
  gap: 8px;
  opacity: 0;
  width: 260px;
}

.transform-arrow svg {
  color: var(--accent);
  flex-shrink: 0;
  height: 18px;
  margin-top: 1px;
  width: 18px;
}

.transform-arrow span {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .04em;
  line-height: 1.5;
}

.issue-card-mockup {
  animation: msgReveal var(--anim-demo-duration) calc(var(--anim-demo-step) * 4) var(--anim-ease) forwards;
  background: #1a1a1d;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 12px;
  box-shadow: 0 20px 44px rgba(0,0,0,.4);
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
  color: rgba(255,255,255,.85);
  font-family: var(--mono, monospace);
  font-size: 11px;
  font-weight: 700;
}

.issue-card-status {
  align-items: center;
  background: rgba(255,255,255,.08);
  border-radius: 20px;
  color: rgba(255,255,255,.6);
  display: flex;
  font-size: 10px;
  font-weight: 600;
  gap: 5px;
  margin-left: auto;
  padding: 3px 9px;
}

.issue-card-content {
  -webkit-box-orient: vertical;
  color: #fff;
  display: -webkit-box;
  font-size: 13px;
  font-weight: 700;
  -webkit-line-clamp: 2;
  line-height: 1.5;
  margin: 0 0 12px;
  overflow: hidden;
}

.issue-card-content strong {
  font-weight: 700;
}

.issue-card-footer {
  align-items: center;
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.issue-card-avatar {
  align-items: center;
  background: #229ed9;
  border-radius: 50%;
  color: #fff;
  display: flex;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 700;
  height: 18px;
  justify-content: center;
  width: 18px;
}

.issue-card-footer span {
  color: rgba(255,255,255,.55);
  font-size: 11px;
}

@keyframes pulseArrow {
  0%,
  100% {
    opacity: .55;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(2px);
  }
}

@keyframes msgReveal {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (width <= 720px) {
  .transform-mockup {
    max-width: none;
  }
}

.use-cases-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr 1fr;
  margin-top: 48px;
}

.use-cases-grid .use-case-card:nth-child(1) {
  animation-delay: 0s;
}

.use-cases-grid .use-case-card:nth-child(2) {
  animation-delay: var(--anim-stagger);
}

.use-case-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  padding: 36px 36px 32px;
  position: relative;
  transition: box-shadow .2s,transform .2s;
}

.use-case-card:hover {
  box-shadow: 0 8px 32px rgba(15,14,12,.1);
  transform: translateY(-3px);
}

.use-case-card::before {
  content: '';
  height: 4px;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.use-case-card.personal::before {
  background: linear-gradient(90deg,var(--msg-blue),#6ab0f0);
}

.use-case-card.teams::before {
  background: linear-gradient(90deg,var(--accent),#e0572e);
}

.use-case-icon {
  align-items: center;
  border-radius: 12px;
  display: flex;
  height: 44px;
  justify-content: center;
  margin-bottom: 16px;
  width: 44px;
}

.use-case-card.personal .use-case-icon {
  background: var(--msg-blue-light);
  color: var(--msg-blue);
}

.use-case-card.teams .use-case-icon {
  background: var(--accent-light);
  color: var(--accent);
}

.use-case-icon :deep(.landing-icon) {
  height: 22px;
  width: 22px;
}

.use-case-title {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -.2px;
  margin-bottom: 10px;
}

.use-case-desc {
  color: var(--muted);
  font-size: 15px;
  font-weight: 300;
  line-height: 1.65;
  margin-bottom: 24px;
}

.use-case-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  list-style: none;
  margin-bottom: 28px;
}

.use-case-list li {
  align-items: flex-start;
  color: var(--muted);
  display: flex;
  font-size: 14px;
  gap: 10px;
  line-height: 1.4;
}

.use-case-list li::before {
  color: var(--msg-green);
  content: '✓';
  flex-shrink: 0;
  font-weight: 700;
  margin-top: 1px;
}

.use-case-card.teams .use-case-list li::before {
  color: var(--accent);
}

.use-case-link {
  align-items: center;
  display: inline-flex;
  font-size: 13px;
  font-weight: 700;
  gap: 6px;
  text-decoration: none;
  transition: gap .15s;
}

.use-case-card.personal .use-case-link {
  color: var(--msg-blue);
}

.use-case-card.teams .use-case-link {
  color: var(--accent);
}

.use-case-card:hover .use-case-link {
  gap: 10px;
}

.hierarchy {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 48px;
}

.hierarchy-box {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  flex: 1;
  min-width: 140px;
  padding: 16px 20px;
  transition: box-shadow .2s,transform .2s;
}

.hierarchy-box:hover {
  box-shadow: 0 8px 24px rgba(15,14,12,.08);
  transform: translateY(-2px);
}

.hierarchy-box.highlight {
  background: var(--accent-light);
  border-color: var(--accent);
}

.hierarchy-box-label {
  color: var(--accent);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.hierarchy-box-ex {
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
}

.hierarchy-arrow {
  color: var(--muted);
  flex-shrink: 0;
  font-size: 18px;
}

.structure-points {
  display: grid;
  gap: 28px;
  grid-template-columns: repeat(3,1fr);
  margin-top: 44px;
}

.structure-point-title {
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -.1px;
  margin-bottom: 8px;
}

.structure-point-desc {
  color: var(--muted);
  font-size: 14px;
  font-weight: 300;
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

.platforms-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(3,1fr);
  margin-top: 48px;
}

.platforms-grid .platform-card:nth-child(1) {
  animation-delay: 0s;
}

.platforms-grid .platform-card:nth-child(2) {
  animation-delay: var(--anim-stagger);
}

.platforms-grid .platform-card:nth-child(3) {
  animation-delay: calc(var(--anim-stagger) * 2);
}

.platform-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  padding: 36px;
  transition: box-shadow .2s,transform .2s;
}

.platform-card:hover {
  box-shadow: 0 8px 32px rgba(15,14,12,.09);
  transform: translateY(-3px);
}

.platform-card-header {
  align-items: center;
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}

.platform-card-icon {
  align-items: center;
  border-radius: 12px;
  display: flex;
  flex-shrink: 0;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.platform-card-icon.web {
  background: var(--msg-blue-light);
  color: var(--msg-blue);
}

.platform-card-icon.tg {
  background: #e0f4fd;
  color: #229ed9;
}

.platform-card-icon.mcp {
  background: var(--accent-light);
  color: var(--accent);
}

.platform-card-icon :deep(.landing-icon) {
  height: 24px;
  width: 24px;
}

.platform-card-name {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -.2px;
}

.platform-card-tag {
  color: var(--muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
  margin-top: 2px;
  text-transform: uppercase;
}

.platform-card-desc {
  color: var(--muted);
  flex: 1;
  font-size: 15px;
  font-weight: 300;
  line-height: 1.65;
  margin-bottom: 24px;
}

.platform-card-features {
  display: flex;
  flex-direction: column;
  gap: 7px;
  list-style: none;
  margin-bottom: 28px;
}

.platform-card-features li {
  align-items: center;
  color: var(--muted);
  display: flex;
  font-size: 13px;
  gap: 8px;
}

.platform-card-features li svg {
  flex-shrink: 0;
  height: 14px;
  stroke: var(--msg-green);
  width: 14px;
}

.platform-card-link {
  align-items: center;
  display: inline-flex;
  font-size: 13px;
  font-weight: 700;
  gap: 6px;
  text-decoration: none;
  transition: gap .15s;
}

.platform-card-link:hover {
  gap: 10px;
}

.platform-card-link.web {
  color: var(--msg-blue);
}

.platform-card-link.tg {
  color: #229ed9;
}

.platform-card-link.mcp {
  color: var(--accent);
}

.pricing-note {
  color: var(--muted);
  font-size: 14px;
  margin-top: 36px;
  text-align: center;
}

.faq {
  border-bottom: 1px solid var(--border);
  padding: 80px 60px;
}

.faq-inner {
  margin: 0 auto;
  max-width: 820px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 40px;
}

.faq-item {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 24px;
  transition: box-shadow .2s;
}

.faq-item:hover {
  box-shadow: 0 4px 18px rgba(15,14,12,.07);
}

.faq-summary {
  align-items: center;
  background: none;
  border: none;
  color: var(--ink);
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  gap: 12px;
  justify-content: space-between;
  margin: 0;
  padding: 0;
  text-align: left;
  width: 100%;
}

.faq-summary::after {
  color: var(--muted);
  content: '+';
  flex-shrink: 0;
  font-size: 20px;
  font-weight: 400;
  transition: transform var(--anim-duration) var(--anim-ease);
}

.faq-item[data-open="true"] .faq-summary::after {
  transform: rotate(45deg);
}

.faq-answer-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--anim-duration) var(--anim-ease);
}

.faq-item[data-open="true"] .faq-answer-wrap {
  grid-template-rows: 1fr;
}

.faq-answer-inner {
  overflow: hidden;
}

.faq-item p {
  color: var(--muted);
  font-size: 15px;
  font-weight: 300;
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
  .hero-visual {
    order: -1;
  }

  .faq {
    padding: 60px 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-quick-links,
  .hero-visual {
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
</style>
