# DineFlow 🍽️

**DineFlow** is a smart restaurant management web application that simplifies
restaurant operations — browsing menus, grabbing offers, managing a cart, and
ordering food online — while improving the overall customer experience.

## Features

- **Menu browsing** — dishes grouped by Appetizers, Main Course, and Desserts
- **Offers** — promotional deals presented in a responsive card layout
- **About** — dynamic, content-driven about page
- **Reviews** — customers can leave feedback from the landing page
- **Authentication** — sign-up / sign-in with session-based login
- **Cart & payment** — protected routes for logged-in users
- **Responsive UI** — works across desktop and mobile

## Tech Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Backend  | Node.js, Express 5                          |
| Views    | EJS templates                               |
| Database | Supabase (Postgres) via `@supabase/supabase-js` |
| Sessions | `express-session`                           |
| Other    | `method-override`, `dotenv`                 |
| Frontend | HTML, CSS, JavaScript                       |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- A [Supabase](https://supabase.com/) project

### Installation

```bash
git clone https://github.com/ParvTiwari/DineFlow.git
cd DineFlow
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=3000
SESSION_SECRET=your-session-secret

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

```

### Running

```bash
npm start
```

The app starts on `http://localhost:3000/home`.

## Routes

| Method | Path            | Description                          | Auth |
| ------ | --------------- | ------------------------------------ | ---- |
| GET    | `/`             | Redirects to `/home`                 | —    |
| GET    | `/home`         | Landing page (contact, reviews)      | —    |
| POST   | `/home/review`  | Submit a customer review             | —    |
| GET    | `/menu`         | Menu by category                     | —    |
| GET    | `/about`        | About page                           | —    |
| GET    | `/offers`       | Promotional offers                   | —    |
| GET    | `/login`        | Sign-in / sign-up page               | —    |
| POST   | `/login`        | Authenticate user                    | —    |
| POST   | `/register`     | Create an account                    | —    |
| GET    | `/cart`         | Shopping cart                        | ✅   |
| GET    | `/payment`      | Payment page                         | ✅   |
| POST   | `/logout`       | Destroy session                      | —    |
| GET    | `/robots.txt`   | Dynamic robots file                  | —    |
| GET    | `/sitemap.xml`  | Dynamic sitemap                      | —    |

## Project Structure

```
DineFlow/
├── index.js              # Express app, routes, SEO endpoints
├── public/               # Static assets
│   ├── CSS/
│   ├── JS/
│   ├── images/
│   └── manifest.json
├── views/                # EJS templates
│   ├── includes/         # navBar, footer partials
│   ├── index.ejs         # Landing page
│   ├── menu.ejs
│   ├── about.ejs
│   ├── offers.ejs
│   ├── login.ejs
│   ├── cart.ejs
│   ├── payment.ejs
│   └── 404.ejs
├── .env
└── package.json
```