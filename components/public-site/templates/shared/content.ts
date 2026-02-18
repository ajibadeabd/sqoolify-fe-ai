export interface Stat { val: string; label: string }
export interface Testimonial { name: string; role: string; initials: string; quote: string }
export interface CoreValue { title: string; desc: string; iconName: string }
export interface TimelineItem { title: string; getDesc: (name: string) => string }
export interface ApproachItem { title: string; desc: string }
export interface AdmissionStep { step: string; title: string; desc: string; iconName: string }
export interface IncludedItem { title: string; desc: string; iconName: string }
export interface AgeRequirement { level: string; age: string }
export interface FAQItem { q: string; a: string; cat: string }
export interface FAQCategory { name: string; iconName: string; color: string }
export interface OfficeHour { day: string; time: string; note?: string }
export interface VisitReason { title: string; desc: string; iconName: string }
export interface Pillar { title: string; desc: string; iconName: string }

// ══════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════

export const heroStats: Stat[] = [
  { val: '20+', label: 'Years' },
  { val: '2,000+', label: 'Students' },
  { val: '98%', label: 'Pass Rate' },
  { val: '50+', label: 'Teachers' },
]

export const heroStatsMobile: Stat[] = [
  { val: '20+', label: 'Years' },
  { val: '2k+', label: 'Students' },
  { val: '98%', label: 'Pass Rate' },
  { val: '50+', label: 'Teachers' },
]

export const pillars: Pillar[] = [
  { title: 'Academic Excellence', desc: "A rigorous curriculum with outstanding WAEC and NECO results year after year. Our students don't just pass exams — they top them.", iconName: 'academic' },
  { title: 'Modern STEM Labs', desc: 'Fully equipped science laboratories, robotics stations, computer suites, and a digital library that bring learning to life.', iconName: 'stem' },
  { title: 'Sports & Arts', desc: 'Inter-house sports, swimming, football, basketball, drama, music, debate — because greatness extends far beyond the classroom.', iconName: 'sports' },
  { title: 'Expert Faculty', desc: "Passionate, qualified educators who serve as mentors. Small class sizes mean every child receives personal attention and care.", iconName: 'faculty' },
  { title: 'Safe Environment', desc: 'CCTV monitoring, 24/7 security, controlled access, on-site medical staff, and emergency protocols that give parents complete peace of mind.', iconName: 'safe' },
  { title: 'Parent Portal', desc: "Real-time access to grades, attendance, fee payments, and announcements. Stay connected to your child's progress from anywhere.", iconName: 'portal' },
]

export const heroContent = (name: string) => ({
  badge: 'Admissions Open — 2025/2026 Session',
  headline: "Shaping tomorrow's",
  headlineSub: 'leaders, today.',
  description: `${name} delivers an exceptional education built on academic rigour, character, and a commitment to every child's individual potential.`,
})

