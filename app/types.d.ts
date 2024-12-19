export interface HeaderProps {
  id: number;
  logoLink: LogoLink;
  navItems: Link[];
  buttonLink: Link;
  baseUrl: string;
}

export interface FooterProps {
  id: number;
  copyRight: string;
  navItems: Link[];
  socialLinks: LogoLink[];
  baseUrl: string;
}

export interface HeroProps {
  id: number;
  title: string;
  description: string;
  buttonLinks: Link[];
  image: Image;
  baseUrl: string;
}

export interface Hero2Props {
  id: number;
  title: string;
  description: string;
  buttonLinks: Link[];
  images: Image[];
  baseUrl: string;
}

export interface LogoCloudProps {
  id: number;
  title: string;
  images: Image[];
  baseUrl: string;
}

export interface FeaturesProps {
  id: number;
  title: string;
  description: string;
  features: Feature[];
  baseUrl: string;
}

export interface DetailedFeaturesProps {
  id: number;
  title: string;
  info: string;
  description: string;
  features: Feature[];
  image: Image;
  baseUrl: string;
}

export interface CallToActionProps {
  id: number;
  title1: string;
  title2: string;
  description: string;
  buttonLinks: Link[];
  baseUrl: string;
}

export interface TestimonialsProps {
  id: number;
  title: string;
  description: string;
  testimonies: Testimony[];
  baseUrl: string;
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
  baseUrl: string;
}

export interface Content2Props {
  id: number;
  title: string;
  description: string;
  sections: { title: string; description: string }[];
  baseUrl: string;
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
  baseUrl: string;
}

export interface StatsProps {
  id: number;
  title: string;
  description: string;
  stats: { id: number; title: string; description: string }[];
}

export interface Hero3Props {
  id: number;
  title: string;
  description: string;
  buttonLinks: Link[];
  baseUrl: string;
}

export interface Features2Props {
  id: number;
  title1: string;
  title2: string;
  description: string;
  features: Feature[];
  baseUrl: string;
}

export interface Features3Props {
  id: number;
  title1: string;
  title2: string;
  description: string;
  features: Feature[];
  image: Image;
  baseUrl: string;
}

export interface Features4Props {
  id: number;
  title1: string;
  title2: string;
  description: string;
  features: Feature[];
  image: Image;
  baseUrl: string;
}

export interface BlogsProps {
  id: number;
  title: string;
  description: string;
  posts: Post[];
  baseUrl: string;
}

export interface Post {
  id: number;
  title: string;
  coverImage: Image;
  publishedAt: string;
  href: string;
  author: {
    name: string;
    image: Image;
  };
}

export interface Location {
  id?: number;
  documentId?: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  branch?: Branch;
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

// Admin Panel
export interface Customer {
  id?: number;
  documentId?: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  address: string;
  email: string;
  phone: string;
}

export interface Branch {
  id?: number;
  documentId?: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
}

// // Forms

// Form Errors
export type FieldError = {
  message: string;
  type: string;
};

export type CustomerFormErrors = {
  apiError?: {
    message: string;
    type: string;
  };
  firstName?: FieldError;
  lastName?: FieldError;
  email?: FieldError;
  phone?: FieldError;
  country?: FieldError;
  city?: FieldError;
  address?: FieldError;
};

export type BranchFormErrors = {
  apiError?: {
    message: string;
    type: string;
  };
  name?: FieldError;
  email?: FieldError;
  phone?: FieldError;
  country?: FieldError;
  city?: FieldError;
  address?: FieldError;
};

// Form Data Types
export type CustomerData = Omit<Customer, "id" | "documentId"> & {
  id?: string | number;
  documentId?: string;
};

export type BranchData = Omit<Branch, "id" | "documentId"> & {
  id?: string | number;
  documentId?: string;
};

// Add strict typing for API responses
export interface ApiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Add table-specific types
export interface TableItem {
  id?: number;
  [key: string]: any;
}

// Add Location form errors
export type LocationFormErrors = {
  apiError?: {
    message: string;
    type: string;
  };
  name?: FieldError;
  latitude?: FieldError;
  longitude?: FieldError;
  address?: FieldError;
};

// Add Location form data type
export type LocationData = {
  id?: string | number;
  documentId?: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
};

export interface PackageType {
  id?: number;
  documentId?: string;
  name: string;
  maxWeight: number;
}

export interface Package {
  id?: number;
  documentId?: string;
  shipment?: Shipment;
  content: string;
  netWeight: number;
  packageCost: number;
  packageStatus: string;
  packageType: PackageType | null;
  pricePerKg: number;
  value: number;
}

export interface Address {
  id?: number;
  documentId?: string;
  country: string;
  state: string;
  city: string;
  zipCode: number;
}

export interface Shipment {
  id?: number;
  documentId?: string;
  trackingNumber: string;
  sender: Customer;
  receiver: Customer;
  packages: Package[];
  originAddress: Address;
  destinationAddress: Address;
  branch: Branch;
  shipmentStatus: string;
  shippingDate: string;
  deliveryDate: string;
  shipmentType: string;
  transferMode: string;
  shipmentCost: number;
}

export interface Tracking {
  id?: number;
  documentId?: string;
  shipment: Shipment;
  shipmentStatus: string;
  location: Location;
  createdAt?: string;
}

export interface PaginationMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}
