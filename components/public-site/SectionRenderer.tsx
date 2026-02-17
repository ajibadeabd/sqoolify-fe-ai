import {
  SectionType,
  type PageSection,
  type PublicSchool,
  type HeroSectionContent,
  type TextSectionContent,
  type FeaturesSectionContent,
  type GallerySectionContent,
  type ContactSectionContent,
  type CTASectionContent,
} from '../../lib/types';
import HeroSection from './sections/HeroSection';
import TextSection from './sections/TextSection';
import FeaturesSection from './sections/FeaturesSection';
import GallerySection from './sections/GallerySection';
import ContactSection from './sections/ContactSection';
import CTASection from './sections/CTASection';

export default function SectionRenderer({
  section,
  school,
}: {
  section: PageSection;
  school: PublicSchool;
}) {
  if (section.isVisible === false) return null;

  switch (section.type) {
    case SectionType.HERO:
      return <HeroSection content={section.content as HeroSectionContent} school={school} />;
    case SectionType.TEXT:
      return <TextSection content={section.content as TextSectionContent} />;
    case SectionType.FEATURES:
      return <FeaturesSection content={section.content as FeaturesSectionContent} school={school} />;
    case SectionType.GALLERY:
      return <GallerySection content={section.content as GallerySectionContent} />;
    case SectionType.CONTACT:
      return <ContactSection content={section.content as ContactSectionContent} school={school} />;
    case SectionType.CTA:
      return <CTASection content={section.content as CTASectionContent} />;
    default:
      return null;
  }
}
