<!-- A date field on Reka DatePicker: the date typed in its segments, or picked in a calendar opened by
     the button at its end. The value is an ISO string as a native date input gives it: "2026-10-13",
     or "2026-10-13T09:30" with `withTime`; '' when empty. Name it with aria-labelledby (BaseField's
     labelId): the field is a group of segments, not one input a label can point at. -->
<template>
  <div
    v-bind="$attrs"
    class="base-date-picker-root">
    <DatePickerRoot
      v-model="value"
      v-model:placeholder="shown"
      :close-on-select="!withTime"
      :disabled="disabled"
      :granularity="withTime ? 'minute' : 'day'"
      :hour-cycle="24"
      :locale="locale"
      :max-value="toDate(max)"
      :min-value="toDate(min)"
      :week-starts-on="locale === 'ru' ? 1 : 0"
      @update:open="view = 'day'">
      <DatePickerField
        v-slot="{ segments }"
        :aria-labelledby="ariaLabelledby"
        class="base-date-picker">
        <template
          v-for="item in segments"
          :key="item.part">
          <DatePickerInput
            :class="item.part === 'literal' ? 'base-date-picker-literal' : 'base-date-picker-segment'"
            :part="item.part">
            {{ item.value }}
          </DatePickerInput>
        </template>
        <DatePickerTrigger
          :aria-label="t('openCalendar')"
          class="base-date-picker-trigger">
          <IconCalendar />
        </DatePickerTrigger>
      </DatePickerField>
      <!-- Not portaled: a popup outside an open <dialog> would be under it and inert. -->
      <DatePickerContent
        align="start"
        class="base-date-picker-content"
        :collision-padding="16"
        :portal="{ disabled: true }"
        :side-offset="8">
        <DatePickerCalendar
          v-slot="{ weekDays, grid }"
          class="base-calendar">
          <!-- The heading steps out to the months of the year, then to years; a pick steps back in. -->
          <MonthPickerRoot
            v-if="view === 'month'"
            v-slot="{ grid: months }"
            class="base-calendar-picker"
            :locale="locale"
            :model-value="shown"
            @update:model-value="pickMonth">
            <MonthPickerHeader class="base-calendar-header">
              <MonthPickerPrev
                :aria-label="t('previousYear')"
                class="base-calendar-nav">
                <IconChevronLeft />
              </MonthPickerPrev>
              <MonthPickerHeading
                as="button"
                class="base-calendar-heading"
                type="button"
                @click="view = 'year'" />
              <MonthPickerNext
                :aria-label="t('nextYear')"
                class="base-calendar-nav">
                <IconChevronRight />
              </MonthPickerNext>
            </MonthPickerHeader>
            <MonthPickerGrid class="base-calendar-choices">
              <MonthPickerGridBody>
                <MonthPickerGridRow
                  v-for="(row, index) in months.rows"
                  :key="index"
                  class="base-calendar-choice-row">
                  <MonthPickerCell
                    v-for="month in row"
                    :key="month.toString()"
                    :date="month">
                    <MonthPickerCellTrigger
                      class="base-calendar-choice"
                      :month="month" />
                  </MonthPickerCell>
                </MonthPickerGridRow>
              </MonthPickerGridBody>
            </MonthPickerGrid>
          </MonthPickerRoot>
          <YearPickerRoot
            v-else-if="view === 'year'"
            v-slot="{ grid: years }"
            class="base-calendar-picker"
            :locale="locale"
            :model-value="shown"
            @update:model-value="pickYear">
            <YearPickerHeader class="base-calendar-header">
              <YearPickerPrev
                :aria-label="t('previousYears')"
                class="base-calendar-nav">
                <IconChevronLeft />
              </YearPickerPrev>
              <YearPickerHeading class="base-calendar-heading" />
              <YearPickerNext
                :aria-label="t('nextYears')"
                class="base-calendar-nav">
                <IconChevronRight />
              </YearPickerNext>
            </YearPickerHeader>
            <YearPickerGrid class="base-calendar-choices">
              <YearPickerGridBody>
                <YearPickerGridRow
                  v-for="(row, index) in years.rows"
                  :key="index"
                  class="base-calendar-choice-row">
                  <YearPickerCell
                    v-for="year in row"
                    :key="year.toString()"
                    :date="year">
                    <YearPickerCellTrigger
                      class="base-calendar-choice"
                      :year="year" />
                  </YearPickerCell>
                </YearPickerGridRow>
              </YearPickerGridBody>
            </YearPickerGrid>
          </YearPickerRoot>
          <DatePickerHeader
            v-if="view === 'day'"
            class="base-calendar-header">
            <DatePickerPrev
              :aria-label="t('previousMonth')"
              class="base-calendar-nav">
              <IconChevronLeft />
            </DatePickerPrev>
            <button
              :aria-label="t('chooseMonth')"
              class="base-calendar-heading"
              type="button"
              @click="view = 'month'">
              {{ heading }}
            </button>
            <DatePickerNext
              :aria-label="t('nextMonth')"
              class="base-calendar-nav">
              <IconChevronRight />
            </DatePickerNext>
          </DatePickerHeader>
          <DatePickerGrid
            v-for="month in view === 'day' ? grid : []"
            :key="month.value.toString()"
            class="base-calendar-grid">
            <DatePickerGridHead>
              <DatePickerGridRow class="base-calendar-row">
                <DatePickerHeadCell
                  v-for="day in weekDays"
                  :key="day"
                  class="base-calendar-head-cell">
                  {{ day }}
                </DatePickerHeadCell>
              </DatePickerGridRow>
            </DatePickerGridHead>
            <DatePickerGridBody>
              <DatePickerGridRow
                v-for="(weekDates, index) in month.rows"
                :key="index"
                class="base-calendar-row">
                <DatePickerCell
                  v-for="weekDate in weekDates"
                  :key="weekDate.toString()"
                  :date="weekDate">
                  <DatePickerCellTrigger
                    class="base-calendar-day"
                    :day="weekDate"
                    :month="month.value" />
                </DatePickerCell>
              </DatePickerGridRow>
            </DatePickerGridBody>
          </DatePickerGrid>
        </DatePickerCalendar>
      </DatePickerContent>
    </DatePickerRoot>
  </div>
