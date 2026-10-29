<template>
  <SiteHeader />
  <main class="terms">
    <article class="article">
      <h1 class="title">{{ t('title') }}</h1>
      <p class="updated">{{ t('updated') }}</p>
      <p>{{ t('intro') }}</p>
      <h2>{{ t('section1') }}</h2>
      <p>{{ t('section1Text1', { seller }) }}</p>
      <p>{{ t('section1Text2', { email, phone }) }}</p>
      <h2>{{ t('section2') }}</h2>
      <p>{{ t('section2Text1') }}</p>
      <p>{{ t('section2Text2') }}</p>
      <h2>{{ t('section3') }}</h2>
      <p>{{ t('section3Text1') }}</p>
      <p>{{ t('section3Text2') }}</p>
      <p>{{ t('section3Text3') }}</p>
      <h2>{{ t('section4') }}</h2>
      <p>{{ t('section4Text1') }}</p>
      <p>{{ t('section4Text2') }}</p>
      <h2>{{ t('section5') }}</h2>
      <p>{{ t('section5Text1') }}</p>
      <p>{{ t('section5Text2') }}</p>
      <p>{{ t('section5Text3', { email }) }}</p>
      <p>{{ t('section5Text4') }}</p>
      <h2>{{ t('section6') }}</h2>
      <p>{{ t('section6Text1') }}</p>
      <p>{{ t('section6Text2') }}</p>
      <h2>{{ t('section7') }}</h2>
      <p>{{ t('section7Text1') }}</p>
      <p>{{ t('section7Text2') }}</p>
      <h2>{{ t('section8') }}</h2>
      <p>{{ t('section8Text1') }}</p>
      <p>{{ t('section8Text2') }}</p>
      <h2>{{ t('contacts') }}</h2>
      <ul>
        <li>{{ sellerDetails.name[locale] }}, {{ sellerDetails.status[locale] }}</li>
        <li>{{ t('inn') }}: {{ sellerDetails.inn }}</li>
        <li>
          Email:
          <a :href="`mailto:${email}`">{{ email }}</a>
        </li>
        <li>
          {{ t('phone') }}:
          <a :href="`tel:${sellerDetails.phoneHref}`">{{ phone }}</a>
        </li>
      </ul>
    </article>
  </main>
  <SiteFooter />
</template>

<script setup lang="ts">
import { useHead, useSeoMeta } from '#app'
import { useLocaleHead } from '#imports'
import { sellerDetails } from '#layers/core/app/constants/sellerDetails'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import SiteFooter from '#layers/core/app/public-shell/components/SiteFooter.vue'
import SiteHeader from '#layers/core/app/public-shell/components/SiteHeader.vue'