export const campusImages = {
  main: { src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', alt: 'Classroom', label: 'Interactive Classrooms', tag: 'Learning', tagDesc: 'Smart boards, small class sizes, and hands-on learning' },
  library: { src: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&q=80', alt: 'Library', label: 'Library' },
  computerLab: { src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80', alt: 'Technology', label: 'Computer Lab' },
  sports: { src: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80', alt: 'Sports', label: 'Sports' },
}

export const aboutStripStats: Stat[] = [
  { val: '20+', label: 'Years of Impact' },
  { val: '5,000+', label: 'Graduates' },
  { val: '100%', label: 'UTME Success' },
]

export const aboutStripContent = (name: string) => ({
  para1: `${name} was founded with a single mission: give every child access to an education that rivals the best in the world. What started as a small classroom has grown into one of the region's most respected institutions.`,
  para2: "Our alumni include doctors, engineers, entrepreneurs, and community leaders. They are proof that when you combine passionate teaching with genuine care, extraordinary things happen.",
})

export const featuredTestimonial = {
  name: 'Mrs. Adebayo',
  role: 'Parent — 3 children enrolled',
  initials: 'MA',
  quote: "Enrolling my children here was the best decision we've ever made. The academic standards are world-class, but what truly sets this school apart is how deeply the teachers care about each student's growth as a human being.",
}

export const testimonials: Testimonial[] = [
  { name: 'Emmanuel O.', role: 'SS3 Student, Class of 2024', initials: 'EO', quote: "This school didn't just prepare me for WAEC — it prepared me for life. The mentorship, the leadership programmes, and the friendships I've built here are truly priceless." },
  { name: 'Dr. Okonkwo', role: 'Parent & Medical Professional', initials: 'DO', quote: 'As someone who holds very high standards, I can say with confidence that this school exceeds expectations in every area — academics, safety, facilities, and parent communication.' },
  { name: 'Mr. Chukwuma', role: 'Parent since 2019', initials: 'MC', quote: "The transformation I've seen in my son is remarkable. He's more confident, more disciplined, and genuinely excited about learning. The school deserves so much credit for that." },
  { name: 'Aisha M.', role: 'JSS3 Student', initials: 'AM', quote: 'I love the science labs and the coding club! My teachers push me to be my best every single day, and I feel like I can achieve anything.' },
]

export const homeCtaContent = (name: string) => ({
  badge: 'Limited spaces available',
  headline: "Your child's future\nstarts with a single step",
  description: `Join the families who have trusted ${name} with their children's education. Applications for the new session are now open.`,
})

// ══════════════════════════════════════════════
// ABOUT PAGE
// ══════════════════════════════════════════════

export const aboutHeroStats: Stat[] = [
  { val: '20+', label: 'Years' },
  { val: '5,000+', label: 'Alumni' },
  { val: '98%', label: 'Pass Rate' },
  { val: '50+', label: 'Faculty' },
]

export const aboutHeroContent = (name: string) => ({
  badge: 'Est. 2005',
  headline: 'The story',
  headlineSub: `behind ${name}`,
  description: 'Two decades of shaping futures, building character, and proving that every child can achieve extraordinary things.',
})

export const timeline: TimelineItem[] = [
  { title: 'The Beginning', getDesc: (name) => `${name} was born from a simple conviction: that every child, regardless of background, deserves access to an education that unlocks their full potential. Our founders started with a small classroom, a handful of students, and an unwavering vision.` },
  { title: 'Growth & Investment', getDesc: () => 'Over the years, we invested relentlessly in what matters — outstanding teachers, modern laboratories, a well-stocked library, smart classrooms, and sports facilities. We grew not just in size, but in the depth and quality of education we provide.' },
  { title: 'Today & Beyond', getDesc: () => "Today, our alumni include doctors, engineers, entrepreneurs, lawyers, and public servants across Nigeria and abroad. They are living proof that the right education changes everything. And we're just getting started." },
]

export const missionText = "To deliver a holistic, world-class education that nurtures intellectual curiosity, builds strong character, and empowers every student to reach their full potential — preparing them not just for exams, but for life."
export const visionText = "To be the leading educational institution in the region — recognized for academic excellence, innovative teaching, and producing graduates who are confident, compassionate, and equipped to lead in a rapidly changing world."

export const coreValues: CoreValue[] = [
  { title: 'Excellence', desc: 'We chase the highest standards in academics, sports, and character. Good enough is never enough — outstanding is our baseline.', iconName: 'excellence' },
  { title: 'Integrity', desc: 'Honesty and responsibility are non-negotiable. We teach students to do the right thing — even when nobody is watching.', iconName: 'integrity' },
  { title: 'Innovation', desc: 'We embrace modern teaching methods, technology integration, and creative problem-solving to keep education dynamic and relevant.', iconName: 'innovation' },
  { title: 'Compassion', desc: 'Every child matters. We foster a warm, inclusive culture where students feel seen, valued, and supported by their peers and teachers.', iconName: 'compassion' },
  { title: 'Lifelong Learning', desc: 'We spark a passion for knowledge that outlasts any syllabus. Our graduates leave as curious, self-driven learners ready for the world.', iconName: 'learning' },
  { title: 'Community', desc: 'Parents, teachers, and students form a strong partnership. Together we create a network that uplifts and empowers everyone within it.', iconName: 'community' },
]

export const approachItems: ApproachItem[] = [
  { title: 'Small Class Sizes', desc: 'Maximum 25 students per class ensures every child gets personal attention.' },
  { title: 'Enriched Curriculum', desc: 'Nigerian syllabus enhanced with STEM, coding, arts, and leadership programmes.' },
  { title: 'Character Education', desc: 'Weekly assemblies, mentorship, and community service build integrity and resilience.' },
  { title: 'Parent Partnership', desc: 'Real-time digital portal, termly meetings, and open-door communication policy.' },
  { title: 'Continuous Assessment', desc: 'Regular evaluations through projects, tests, practicals, and class participation.' },
]

export const aboutCtaContent = (name: string) => ({
  headline: "Come see what makes\nus different",
  description: `Words and photos can only say so much. Visit our campus, meet our teachers, watch our students in action — and experience the ${name} difference for yourself.`,
})

// ══════════════════════════════════════════════
// ADMISSIONS PAGE
// ══════════════════════════════════════════════

export const admissionsHeroContent = (name: string) => ({
  badge: 'Now Accepting Applications — 2025/2026',
  headline: "Your child's journey",
  headlineSub: 'starts here',
  description: `Joining ${name} is the first step toward an exceptional education. Our admissions process is simple, transparent, and family-friendly.`,
})

export const admissionSteps: AdmissionStep[] = [
  { step: '01', title: 'Enquire', desc: 'Visit our campus or contact us to learn about our programmes and fee structure.', iconName: 'enquire' },
  { step: '02', title: 'Apply', desc: 'Complete the application form online or at our front office.', iconName: 'apply' },
  { step: '03', title: 'Documents', desc: 'Submit birth certificate, school reports, photos, and health records.', iconName: 'documents' },
  { step: '04', title: 'Assessment', desc: 'Brief assessment for your child. Family interview may be scheduled.', iconName: 'assessment' },
  { step: '05', title: 'Enrol', desc: 'Receive your offer letter, pay fees, and welcome to the family!', iconName: 'enrol' },
]

export const includedItems: IncludedItem[] = [
  { title: 'Quality Curriculum', desc: 'A well-rounded programme that meets and exceeds national standards with international enrichment in STEM and the arts.', iconName: 'curriculum' },
  { title: 'Meals & Nutrition', desc: 'Balanced, freshly prepared meals daily to keep students energised and focused throughout the school day.', iconName: 'meals' },
  { title: 'School Transport', desc: 'Safe, reliable bus service covering major routes across the city with GPS tracking and trained drivers.', iconName: 'transport' },
  { title: 'Health & Wellness', desc: 'On-site nurse, regular check-ups, first-aid facilities, and a clean, hygienic campus environment.', iconName: 'health' },
  { title: 'Technology Access', desc: 'Modern computer labs, digital learning tools, and a parent/student portal for real-time progress tracking.', iconName: 'technology' },
  { title: 'Extra-Curricular', desc: 'Clubs, sports teams, competitions, and enrichment programmes — all included at no extra cost.', iconName: 'extracurricular' },
]

export const requiredDocs: string[] = [
  'Birth certificate or age declaration',
  'Previous school reports (if applicable)',
  'Four passport-sized photographs',
  'Immunization / health records',
  'Completed application form',
  'Transfer certificate (for transfers)',
]

export const ageRequirements: AgeRequirement[] = [
  { level: 'Pre-Nursery', age: '2 – 3 years' },
  { level: 'Nursery', age: '3 – 5 years' },
  { level: 'Primary', age: '5 – 11 years' },
  { level: 'Junior Secondary', age: '11 – 14 years' },
  { level: 'Senior Secondary', age: '14 – 18 years' },
]

export const admissionsCtaContent = (name: string) => ({
  badge: 'Spaces are limited',
  headline: "Start your child's\njourney today",
  description: `Spaces fill up quickly each term. Don't wait — reach out today and let us welcome your family to ${name}.`,
})

// ══════════════════════════════════════════════
// FAQ PAGE
// ══════════════════════════════════════════════

export const faqCategories: FAQCategory[] = [
  { name: 'Admissions', iconName: 'faqAdmissions', color: '#3A7D44' },
  { name: 'Academics', iconName: 'faqAcademics', color: '#2E5090' },
  { name: 'Campus Life', iconName: 'faqCampus', color: '#0891B2' },
  { name: 'Fees & Policies', iconName: 'faqFees', color: '#7C3AED' },
  { name: 'General', iconName: 'faqGeneral', color: '#EA580C' },
]

export const faqs: FAQItem[] = [
  { q: 'How do I apply for admission?', a: 'Admissions are done online via our website or at our front office. Fill out the application form and submit the required documents including birth certificate, previous school reports, and passport photographs. Once reviewed, our admissions team will schedule an interview with you and your child.', cat: 'Admissions' },
  { q: 'What curriculum do you follow?', a: 'We follow the Nigerian curriculum augmented with international best practices to offer a well-rounded education that prepares students for both local and global opportunities. Our programme is enriched with STEM, arts, and leadership development.', cat: 'Academics' },
  { q: 'What age groups do you accept?', a: 'We accept students from Nursery to Secondary level, typically starting from age 3 to 18. Each level has specific entry requirements that will be shared during the admission process.', cat: 'Admissions' },
  { q: 'How are students assessed?', a: 'Students are assessed through continuous assessments and exams. We prioritize individual growth and development, using a combination of written tests, projects, practical evaluations, and class participation.', cat: 'Academics' },
  { q: 'What extracurricular activities are available?', a: 'We offer sports (football, basketball, athletics), arts (drama, music, visual arts), academic clubs (debate, science, coding), and community service opportunities to help students develop well-rounded skills.', cat: 'Campus Life' },
  { q: 'Is the campus secure?', a: 'Yes, our campus has 24/7 security personnel, CCTV surveillance, and secure access control at all entry points. We maintain a strict visitor policy and conduct regular safety drills. Student safety is our top priority.', cat: 'Campus Life' },
  { q: 'What documents are needed for enrollment?', a: 'You will need a birth certificate, previous school reports (if applicable), passport photographs, immunization records, and a completed application form. International students may need additional documentation.', cat: 'Admissions' },
  { q: 'Do you offer extra lessons or tutoring?', a: "Yes, we offer after-school tutoring and extra lessons for students who need additional support. These sessions are coordinated with class teachers and are available at no extra cost for enrolled students.", cat: 'Academics' },
  { q: 'What are the school fees?', a: 'School fees vary by class level and include tuition, learning materials, and access to all standard facilities. Please contact our admissions office or visit our fees page for detailed fee structures and payment plans.', cat: 'Fees & Policies' },
  { q: 'Are there payment plans available?', a: "Yes, we offer flexible payment plans including termly payments and installment options. Please speak with our accounts department for arrangements that suit your family's needs.", cat: 'Fees & Policies' },
  { q: 'What are the school hours?', a: 'School runs from 8:00 AM to 3:00 PM on weekdays. After-school activities and clubs run from 3:00 PM to 4:30 PM. The school bus departs at 3:15 PM and 4:45 PM.', cat: 'Campus Life' },
  { q: 'What is your refund policy?', a: 'Refund requests must be made within the first two weeks of the term. A processing fee may apply. Full details about our refund and withdrawal policies are available in our student handbook.', cat: 'Fees & Policies' },
  { q: 'How can I contact the school?', a: 'You can reach us through our website contact form, by phone during office hours (Monday\u2013Friday, 7:30 AM \u2013 4:00 PM), by email, or by visiting our campus. Our administrative staff are happy to assist.', cat: 'General' },
  { q: 'Do you provide school transportation?', a: 'Yes, we offer school bus services covering major routes within the city. Transportation fees are separate from tuition. Route details and schedules are available at the admin office.', cat: 'General' },
  { q: 'Is there a school uniform?', a: 'Yes, all students are required to wear the official school uniform. Uniforms can be purchased from our school store. Details about the dress code are provided during the enrollment process.', cat: 'General' },
]

// ══════════════════════════════════════════════
// CONTACT PAGE
// ══════════════════════════════════════════════

export const contactHeroContent = () => ({
  badge: "We'd love to hear from you",
  headline: 'Get in',
  headlineSub: 'touch with us',
  description: "Have a question about admissions, fees, or our programmes? Our team is here to help you every step of the way.",
})

export const officeHours: OfficeHour[] = [
  { day: 'Monday – Friday', time: '7:30 AM – 4:00 PM' },
  { day: 'Saturday', time: '9:00 AM – 1:00 PM', note: 'Admissions only' },
  { day: 'Sunday & Public Holidays', time: 'Closed' },
]

export const visitReasons: VisitReason[] = [
  { title: 'Campus Tour', desc: 'Walk through our classrooms, labs, and play areas with a dedicated guide.', iconName: 'campusTour' },
  { title: 'Meet Teachers', desc: 'Have a conversation with our experienced and passionate educators.', iconName: 'meetTeachers' },
  { title: 'See Facilities', desc: 'Explore our modern library, sports grounds, labs, and wellness centre.', iconName: 'seeFacilities' },
  { title: 'Ask Questions', desc: 'Get answers about admissions, fees, curriculum, and everything else.', iconName: 'askQuestions' },
]

export const contactCtaContent = (name: string) => ({
  badge: 'Our doors are always open',
  headline: 'We look forward to\nmeeting you',
  description: `Whether you're a prospective parent, a member of the community, or a partner — we welcome you to visit ${name} and experience our learning environment.`,
})

// ══════════════════════════════════════════════
// SHARED IMAGES
// ══════════════════════════════════════════════

export const images = {
  homeHeroGrid: [
    { src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80', alt: 'Campus' },
    { src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80', alt: 'Students' },
    { src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80', alt: 'Learning' },
    { src: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80', alt: 'Activities' },
  ],
  aboutHero: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80',
  aboutStory: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
  aboutApproach: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80',
  aboutStrip: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
  admissionsHero: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1600&q=80',
  faqHero: 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=1600&q=80',
  contactHero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
  contactOfficeHours: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
}
