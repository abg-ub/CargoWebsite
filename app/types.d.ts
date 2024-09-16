import { Section } from "@jridgewell/trace-mapping";

export interface HeaderProps {
  id: number;
  logoLink: LogoLink;
  navItems: Link[];
  buttonLink: Link;
}

export interface FooterProps {
  id: number;
  copyRight: string;
  navItems: Link[];
  socialLinks: Link[];
}

export interface HeroProps {
  id: number;
  title: string;
  description: string;
  buttonLinks: Link[];
  image: Image;
}

export interface Hero2Props {
  id: number;
  title: string;
  description: string;
  buttonLinks: Link[];
  images: Image[];
}

export interface LogoCloudProps {
  id: number;
  title: string;
  images: Image[];
}

export interface FeaturesProps {
  id: number;
  title: string;
  description: string;
  features: Feature[];
}

export interface DetailedFeaturesProps {
  id: number;
  title: string;
  info: string;
  description: string;
  features: Feature[];
  image: Image;
}

export interface CallToActionProps {
  id: number;
  title1: string;
  title2: string;
  description: string;
  buttonLinks: Link[];
}

export interface TestimonialsProps {
  id: number;
  title: string;
  description: string;
  testimonies: Testimony[];
}

export interface ContentProps {
  id: number;
  title1: string;
  title2: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  paragraph4: string;
  image: Image;
  buttonLink: Link;
}

export interface Content2Props {
  id: number;
  title: string;
  description: string;
  sections: { title: string; description: string }[];
}

export interface TeamProps {
  id: number;
  title: string;
  description: string;
  teamMembers: {
    id: number;
    name: string;
    role: string;
    address: string;
    image: Image;
  }[];
}

export interface Testimony {
  id: number;
  text: string;
  name: string;
  handle: string;
  image: Image;
  logo: Image;
  isFeatured: boolean;
}

export interface FAQProps {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: number;
  question: string;
  answer: string;
}

export interface Feature {
  id: number;
  name: string;
  description: string;
  href: string;
  logo: Image;
}

export interface LogoLink {
  id: number;
  href: string;
  isExternal: boolean;
  image: Image;
}

export interface Image {
  id: number;
  url: string;
  alternativeText: string;
}

export interface Link {
  id: number;
  title: string;
  href: string;
  isExternal: boolean;
}

export interface PageData {
  id: number;
  title: string;
  description: string;
  blocks: [];
}