const { locale, t } = useI18n({
  en: {
    contacts: 'Contacts and seller details',
    inn: 'INN',
    intro:
      'This document is a public offer. It describes the terms on which you get access to Laraue Boards and how payment works. By paying for a plan you confirm that you have read and accepted these terms.',
    phone: 'Phone',
    section1: '1. Seller',
    section1Text1: 'Seller: {seller}.',
    section1Text2: 'You can reach the seller at {email}, by phone at {phone}, or on Telegram.',
    section2: '2. Subject of the agreement',
    section2Text1:
      'Laraue Boards is a web service and a Telegram bot for managing tasks: Kanban boards, cards, statuses, comments, attachments and teamwork inside organizations.',
    section2Text2:
      'Access is provided under the plans described in the Pricing section of boards.laraue.com. A plan includes the features of the service and the number of tokens stated in its description.',
    section3: '3. Price and payment',
    section3Text1:
      'The price of a plan is shown on the site in Russian rubles or US dollars. The price shown on the page at the moment of payment is final; the seller charges no additional fees.',
    section3Text2:
      'Payment is made by bank card or the other methods offered on the Robokassa payment page. Card details are entered on the Robokassa side and are never passed to the seller.',
    section3Text3:
      'The seller pays the tax on professional income and issues a receipt through the "Moy Nalog" app.',
    section4: '4. How the service is provided',
    section4Text1:
      'The service is provided electronically; there is no physical delivery. Access to the paid plan and its tokens are added to your account automatically right after the payment service confirms the payment.',
    section4Text2:
      'If access does not appear within an hour of payment, write to the address in the Seller section and we will fix it.',
    section5: '5. Refunds',
    section5Text1:
      'Payments are not refunded: the service is provided right after payment, and the tokens and the plan become available immediately.',
    section5Text2:
      "The exceptions are cases where a refund is required by law, and cases where the service was not provided through the seller's fault. In those cases the money is returned the same way it was paid, within the term set by law.",
    section5Text3:
      'To request a refund in the cases where one is due, write to {email} with the date and amount of the payment and the reason. We will reply within 10 days and make an approved refund within the term set by law.',
    section5Text4: 'You can use the free plan and try the service before paying.',
    section6: '6. Ending use of the service',
    section6Text1:
      'You can stop using the service at any time. The paid period of a plan is not recalculated when you do.',
    section6Text2:
      "The seller may restrict access to the service if you break the law or these terms, in particular when you try to disrupt the service or reach other people's data.",
    section7: '7. Personal data',
    section7Text1:
      'The seller processes personal data in accordance with the privacy policy published at laraue.com/privacy.',
    section7Text2:
      'By paying for a plan you agree to the processing of the data needed for payment and for giving you access to the service.',
    section8: '8. Changes and disputes',
    section8Text1:
      'The seller may change this offer and the plans. New terms apply to payments made after the changes are published; a period that is already paid for does not change.',
    section8Text2:
      'Disputes are settled by negotiation and, failing that, under the law of the Russian Federation.',
    seoDescription:
      'Public offer of Laraue Boards: the seller, plans and payment, how access is provided, refunds and contacts.',
    title: 'Public offer',
    updated: 'Version of September 30, 2026',
  },
  ru: {
    contacts: 'Контакты и реквизиты',
    inn: 'ИНН',
    intro:
      'Настоящий документ является публичной офертой: он описывает условия, на которых вы получаете доступ к сервису Laraue Boards, и порядок оплаты. Оплата тарифа означает, что вы прочитали и приняли эти условия.',
    phone: 'Телефон',
    section1: '1. Исполнитель',
    section1Text1: 'Исполнитель: {seller}.',
    section1Text2:
      'Связаться с исполнителем можно по электронной почте {email}, по телефону {phone} или в Telegram.',
    section2: '2. Предмет договора',
    section2Text1:
      'Laraue Boards — веб-сервис и Telegram-бот для управления задачами: канбан-доски, карточки, статусы, комментарии, вложения и совместная работа в организациях.',
    section2Text2:
      'Доступ к сервису предоставляется по тарифам, которые описаны в разделе «Цены» на сайте boards.laraue.com. В тариф входят возможности сервиса и количество токенов, указанные в описании тарифа.',
    section3: '3. Стоимость и оплата',
    section3Text1:
      'Стоимость тарифа указана на сайте в рублях или долларах США. Цена, показанная на странице в момент оплаты, является окончательной; дополнительных платежей и комиссий исполнитель не взимает.',
    section3Text2:
      'Оплата производится банковской картой и другими способами, доступными на странице оплаты платёжного сервиса Robokassa. Данные карты вводятся на стороне Robokassa и исполнителю не передаются.',
    section3Text3:
      'Исполнитель применяет налог на профессиональный доход и выдаёт чек в приложении «Мой налог».',
    section4: '4. Порядок оказания услуги',
    section4Text1:
      'Сервис оказывается в электронном виде, физическая доставка не предусмотрена. Доступ к оплаченному тарифу и токены зачисляются на ваш аккаунт автоматически сразу после подтверждения оплаты платёжным сервисом.',
    section4Text2:
      'Если доступ не появился в течение часа после оплаты, напишите на адрес, указанный в разделе «Исполнитель», и мы всё исправим.',
    section5: '5. Возврат средств',
    section5Text1:
      'Оплаченные средства не возвращаются: услуга оказывается сразу после оплаты, а токены и доступ к тарифу становятся доступны немедленно.',
    section5Text2:
      'Исключение составляют случаи, когда возврат обязателен по закону, а также когда услуга не была оказана по вине исполнителя. В этих случаях деньги возвращаются тем же способом, которым была произведена оплата, в срок, установленный законом.',
    section5Text3:
      'Чтобы запросить возврат в случаях, когда он положен, напишите на {email} с указанием даты и суммы платежа и причины обращения. Мы ответим в течение 10 дней, а одобренный возврат выполним в срок, установленный законом.',
    section5Text4: 'Пользоваться бесплатным тарифом и оценить сервис можно до оплаты.',
    section6: '6. Прекращение использования',
    section6Text1:
      'Вы можете прекратить использование сервиса в любой момент. Оплаченный период тарифа при этом не пересчитывается.',
    section6Text2:
      'Исполнитель вправе ограничить доступ к сервису при нарушении вами законодательства или условий этой оферты, в частности при попытках нарушить работу сервиса или получить доступ к чужим данным.',
    section7: '7. Персональные данные',
    section7Text1:
      'Исполнитель обрабатывает персональные данные в соответствии с политикой конфиденциальности, которая опубликована на сайте laraue.com/privacy.',
    section7Text2:
      'Оплачивая тариф, вы соглашаетесь на обработку данных, необходимых для оплаты и предоставления доступа к сервису.',
    section8: '8. Изменения и споры',
    section8Text1:
      'Исполнитель вправе изменять эту оферту и тарифы. Новые условия действуют для платежей, совершённых после публикации изменений; уже оплаченный период не меняется.',
    section8Text2:
      'Споры решаются путём переговоров, а при недостижении согласия — в соответствии с законодательством Российской Федерации.',
    seoDescription:
      'Публичная оферта Laraue Boards: исполнитель, тарифы и оплата, предоставление доступа, возврат средств и контакты.',
    title: 'Публичная оферта',
    updated: 'Редакция от 30 сентября 2026 года',
  },
})

const { email, phone } = sellerDetails
const seller = `${sellerDetails.name[locale.value]}, ${sellerDetails.status[locale.value]}, ${t('inn')} ${sellerDetails.inn}`

useHead(useLocaleHead())
useSeoMeta({ description: t('seoDescription'), title: t('title') })
</script>

<style scoped>
.terms {
  margin: 0 auto;
  max-width: 820px;
  padding: 96px 24px 88px;
}

.title {
  font-size: clamp(28px, 4vw, 38px);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.updated {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  margin: 10px 0 28px;
}

.article {
  font-size: var(--font-size-lg);
  line-height: 1.75;
}

.article h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin: 40px 0 12px;
}

.article p {
  margin: 0 0 14px;
}

.article ul {
  list-style: disc;
  padding-left: 24px;
}

.article a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
