export default function Head() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="Sqoolify - Complete school management platform. Manage students, teachers, exams, fees, attendance, and report cards all in one place." />
      <meta name="keywords" content="school management, student management, CBT exams, fee management, attendance tracking, report cards, school software, education platform" />
      <meta name="author" content="Sqoolify" />
      <meta name="theme-color" content="#3B82F6" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Sqoolify" />
      <meta property="og:title" content="Sqoolify - Complete School Management Platform" />
      <meta property="og:description" content="Manage students, teachers, exams, fees, attendance, and report cards. Everything your school needs in one platform." />
      <meta property="og:image" content="/og-image.svg" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Sqoolify - Complete School Management Platform" />
      <meta name="twitter:description" content="Manage students, teachers, exams, fees, attendance, and report cards. Everything your school needs in one platform." />
      <meta name="twitter:image" content="/og-image.svg" />

      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/favicon.svg" />

      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />
    </>
  )
}
