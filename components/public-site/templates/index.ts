import type { PublicSchool, SitePage } from '../../../lib/types';
import type { ComponentType } from 'react';

import ClassicHome from './classic/HomePage';
import ClassicAbout from './classic/AboutPage';
import ClassicFAQ from './classic/FAQPage';
import ClassicAdmissions from './classic/AdmissionsPage';
import ClassicContact from './classic/ContactPage';

import ModernHome from './modern/HomePage';
import ModernAbout from './modern/AboutPage';
import ModernFAQ from './modern/FAQPage';
import ModernAdmissions from './modern/AdmissionsPage';
import ModernContact from './modern/ContactPage';

import BoldHome from './bold/HomePage';
import BoldAbout from './bold/AboutPage';
import BoldFAQ from './bold/FAQPage';
import BoldAdmissions from './bold/AdmissionsPage';
import BoldContact from './bold/ContactPage';

type PageComponent = ComponentType<{ school: PublicSchool; sitePage?: SitePage }>;
type TemplateName = 'classic' | 'modern' | 'bold';

export const TEMPLATE_SLUGS = ['home', 'about', 'faq', 'admissions', 'contact'];

const templates: Record<TemplateName, Record<string, PageComponent>> = {
  classic: {
    home: ClassicHome,
    about: ClassicAbout,
    faq: ClassicFAQ,
    admissions: ClassicAdmissions,
    contact: ClassicContact,
  },
  modern: {
    home: ModernHome,
    about: ModernAbout,
    faq: ModernFAQ,
    admissions: ModernAdmissions,
    contact: ModernContact,
  },
  bold: {
    home: BoldHome,
    about: BoldAbout,
    faq: BoldFAQ,
    admissions: BoldAdmissions,
    contact: BoldContact,
  },
};


export function getTemplatePage(school: PublicSchool, page: string): PageComponent {
  const templateName = (school.siteConfig?.template || 'classic') as TemplateName;
  const template = templates[templateName] || templates.classic;
  return template[page] || templates.classic[page];
}

export function getTemplateHome(school: PublicSchool): PageComponent {
  return getTemplatePage(school, 'home');
}