</template>

<script setup lang="ts">
import {
  type DateValue,
  getLocalTimeZone,
  parseDate,
  parseDateTime,
  toCalendarDateTime,
  today,
} from '@internationalized/date'
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'
import {
  DatePickerCalendar,
  DatePickerCell,
  DatePickerCellTrigger,
  DatePickerContent,
  DatePickerField,
  DatePickerGrid,
  DatePickerGridBody,
  DatePickerGridHead,
  DatePickerGridRow,
  DatePickerHeadCell,
  DatePickerHeader,
  DatePickerInput,
  DatePickerNext,
  DatePickerPrev,
  DatePickerRoot,
  DatePickerTrigger,
  MonthPickerCell,
  MonthPickerCellTrigger,
  MonthPickerGrid,
  MonthPickerGridBody,
  MonthPickerGridRow,
  MonthPickerHeader,
  MonthPickerHeading,
  MonthPickerNext,
  MonthPickerPrev,
  MonthPickerRoot,
  YearPickerCell,
  YearPickerCellTrigger,
  YearPickerGrid,
  YearPickerGridBody,
  YearPickerGridRow,
  YearPickerHeader,
  YearPickerHeading,
  YearPickerNext,
  YearPickerPrev,
  YearPickerRoot,
} from 'reka-ui'

const props = withDefaults(
  defineProps<{
    ariaLabelledby?: string
    disabled?: boolean
    // The bounds, in the same format as the value.
    max?: string
    min?: string
    // Hours and minutes after the date, as a native datetime-local input.
    withTime?: boolean
  }>(),
  { ariaLabelledby: undefined, disabled: false, max: '', min: '', withTime: false },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const locale = useLocale()
const { t } = useI18n({
  en: {
    chooseMonth: 'Choose month and year',
    nextMonth: 'Next month',
    nextYear: 'Next year',
    nextYears: 'Next years',
    openCalendar: 'Open calendar',
    previousMonth: 'Previous month',
    previousYear: 'Previous year',
    previousYears: 'Previous years',
  },
  ru: {
    chooseMonth: 'Выбрать месяц и год',
    nextMonth: 'Следующий месяц',
    nextYear: 'Следующий год',
    nextYears: 'Следующие годы',
    openCalendar: 'Открыть календарь',
    previousMonth: 'Предыдущий месяц',
    previousYear: 'Предыдущий год',
    previousYears: 'Предыдущие годы',
  },
})

// A string the field cannot read (cut short, from an older format) shows as empty.
const toDate = (text: string): DateValue | undefined => {
  if (!text) {
    return undefined
  }
  try {
    return props.withTime ? parseDateTime(text) : parseDate(text.slice(0, 10))
  } catch {
    return undefined
  }
}

const value = computed({
  get: () => toDate(model.value) ?? null,
  // A date with time prints seconds too; the native format stops at minutes.
  set: (date: DateValue | null | undefined) =>
    (model.value = date ? date.toString().slice(0, props.withTime ? 16 : 10) : ''),
})

// The month the calendar shows; the heading and the month and year views move it. Its type sets the
// field's segments, so a field with time starts from a date with time.
const startOfToday = today(getLocalTimeZone())
const shown = ref<DateValue>(
  value.value ?? (props.withTime ? toCalendarDateTime(startOfToday) : startOfToday),
)
const view = ref<'day' | 'month' | 'year'>('day')

const heading = computed(() =>
  new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(
    shown.value.toDate(getLocalTimeZone()),
  ),
)

const pickMonth = (month: DateValue | DateValue[] | undefined) => {
  if (month && !Array.isArray(month)) {
    shown.value = shown.value.set({ month: month.month, year: month.year })
  }
  view.value = 'day'
}
const pickYear = (year: DateValue | DateValue[] | undefined) => {
  if (year && !Array.isArray(year)) {
    shown.value = shown.value.set({ year: year.year })
  }
  view.value = 'month'
}
</script>

<style scoped>
.base-date-picker-root {
  display: grid;
  min-width: 0;
}

/* Looks like the kit's inputs: the segments are its text, the calendar button sits at the end. */
.base-date-picker {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  font-size: var(--font-size-body);
  font-variant-numeric: tabular-nums;
  height: var(--control-height);
  min-width: 0;
  padding: 0 var(--space-1) 0 var(--space-3);
}

.base-date-picker:hover:not([data-disabled], :focus-within) {
  border-color: var(--color-border-hover);
}

.base-date-picker:focus-within {
  border-color: var(--color-focus);
}

.base-date-picker[data-disabled] {
  background: var(--color-soft);
  color: var(--color-muted);
  cursor: not-allowed;
}

.base-date-picker-segment {
  border-radius: var(--radius-small);
  outline: none;
  padding: 0 1px;
}

.base-date-picker-segment[data-placeholder] {
  color: var(--color-muted);
}

.base-date-picker-segment:focus {
  background: var(--color-accent-soft);
  color: var(--color-text);
}

.base-date-picker-literal {
  color: var(--color-muted);
}

.base-date-picker-trigger {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-small);
  color: var(--color-muted);
  display: flex;
  height: calc(var(--control-height) - var(--space-2));
  justify-content: center;
  margin-left: auto;
  padding: 0;
  width: calc(var(--control-height) - var(--space-2));
}

