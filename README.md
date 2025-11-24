# شمال گراف - دستیار سفر هوشمند

> پلتفرم جامع دستیار سفر برای شمال ایران

## 📱 درباره پروژه

شمال گراف یک اپلیکیشن PWA (Progressive Web App) برای کمک به توریست‌ها در برنامه‌ریزی و مدیریت سفر به شمال ایران است. این اپلیکیشن شامل:

- 📍 نقشه و لیست رستوران‌ها و کافه‌ها
- 🏞️ معرفی مکان‌های گردشگری
- ⭐ سیستم نظرات و امتیازدهی
- 💝 ذخیره مکان‌های مورد علاقه
- 💡 پیشنهاد مکان‌ها توسط کاربران
- 👨‍💼 پنل مدیریت جامع

## 🚀 تکنولوژی‌های استفاده شده

### Frontend & Backend
- **Next.js 15** - React Framework با App Router
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components

### Database & ORM
- **PostgreSQL** - Database (روی لیارا)
- **Prisma** - ORM

### Authentication
- **NextAuth.js v5** - احراز هویت با شماره موبایل + OTP

### State Management & Data Fetching
- **Zustand** - Client State Management
- **TanStack Query** - Server State & Caching

### Map
- **Leaflet** + **React Leaflet** - نقشه (با API نشان)

### Form Management
- **React Hook Form** + **Zod** - فرم‌ها و Validation

## 📦 نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 18+
- npm یا pnpm
- PostgreSQL Database (لیارا)

### مراحل نصب

1. **کلون کردن پروژه:**
```bash
git clone <repository-url>
cd ShomalGeraph
```

2. **نصب dependencies:**
```bash
npm install --legacy-peer-deps
```

3. **تنظیم Environment Variables:**

فایل `.env` را ایجاد کنید:
```env
# Database
DATABASE_URL="postgresql://root:PASSWORD@vinson.liara.cloud:33534/postgres?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Liara Object Storage (اختیاری)
LIARA_ENDPOINT=""
LIARA_ACCESS_KEY=""
LIARA_SECRET_KEY=""
LIARA_BUCKET_NAME=""

# Neshan Map API (اختیاری)
NEXT_PUBLIC_NESHAN_API_KEY=""
```

4. **Push کردن Schema به Database:**
```bash
npm run db:push
```

5. **اجرای پروژه:**
```bash
npm run dev
```

پروژه روی `http://localhost:3000` اجرا می‌شود.

## 📁 ساختار پروژه

```
shomal-geraph/
├── app/
│   ├── (admin)/              # پنل ادمین
│   │   └── admin/
│   │       ├── page.tsx      # Dashboard
│   │       ├── restaurants/  # مدیریت رستوران‌ها
│   │       ├── places/       # مدیریت مکان‌ها
│   │       ├── users/        # مدیریت کاربران
│   │       └── suggestions/  # پیشنهادات کاربران
│   ├── (mobile)/             # صفحات موبایل PWA (در حال توسعه)
│   ├── api/                  # API Routes
│   │   └── auth/             # NextAuth
│   ├── auth/                 # صفحات احراز هویت
│   │   └── signin/           # ورود
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # صفحه اصلی
├── components/
│   ├── admin/                # کامپوننت‌های پنل ادمین
│   ├── mobile/               # کامپوننت‌های موبایل
│   ├── shared/               # کامپوننت‌های مشترک
│   └── ui/                   # UI Components (shadcn/ui)
├── lib/
│   ├── auth.ts               # NextAuth config
│   ├── db.ts                 # Prisma client
│   └── utils.ts              # توابع کمکی
├── prisma/
│   └── schema.prisma         # Database Schema
├── store/                    # Zustand stores
├── types/                    # TypeScript types
└── public/                   # فایل‌های استاتیک
```

## 🗄️ مدل‌های دیتابیس

### User
- کاربران سیستم با نقش‌های USER, ADMIN, BUSINESS_OWNER

### Restaurant
- رستوران‌ها با اطلاعات کامل (آدرس، مختصات، قیمت، امتیاز)

### TouristPlace
- مکان‌های گردشگری با دسته‌بندی و مناسب بودن

### Review
- نظرات و امتیازدهی کاربران

### Favorite
- ذخیره مکان‌های مورد علاقه

### Suggestion
- پیشنهادات کاربران برای مکان‌های جدید

### Category
- دسته‌بندی رستوران‌ها و مکان‌ها

## 🔑 احراز هویت

- ورود با شماره موبایل + OTP
- فعلاً OTP ساختگی: `123456`
- Session Management با NextAuth.js
- Role-based Access Control

## 🛠️ دستورات مفید

```bash
# اجرای Development Server
npm run dev

# Build برای Production
npm run build

# اجرای Production Build
npm start

# Lint کردن کد
npm run lint

# Generate کردن Prisma Client
npm run db:generate

# Push کردن Schema به Database
npm run db:push

# باز کردن Prisma Studio
npm run db:studio
```

## 👨‍💼 پنل ادمین

پنل ادمین در مسیر `/admin` قابل دسترسی است.

### ویژگی‌های پنل ادمین:
- ✅ Dashboard با آمار کلی
- ✅ مدیریت رستوران‌ها (لیست، افزودن، ویرایش، حذف)
- ✅ مدیریت مکان‌های گردشگری
- ✅ مدیریت کاربران
- ✅ تایید/رد پیشنهادات کاربران
- ✅ مدیریت نظرات

### دسترسی:
برای دسترسی به پنل ادمین، کاربر باید نقش `ADMIN` داشته باشد.

## 📱 PWA Features (در حال توسعه)

- [ ] Install Prompt
- [ ] Offline Support
- [ ] Geolocation
- [ ] Push Notifications
- [ ] Camera Access

## 🚧 در حال توسعه

### فاز بعدی:
- [ ] صفحات موبایل PWA
- [ ] نقشه با Neshan API
- [ ] API Endpoints کامل
- [ ] آپلود و مدیریت تصاویر
- [ ] سیستم جستجو و فیلتر
- [ ] PWA Manifest و Service Worker

## 📄 لایسنس

Private Project

## 👥 توسعه‌دهندگان

تیم شمال گراف

---

**نسخه:** 0.1.0 (MVP)
