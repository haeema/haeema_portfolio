import type { IconName } from './components/Icon'

export const profile = {
  name: 'Haeema R Nathan',
  roles: [
    'Wedding Decorator',
    'Jewellery Owner',
    'Brand Positioning Expert',
    'Digital Marketing Expert',
  ],
  role: 'Wedding Decorator · Jewellery Owner · Brand Positioning Expert · Digital Marketing Expert',
  location: 'Bengaluru, India',
  email: 'haeemaeg@gmail.com',
  phone: '+91 78292 81118',
  phoneHref: 'tel:+917829281118',
  whatsappHref: 'https://wa.me/917829281118',
  years: 13,
}

export const pillars: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'diamond',
    title: 'A Distinctive Identity',
    body: 'Create a visual and emotional identity that people instantly recognise and remember.',
  },
  {
    icon: 'target',
    title: 'Thoughtful Brand Positioning',
    body: 'Position your work with clarity so the right audience understands its value and connects with it.',
  },
  {
    icon: 'heart',
    title: 'Experiences That Stay',
    body: 'From the wedding venue to the smallest jewellery detail, create moments that people remember long after the celebration.',
  },
]

export const stats = [
  { value: '13+', unit: 'yrs', label: 'Wedding & Creative Industry Experience' },
  { value: '2', unit: '', label: 'Creative Business Verticals' },
  { value: 'Wedding', unit: '', label: 'Décor & Experiences' },
  { value: 'Jewellery', unit: '', label: 'Curated & Crafted Pieces' },
]

export const creations: {
  icon: IconName
  title: string
  body: string
  cta: string
  tone: 'blush' | 'plum'
}[] = [
  {
    icon: 'flower',
    title: 'Wedding Décor',
    body: 'Transforming wedding spaces into elegant, immersive experiences that become part of the celebration’s story.',
    cta: 'Explore Décor',
    tone: 'blush',
  },
  {
    icon: 'ring',
    title: 'Jewellery',
    body: 'Timeless jewellery curated for meaningful occasions, designed to complement the moments that matter most.',
    cta: 'Explore Jewellery',
    tone: 'plum',
  },
]

/** The four elements she brings together, as named in her positioning statement. */
export const positioningElements = [
  'Visual identity',
  'Storytelling',
  'Audience perception',
  'Positioning',
]

export const experience: { icon: IconName; title: string; body: string }[] = [
  { icon: 'palette', title: 'Design', body: 'Creating visually distinctive experiences.' },
  {
    icon: 'sparkle',
    title: 'Detail',
    body: 'Paying attention to the elements that make a celebration special.',
  },
  {
    icon: 'target',
    title: 'Positioning',
    body: 'Building an identity that people recognise, remember and connect with.',
  },
]

export const expertise: { icon: IconName; title: string; items: string[] }[] = [
  {
    icon: 'megaphone',
    title: 'Meta Advertising',
    items: [
      'Facebook & Instagram Ads',
      'Lead Generation Campaigns',
      'Audience Targeting',
      'Creative Testing',
      'Campaign Optimization',
      'Retargeting Strategies',
    ],
  },
  {
    icon: 'reel',
    title: 'Instagram Marketing',
    items: [
      'Content Strategy',
      'Reels Strategy',
      'Wedding Portfolio Marketing',
      'Engagement Growth',
      'Brand Storytelling',
      'Content Planning',
    ],
  },
  {
    icon: 'search',
    title: 'SEO',
    items: [
      'Keyword Research',
      'On-page SEO',
      'Content Optimization',
      'Local SEO',
      'Search Visibility',
    ],
  },
  {
    icon: 'palette',
    title: 'Creative Marketing',
    items: [
      'Canva Design',
      'Ad Creatives',
      'Social Media Graphics',
      'Video Marketing Concepts',
      'Wedding Campaign Concepts',
      'Emotional Storytelling',
    ],
  },
]

export const coreSkills = [
  'Meta Ads & Lead Generation',
  'Facebook & Instagram Marketing',
  'Social Media Strategy',
  'SEO',
  'Content Marketing',
  'Canva & Creative Design',
  'Digital Brand Building',
  'Lead Generation Campaigns',
  'Audience Targeting',
  'Campaign Optimization',
  'Wedding Industry Marketing',
  'Client Acquisition Strategy',
  'Visual Storytelling',
  'Social Media Content Planning',
]
