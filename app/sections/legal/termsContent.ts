import type { Locale } from '~/composables/useI18n'

import { sellerDetails } from './sellerDetails'

export type TermsSection = { paragraphs: string[]; title: string }

export type TermsContent = {
  intro: string
  sections: TermsSection[]
  seoDescription: string
  title: string
  updated: string
}

const seller = (locale: Locale): string =>
  `${sellerDetails.name[locale]}, ${sellerDetails.status[locale]}, ${locale === 'ru' ? 'ИНН' : 'INN'} ${sellerDetails.inn}`

export const termsContent = (locale: Locale): TermsContent =>
  locale === 'ru'
    ? {
        intro:
          'Настоящий документ является публичной офертой: он описывает условия, на которых вы получаете доступ к сервису Laraue Boards, и порядок оплаты. Оплата тарифа означает, что вы прочитали и приняли эти условия.',
        sections: [
          {
            paragraphs: [
              `Исполнитель: ${seller('ru')}.`,
              `Связаться с исполнителем можно по электронной почте ${sellerDetails.email}, по телефону ${sellerDetails.phone} или в Telegram.`,
            ],
            title: '1. Исполнитель',
          },
          {
            paragraphs: [
              'Laraue Boards — веб-сервис и Telegram-бот для управления задачами: канбан-доски, карточки, статусы, комментарии, вложения и совместная работа в организациях.',
              'Доступ к сервису предоставляется по тарифам, которые описаны в разделе «Цены» на сайте boards.laraue.com. В тариф входят возможности сервиса и количество токенов, указанные в описании тарифа.',
            ],
            title: '2. Предмет договора',
          },
          {
            paragraphs: [
              'Стоимость тарифа указана на сайте в рублях или долларах США. Цена, показанная на странице в момент оплаты, является окончательной; дополнительных платежей и комиссий исполнитель не взимает.',
              'Оплата производится банковской картой и другими способами, доступными на странице оплаты платёжного сервиса Robokassa. Данные карты вводятся на стороне Robokassa и исполнителю не передаются.',
              'Исполнитель применяет налог на профессиональный доход и выдаёт чек в приложении «Мой налог».',
            ],
            title: '3. Стоимость и оплата',
          },
          {
            paragraphs: [
              'Сервис оказывается в электронном виде, физическая доставка не предусмотрена. Доступ к оплаченному тарифу и токены зачисляются на ваш аккаунт автоматически сразу после подтверждения оплаты платёжным сервисом.',
              'Если доступ не появился в течение часа после оплаты, напишите на адрес, указанный в разделе «Исполнитель», и мы всё исправим.',
            ],
            title: '4. Порядок оказания услуги',
          },
          {
            paragraphs: [
              'Оплаченные средства не возвращаются: услуга оказывается сразу после оплаты, а токены и доступ к тарифу становятся доступны немедленно.',
              'Исключение составляют случаи, когда возврат обязателен по закону, а также когда услуга не была оказана по вине исполнителя. В этих случаях деньги возвращаются тем же способом, которым была произведена оплата, в срок, установленный законом.',
              'Пользоваться бесплатным тарифом и оценить сервис можно до оплаты.',
            ],
            title: '5. Возврат средств',
          },
          {
            paragraphs: [
              'Вы можете прекратить использование сервиса в любой момент. Оплаченный период тарифа при этом не пересчитывается.',
              'Исполнитель вправе ограничить доступ к сервису при нарушении вами законодательства или условий этой оферты, в частности при попытках нарушить работу сервиса или получить доступ к чужим данным.',
            ],
            title: '6. Прекращение использования',
          },
          {
            paragraphs: [
              'Исполнитель обрабатывает персональные данные в соответствии с политикой конфиденциальности, которая опубликована на сайте laraue.com/privacy.',
              'Оплачивая тариф, вы соглашаетесь на обработку данных, необходимых для оплаты и предоставления доступа к сервису.',
            ],
            title: '7. Персональные данные',
          },
          {
            paragraphs: [
              'Исполнитель вправе изменять эту оферту и тарифы. Новые условия действуют для платежей, совершённых после публикации изменений; уже оплаченный период не меняется.',
              'Споры решаются путём переговоров, а при недостижении согласия — в соответствии с законодательством Российской Федерации.',
            ],
            title: '8. Изменения и споры',
          },
        ],
        seoDescription:
          'Публичная оферта Laraue Boards: исполнитель, тарифы и оплата, предоставление доступа, возврат средств и контакты.',
        title: 'Публичная оферта',
        updated: 'Редакция от 30 сентября 2026 года',
      }
    : {
        intro:
          'This document is a public offer. It describes the terms on which you get access to Laraue Boards and how payment works. By paying for a plan you confirm that you have read and accepted these terms.',
        sections: [
          {
            paragraphs: [
              `Seller: ${seller('en')}.`,
              `You can reach the seller at ${sellerDetails.email}, by phone at ${sellerDetails.phone}, or on Telegram.`,
            ],
            title: '1. Seller',
          },
          {
            paragraphs: [
              'Laraue Boards is a web service and a Telegram bot for managing tasks: Kanban boards, cards, statuses, comments, attachments and teamwork inside organizations.',
              'Access is provided under the plans described in the Pricing section of boards.laraue.com. A plan includes the features of the service and the number of tokens stated in its description.',
            ],
            title: '2. Subject of the agreement',
          },
          {
            paragraphs: [
              'The price of a plan is shown on the site in Russian rubles or US dollars. The price shown on the page at the moment of payment is final; the seller charges no additional fees.',
              'Payment is made by bank card or the other methods offered on the Robokassa payment page. Card details are entered on the Robokassa side and are never passed to the seller.',
              'The seller pays the tax on professional income and issues a receipt through the "Moy Nalog" app.',
            ],
            title: '3. Price and payment',
          },
          {
            paragraphs: [
              'The service is provided electronically; there is no physical delivery. Access to the paid plan and its tokens are added to your account automatically right after the payment service confirms the payment.',
              'If access does not appear within an hour of payment, write to the address in the Seller section and we will fix it.',
            ],
            title: '4. How the service is provided',
          },
          {
            paragraphs: [
              'Payments are not refunded: the service is provided right after payment, and the tokens and the plan become available immediately.',
              'The exceptions are cases where a refund is required by law, and cases where the service was not provided through the seller\'s fault. In those cases the money is returned the same way it was paid, within the term set by law.',
              'You can use the free plan and try the service before paying.',
            ],
            title: '5. Refunds',
          },
          {
            paragraphs: [
              'You can stop using the service at any time. The paid period of a plan is not recalculated when you do.',
              'The seller may restrict access to the service if you break the law or these terms, in particular when you try to disrupt the service or reach other people\'s data.',
            ],
            title: '6. Ending use of the service',
          },
          {
            paragraphs: [
              'The seller processes personal data in accordance with the privacy policy published at laraue.com/privacy.',
              'By paying for a plan you agree to the processing of the data needed for payment and for giving you access to the service.',
            ],
            title: '7. Personal data',
          },
          {
            paragraphs: [
              'The seller may change this offer and the plans. New terms apply to payments made after the changes are published; a period that is already paid for does not change.',
              'Disputes are settled by negotiation and, failing that, under the law of the Russian Federation.',
            ],
            title: '8. Changes and disputes',
          },
        ],
        seoDescription:
          'Public offer of Laraue Boards: the seller, plans and payment, how access is provided, refunds and contacts.',
        title: 'Public offer',
        updated: 'Version of September 30, 2026',
      }
