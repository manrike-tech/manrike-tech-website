/**
 * Site identity and personal settings.
 *
 * Everything personal lives here or in src/content/cv/. Empty strings are
 * treated as "not configured" and the related UI is hidden, so nothing is
 * published until it is filled in deliberately.
 */
interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  locale: string;
  author: { name: string; jobTitle: string };
  social: { github: string; linkedin: string; email: string };
  cvPdf: { en: string; es: string };
  repository: string;
  postsPerPage: number;
}

export const siteConfig: SiteConfig = {
  name: 'Manrike-Tech',
  tagline: 'Infrastructure, DevOps and security engineering notes',
  description:
    'Technical blog, knowledge base and portfolio covering Linux and Windows, virtualization, networking and firewalls, Kubernetes, DevOps, monitoring, cybersecurity and cloud architecture.',
  locale: 'en',

  author: {
    // PLACEHOLDER: set your public name to use it in metadata and the CV.
    name: '',
    // PLACEHOLDER: e.g. "Infrastructure Engineer". Left empty until confirmed.
    jobTitle: '',
  },

  social: {
    // Derived from the repository remote (github.com/manrike-tech).
    github: 'https://github.com/manrike-tech',
    // PLACEHOLDER: full profile URL, e.g. https://www.linkedin.com/in/<handle>/
    linkedin: '',
    // PLACEHOLDER: only shown when explicitly set.
    email: '',
  },

  // PLACEHOLDER: path of a PDF placed in public/, e.g. "/cv/cv-en.pdf".
  // When empty, the CV page offers a print-friendly version instead.
  cvPdf: {
    en: '',
    es: '',
  },

  // Repository that hosts this site's source; used for "edit this page" links.
  repository: 'https://github.com/manrike-tech/manrike-tech-website',

  postsPerPage: 8,
};

export const navigation = [
  { label: 'Blog', href: '/blog/' },
  { label: 'Notes', href: '/notes/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'About / CV', href: '/cv/' },
] as const;
