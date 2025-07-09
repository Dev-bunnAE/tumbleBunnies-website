# TumbleBunnies

A playful, kid-friendly web app for booking and managing children's gymnastics, dance, yoga, and activity classes. Built for both parents and administrators, TumbleBunnies features a modern, accessible, and mobile-first design with a focus on fun and usability.

## Features
- Beautiful, pastel-themed homepage with mascot and class showcase
- Secure parent registration, login, and account management
- Class browsing, registration, and cart/checkout flow
- Admin dashboard for managing facilities, classes, orders, registrations, attendance, and merchandise
- Merchandise storefront with cart integration
- Image upload and optimization for classes and merchandise
- Accessibility and SEO best practices throughout
- Responsive design for all devices

## Tech Stack
- **Next.js** (App Router, TypeScript)
- **React** (functional components, hooks)
- **Tailwind CSS** (custom pastel theme)
- **Firebase** (Auth, Firestore, Storage)
- **Lucide Icons** (playful, activity-themed icons)
- **Vercel** (recommended for deployment)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Firebase project (for Auth, Firestore, Storage)

### Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/Dev-bunnAE/tumblebunnies-website.git
   cd tumbleBunnies
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up your Firebase credentials:
   - Copy your Firebase config to `src/lib/firebase.tsx` as needed.
   - Set up Firestore and Storage rules as per `firebase-storage-rules.txt`.
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Visit [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure
- `src/app/` — Main Next.js app pages and routes
- `src/components/` — Reusable UI and layout components
- `src/lib/` — Firebase and utility functions
- `src/context/` — React context providers (e.g., cart)
- `src/hooks/` — Custom React hooks
- `public/` — Static assets (images, icons, etc.)

## SEO & Performance
- Dynamic meta tags, Open Graph, and Twitter cards
- JSON-LD structured data for organization, products, and events
- Sitemap.xml and robots.txt auto-generated
- next/image for image optimization
- Font loading optimized with `font-display: swap`
- Code splitting and dynamic imports for heavy components
- Tailwind CSS purges unused styles in production

## Accessibility
- All images and icons have descriptive alt text or ARIA labels
- Keyboard navigation and semantic HTML throughout
- Color contrast and focus states for all interactive elements

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License
[MIT](LICENSE)
