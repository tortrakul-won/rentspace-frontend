# RentSpace Frontend

Short-term space rental marketplace for Thailand. Book studios, rooftops, gardens, and event venues by the hour or by the day.

**Backend repo:** https://github.com/tortrakul-won/rentspace-backend

---

## Stack

Vue 3, Vite, TypeScript, Tailwind CSS v4, Vue Router

---

## Project Structure

```
rentspace-frontend/
├── index.html                   app entry, Google Fonts loaded here
├── vite.config.ts               Vite config with Vue + Tailwind plugins
└── src/
    ├── main.ts                  app bootstrap, mounts Vue + router
    ├── App.vue                  root component, renders RouterView
    ├── style.css                Tailwind import + all design tokens (@theme)
    ├── vite-env.d.ts            TypeScript declaration for .vue files
    ├── router/
    │   └── index.ts             all client-side routes
    ├── data/
    │   ├── types.ts             Space and Booking TypeScript interfaces
    │   ├── spaces.ts            data-access layer for spaces (swap mock → API here)
    │   ├── bookings.ts          data-access layer for bookings
    │   └── mock/
    │       ├── spaces.ts        6 sample Bangkok spaces with Unsplash images
    │       └── bookings.ts      4 sample bookings
    ├── components/
    │   ├── NavBar.vue           sticky top nav — logo, links, sign in CTA
    │   └── SpaceCard.vue        space listing card — image, rating, price
    └── views/
        ├── BrowseView.vue       homepage — hero, search, category filter, space grid
        └── SpaceDetailView.vue  space detail — photos, amenities, booking panel (stub)
```

---

## Setup

```bash
pnpm install
pnpm dev          # http://localhost:5173
```