.base-date-picker-trigger:hover:not(:disabled, :focus-visible) {
  background: var(--color-soft);
  color: var(--color-text);
}

.base-date-picker-trigger:focus-visible {
  border-color: var(--color-focus);
  box-shadow: none;
}

.base-date-picker-trigger svg {
  height: var(--icon-size);
  width: var(--icon-size);
}

.base-calendar-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.base-calendar-heading {
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
  height: var(--control-height);
  padding: 0 var(--space-2);
}

.base-calendar-heading:is(button):hover:not(:focus-visible) {
  background: var(--color-soft);
}

.base-calendar-heading:focus-visible {
  border-color: var(--color-focus);
  box-shadow: none;
}

/* The month and year views take the width of the days' grid. */
.base-calendar-picker {
  width: calc(var(--control-height) * 7);
}

.base-calendar-choices {
  border-collapse: collapse;
  width: 100%;
}

.base-calendar-choice-row {
  display: grid;
  gap: var(--space-1);
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: var(--space-1);
}

.base-calendar-choice {
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  font-variant-numeric: tabular-nums;
  height: calc(var(--control-height) + var(--space-2));
  justify-content: center;
  outline: none;
}

.base-calendar-choice:hover:not([data-selected], :focus-visible) {
  background: var(--color-soft);
}

.base-calendar-choice[data-today]:not([data-selected]) {
  color: var(--color-accent);
}

.base-calendar-choice[data-selected] {
  background: var(--color-action);
  color: var(--color-on-action);
}

.base-calendar-choice:focus-visible {
  border-color: var(--color-focus);
  box-shadow: none;
}

.base-calendar-nav {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  color: var(--color-muted);
  display: flex;
  height: var(--control-height);
  justify-content: center;
  padding: 0;
  width: var(--control-height);
}

.base-calendar-nav:hover:not(:disabled, :focus-visible) {
  background: var(--color-soft);
  color: var(--color-text);
}

.base-calendar-nav:focus-visible {
  border-color: var(--color-focus);
  box-shadow: none;
}

.base-calendar-nav svg {
  height: var(--icon-size);
  width: var(--icon-size);
}

.base-calendar-grid {
  border-collapse: collapse;
}

.base-calendar-row {
  display: grid;
  grid-template-columns: repeat(7, var(--control-height));
}

.base-calendar-head-cell {
  color: var(--color-muted);
  font-size: var(--font-size-sm);
  font-weight: 400;
  line-height: var(--control-height);
  text-align: center;
}

.base-calendar-day {
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  font-variant-numeric: tabular-nums;
  height: var(--control-height);
  justify-content: center;
  outline: none;
  width: var(--control-height);
}

.base-calendar-day:hover:not([data-selected], [data-disabled]) {
  background: var(--color-soft);
}

/* Today is marked by color, not weight, so the number does not change width. */
.base-calendar-day[data-today]:not([data-selected]) {
  color: var(--color-accent);
}

.base-calendar-day[data-outside-view] {
  color: var(--color-muted);
}

.base-calendar-day[data-selected] {
  background: var(--color-action);
  color: var(--color-on-action);
}

.base-calendar-day[data-disabled],
.base-calendar-day[data-unavailable] {
  color: var(--color-muted);
  cursor: not-allowed;
  opacity: 0.5;
}

.base-calendar-day:focus-visible {
  border-color: var(--color-focus);
}

.base-calendar-day[data-selected]:focus-visible {
  box-shadow: inset 0 0 0 1px var(--color-surface);
}
</style>

<!-- Not scoped: the content renders through Reka's (disabled) portal, a fragment the scope id does not
     reach. The class is the kit's own, so it styles nothing else. -->
<style>
.base-date-picker-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: var(--radius-popover);
  box-shadow: var(--shadow-popover);
  color: var(--color-text);
  padding: var(--space-3);
  z-index: 31;
}
</style>
