# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at http://localhost:5173/electro/
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run deploy    # Build + deploy to GitHub Pages (gh-pages)
```

No test framework is configured in this project.

## Architecture

**Electro** — клиентское SPA для учёта показаний электросчётчика с двухзонным тарифом (T1 день / T2 ночь).

### Stack
React 19 + Vite 7 + Tailwind CSS 4 + Zustand 5 + Recharts 3 + Framer Motion + React Router DOM 7

### Routing
`main.jsx` → `BrowserRouter(basename="/electro")` → `App.jsx` → 5 маршрутов, все обёрнуты в `AppLayout`:
- `/dashboard` — KPI-карточки, графики, последние записи
- `/readings` — ввод новых показаний с мгновенным preview
- `/history` — таблица с фильтром по месяцам и удалением
- `/analytics` — анализ по периодам (день/неделя/месяц/год/произвольный)
- `/settings` — тема, тарифы, экспорт/импорт/очистка данных

### State Management (Zustand + localStorage persist)
- `src/store/useReadingsStore.js` — ключ `"electro-readings"`. Хранит массив записей: `{id, date, t1Reading, t2Reading, consumption, cost}`. При удалении записи пересчитывает все последующие через `recalculateAllReadings()`.
- `src/store/useSettingsStore.js` — ключ `"electro-settings"`. Хранит `{currentTariff, tariffHistory, theme}`. Метод `getTariffForDate(dateStr)` возвращает актуальный тариф для произвольной даты.

### Key Utilities
- `src/utils/calculations.js` — `calculateReading()`, `previewCalculation()`, `recalculateAllReadings()`
- `src/utils/validation.js` — валидация: показания должны быть ≥ предыдущих, нет дублей по дате
- `src/utils/analytics.js` — агрегация данных по периодам
- `src/utils/export.js` — экспорт/импорт JSON

### Theme System
CSS-переменные в `src/index.css` (Tailwind CSS v4). Класс `dark` на root-элементе. Три режима: `dark` / `light` / `system` (через `prefers-color-scheme`). Логика в `src/hooks/useTheme.js`.

### Layout
`AppLayout` = `Sidebar` (скрыт на мобайле, `lg:block`) + `TopBar` + `<Outlet/>` + `BottomNav` (видна только на мобайле, `lg:hidden`). Мобайл-контент имеет `pb-24` для отступа под нижнюю навигацию.

### Deployment
Сайт деплоится на GitHub Pages с `base: '/electro/'` в `vite.config.js`. Файл `public/404.html` обеспечивает корректную маршрутизацию SPA на GitHub Pages.
