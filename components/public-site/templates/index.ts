import type { PublicSchool, SitePage } from '../../../lib/types';
import type { ComponentType } from 'react';

import ClassicHome from './classic/HomePage';
import ClassicAbout from './classic/AboutPage';
import ClassicFAQ from './classic/FAQPage';
import ClassicAdmissions from './classic/AdmissionsPage';
import ClassicContact from './classic/ContactPage';
import ClassicNews from './classic/NewsPage';

import ModernHome from './modern/HomePage';
import ModernAbout from './modern/AboutPage';
import ModernFAQ from './modern/FAQPage';
import ModernAdmissions from './modern/AdmissionsPage';
import ModernContact from './modern/ContactPage';
import ModernNews from './modern/NewsPage';

import BoldHome from './bold/HomePage';
import BoldAbout from './bold/AboutPage';
import BoldFAQ from './bold/FAQPage';
import BoldAdmissions from './bold/AdmissionsPage';
import BoldContact from './bold/ContactPage';
import BoldNews from './bold/NewsPage';

import EditorialHome from './editorial/HomePage';
import EditorialAbout from './editorial/AboutPage';
import EditorialFAQ from './editorial/FAQPage';
import EditorialAdmissions from './editorial/AdmissionsPage';
import EditorialContact from './editorial/ContactPage';
import EditorialNews from './editorial/NewsPage';

import PrestigeHome from './prestige/HomePage';
import PrestigeAbout from './prestige/AboutPage';
import PrestigeFAQ from './prestige/FAQPage';
import PrestigeAdmissions from './prestige/AdmissionsPage';
import PrestigeContact from './prestige/ContactPage';
import PrestigeNews from './prestige/NewsPage';

type PageComponent = ComponentType<{ school: PublicSchool; sitePage?: SitePage }>;
type TemplateName = 'classic' | 'modern' | 'bold' | 'editorial' | 'prestige';

export const TEMPLATE_SLUGS = ['home', 'about', 'faq', 'admissions', 'news', 'contact'];

const templates: Record<TemplateName, Record<string, PageComponent>> = {
  classic: {
    home: ClassicHome,
    about: ClassicAbout,
    faq: ClassicFAQ,
    admissions: ClassicAdmissions,
    news: ClassicNews,
    contact: ClassicContact,
  },
  modern: {
    home: ModernHome,
    about: ModernAbout,
    faq: ModernFAQ,
    admissions: ModernAdmissions,
    news: ModernNews,
    contact: ModernContact,
  },
  bold: {
    home: BoldHome,
    about: BoldAbout,
    faq: BoldFAQ,
    admissions: BoldAdmissions,
    news: BoldNews,
    contact: BoldContact,
  },
  editorial: {
    home: EditorialHome,
    about: EditorialAbout,
    faq: EditorialFAQ,
    admissions: EditorialAdmissions,
    news: EditorialNews,
    contact: EditorialContact,
  },
  prestige: {
    home: PrestigeHome,
    about: PrestigeAbout,
    faq: PrestigeFAQ,
    admissions: PrestigeAdmissions,
    news: PrestigeNews,
    contact: PrestigeContact,
  },
};


export function getTemplatePage(school: PublicSchool, page: string): PageComponent {
  const templateName = (school.siteConfig?.template || 'prestige') as TemplateName;
  const template = templates[templateName] || templates.prestige;
  return template[page] || templates.prestige[page];
}

export function getTemplateHome(school: PublicSchool): PageComponent {
  return getTemplatePage(school, 'home');
}
