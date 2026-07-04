/**
 * Central wedding configuration.
 *
 * This is the ONLY place couple-specific data lives. Every component reads
 * from this object, so the whole site can be reskinned for a new couple by
 * editing this single file (and swapping the media assets in /public/media).
 */

export interface FunctionTheme {
  /** Bright motif color — drives scenes, patterns, monograms */
  primary: string
  /** Gold accent for ornaments, frames, buttons */
  accent: string
  /** Deep cinematic background gradient: edge color… */
  bgFrom: string
  /** …and the lit center color */
  bgTo: string
  /** Name of the SVG background pattern to render (see src/theme/patterns.tsx) */
  backgroundPattern: 'mandala' | 'paisley' | 'floral' | 'jaali' | 'marigold'
  /** Ambient animated decoration layered over the section (see src/components/decorations.tsx) */
  decoration: 'marigold-petals' | 'henna-vine' | 'gold-particles' | 'none'
}

export interface WeddingFunction {
  id: string
  name: string
  /** Human-readable date shown to guests */
  date: string
  /** Human-readable time shown to guests */
  time: string
  /** Machine-readable start/end — drives countdown + Add to Calendar (.ics) */
  startISO: string
  endISO: string
  venueName: string
  venueAddress: string
  mapsUrl: string
  dressCode: string
  description: string
  /** Optional longer story paragraph (used by the Engagement section) */
  story?: string
  /** Optional photos for this function (site-root-relative paths) */
  photos?: string[]
  /** The grandest section — larger type, countdown, couple photo */
  hero?: boolean
  /** Illustrated couple avatar for this function (site-root-relative path) */
  avatar?: string
  theme: FunctionTheme
}

export interface StoryChapter {
  /** Small eyebrow label, e.g. a year or "The First Hello" date */
  label: string
  title: string
  text: string
  /** Optional photo for this chapter (site-root-relative path) */
  photo?: string
}

export interface LoveStory {
  eyebrow: string
  title: string
  chapters: StoryChapter[]
  theme: {
    accent: string
    bgFrom: string
    bgTo: string
  }
}

export interface Faq {
  q: string
  a: string
}

export interface Hotel {
  name: string
  note: string
  mapsUrl: string
}

export interface ContactPerson {
  name: string
  role: string
  /** Phone with country code, digits only — used for tel: and wa.me links */
  phone: string
}

export interface GuestInfo {
  eyebrow: string
  title: string
  /** Routes, transport advice, and common questions */
  faqs: Faq[]
  hotels: Hotel[]
  contacts: ContactPerson[]
  theme: {
    accent: string
    bgFrom: string
    bgTo: string
  }
}

export interface SlideTheme {
  accent: string
  bgFrom: string
  bgTo: string
}

/** Optional slides that can be toggled per invite link */
export type ExtraSlideId = 'story' | 'photobook' | 'info' | 'wishes'

/**
 * A shareable invitation variant. Guests opening
 * `https://<site>/?invite=<slug>` see only the listed functions (plus the
 * chosen extra slides and RSVP). Ad-hoc combinations also work without a
 * preset: `?events=haldi,wedding&extras=story,info`.
 *
 * This is intentionally a plain lookup table so a future admin backend
 * (e.g. Supabase) can replace it: resolveInvite() in src/invite.ts is the
 * single place that turns a URL into an invite definition.
 */
export interface InvitePreset {
  /** URL slug, e.g. "cocktail" → /?invite=cocktail */
  slug: string
  label: string
  /** Function ids to include, in display order */
  functions: string[]
  /** Extra slides to include; omit to include all */
  extras?: ExtraSlideId[]
}

export interface Photobook {
  eyebrow: string
  title: string
  /** Caption under the book. Photos are auto-loaded from src/photobook/ */
  note: string
  theme: SlideTheme
}

export interface Guestbook {
  eyebrow: string
  title: string
  prompt: string
  /** Maximum message length, in words */
  maxWords: number
  theme: SlideTheme
}

export interface WeddingConfig {
  couple: {
    bride: string
    groom: string
  }
  /** The couple's story, narrated as a timeline slide */
  loveStory: LoveStory
  /** FAQs, stay, travel and contact details for guests */
  guestInfo: GuestInfo
  /** Digital photobook — drop images into src/photobook/ */
  photobook: Photobook
  /** Guests leave a message for the couple */
  guestbook: Guestbook
  /** Named invitation variants for shareable links (see InvitePreset) */
  invites: InvitePreset[]
  /** Main couple photo, used in the hero (wedding) section's arched frame */
  couplePhoto: string
  tagline: string
  hashtag: string
  /** Path (relative to site root) of the intro/entry video */
  entryVideo: string
  /** Path (relative to site root) of the background music track */
  music: string
  functions: WeddingFunction[]
  rsvp: {
    title: string
    message: string
    /** WhatsApp number (with country code, digits only) guests can RSVP to */
    whatsappNumber: string
  }
  footer: {
    message: string
    familyLine: string
  }
}

export const weddingConfig: WeddingConfig = {
  couple: {
    bride: 'Diya',
    groom: 'Abhishek',
  },
  couplePhoto: '/media/photos/couple-main.jpeg',
  loveStory: {
    eyebrow: 'Every love has a beginning',
    title: 'Our Story',
    chapters: [
      {
        label: '2019 · Chandigarh',
        title: 'The First Hello',
        text: 'A friend’s sangeet, one borrowed dance partner, and a conversation that refused to end. Abhi forgot the steps; Diya pretended not to notice.',
        photo: '/media/photos/story-1.jpeg',
      },
      {
        label: '2021 · Two Cities',
        title: 'Long Distance, Longer Calls',
        text: 'Between Delhi deadlines and Chandigarh winters, we wore out two phone batteries a day and learnt that home is a person, not a place.',
        photo: '/media/photos/story-2.jpeg',
      },
      {
        label: '2023 · Kasauli',
        title: 'The Question',
        text: 'On a hilltop terrace at sunset, Abhi went down on one knee. Diya said yes before he finished the sentence.',
        photo: '/media/photos/story-3.jpeg',
      },
      {
        label: '2026 · Forever',
        title: 'The Beginning',
        text: 'And now, with both families and all our people around us, we begin the rest of the story. We saved you a seat.',
      },
    ],
    theme: {
      accent: '#E8CF7A',
      bgFrom: '#140A26',
      bgTo: '#3B2160',
    },
  },
  guestInfo: {
    eyebrow: 'Travel, stay & everything else',
    title: 'Good to Know',
    faqs: [
      {
        q: 'How do I reach the wedding venue?',
        a: 'The Grand Palace Lawns is on Madhya Marg, New Chandigarh. From Shaheed Bhagat Singh International Airport it is a 40-minute drive (22 km); from Chandigarh Junction railway station about 25 minutes (12 km). Uber/Ola work reliably, and prepaid taxis are available at both.',
      },
      {
        q: 'Will there be shuttles between functions?',
        a: 'Yes — a shuttle leaves from the Hotel Mountview lobby 90 and 45 minutes before every function, and returns until 1 AM on the wedding and cocktail nights. No booking needed, just hop in.',
      },
      {
        q: 'Is parking available at the venues?',
        a: 'Valet parking is available at the Engagement, Cocktail Night and Wedding venues. For the Haldi at the family home in Sector 9, street parking is limited — we recommend the shuttle or a cab.',
      },
      {
        q: 'What will the weather be like?',
        a: 'Chandigarh in late November is crisp — pleasant days around 22°C and chilly evenings near 8°C. Do carry a shawl or jacket for the outdoor evening functions.',
      },
      {
        q: 'What about gifts?',
        a: 'Your presence (and your dance moves) are the only gifts we need. If you insist, a warm hug and a photo with us will do just fine.',
      },
    ],
    hotels: [
      {
        name: 'Hotel Mountview',
        note: 'Our guest block in Sector 10 — mention "AbhiDiya Wedding" for reserved rates. All shuttles start here.',
        mapsUrl: 'https://maps.google.com/?q=Hotel+Mountview+Sector+10+Chandigarh',
      },
      {
        name: 'Lemon Tree, Elante',
        note: 'Comfortable stay next to Elante Mall, 15 minutes from the venues — limited rooms, book by 1 November.',
        mapsUrl: 'https://maps.google.com/?q=Lemon+Tree+Elante+Chandigarh',
      },
    ],
    contacts: [
      { name: 'Rohan Sharma', role: 'Bride’s brother — travel & stay', phone: '919876543210' },
      { name: 'Karan Soni', role: 'Groom’s cousin — venue & logistics', phone: '919812345678' },
    ],
    theme: {
      accent: '#E8CF7A',
      bgFrom: '#081226',
      bgTo: '#1C3A6E',
    },
  },
  photobook: {
    eyebrow: 'A few of our favourite frames',
    title: 'The Photobook',
    note: 'Flip through — more pages get added as the celebrations unfold.',
    theme: {
      accent: '#E8CF7A',
      bgFrom: '#1C0F05',
      bgTo: '#54350F',
    },
  },
  guestbook: {
    eyebrow: 'Bless the couple',
    title: 'Leave Us a Message',
    prompt:
      'A wish, a memory, a piece of advice for married life — write it here and it lands straight in our hearts (and our WhatsApp).',
    maxWords: 300,
    theme: {
      accent: '#E8CF7A',
      bgFrom: '#26060E',
      bgTo: '#701A32',
    },
  },
  tagline: 'Two souls, one journey — join us as we begin ours.',
  hashtag: '#AbhiKiDiya',
  entryVideo: '/media/entry-video.mp4',
  music: '/media/wedding-music.m4a',

  functions: [
    {
      id: 'engagement',
      name: 'Engagement',
      date: 'Thursday, 26 November 2026',
      time: '7:00 PM onwards',
      startISO: '2026-11-26T19:00:00+05:30',
      endISO: '2026-11-26T23:00:00+05:30',
      venueName: 'Sukhvilas Resort Pavilion',
      venueAddress: 'Siswan Forest Range, New Chandigarh, Punjab 140901',
      mapsUrl: 'https://maps.google.com/?q=Sukhvilas+Resort+New+Chandigarh',
      dressCode: 'Cocktail Elegance — Blush & Rose Gold',
      description:
        'An evening of rings, promises and celebration as our families come together for the very first chapter of our story.',
      story:
        'It began with a chance meeting at a friend’s sangeet, grew over long chai-fuelled conversations, and turned into forever the day Abhi went down on one knee. Now we make it official — with two rings, two families, and one very big party.',
      avatar: '/media/avatars/engagement.jpg',
      photos: [
        '/media/photos/engagement-1.jpeg',
        '/media/photos/engagement-2.jpeg',
        '/media/photos/engagement-3.jpeg',
      ],
      theme: {
        primary: '#E39BA6',
        accent: '#E8CF7A',
        bgFrom: '#2B0E1D',
        bgTo: '#5A1F35',
        backgroundPattern: 'floral',
        decoration: 'none',
      },
    },
    {
      id: 'haldi',
      name: 'Haldi',
      date: 'Friday, 27 November 2026',
      time: '10:00 AM onwards',
      startISO: '2026-11-27T10:00:00+05:30',
      endISO: '2026-11-27T13:00:00+05:30',
      venueName: 'Sharma Family Residence',
      venueAddress: 'House 23, Sector 9-C, Chandigarh 160009',
      mapsUrl: 'https://maps.google.com/?q=Sector+9+Chandigarh',
      dressCode: 'Shades of Yellow & Marigold',
      description:
        'A morning drenched in turmeric, laughter and blessings — come ready to get your hands (and clothes) gloriously yellow.',
      avatar: '/media/avatars/haldi.jpg',
      theme: {
        primary: '#F5A623',
        accent: '#FFD95E',
        bgFrom: '#2A1802',
        bgTo: '#7A4E07',
        backgroundPattern: 'marigold',
        decoration: 'marigold-petals',
      },
    },
    {
      id: 'mehendi',
      name: 'Mehendi',
      date: 'Friday, 27 November 2026',
      time: '4:00 PM onwards',
      startISO: '2026-11-27T16:00:00+05:30',
      endISO: '2026-11-27T21:00:00+05:30',
      venueName: 'The Rose Garden Pavilion',
      venueAddress: 'Zakir Hussain Rose Garden, Sector 16, Chandigarh 160015',
      mapsUrl: 'https://maps.google.com/?q=Rose+Garden+Sector+16+Chandigarh',
      dressCode: 'Greens & Festive Florals',
      description:
        'An evening of henna, folk songs and swings under the stars, as intricate patterns weave our two families into one.',
      avatar: '/media/avatars/mehendi.jpg',
      theme: {
        primary: '#9BD4A9',
        accent: '#DCC26A',
        bgFrom: '#06190D',
        bgTo: '#175231',
        backgroundPattern: 'paisley',
        decoration: 'henna-vine',
      },
    },
    {
      id: 'cocktail',
      name: 'Cocktail Night',
      date: 'Saturday, 28 November 2026',
      time: '8:00 PM till late',
      startISO: '2026-11-28T20:00:00+05:30',
      endISO: '2026-11-29T00:30:00+05:30',
      venueName: 'The Skyline Terrace, JW Marriott',
      venueAddress: 'Plot 6, Sector 35-B, Chandigarh 160035',
      mapsUrl: 'https://maps.google.com/?q=JW+Marriott+Chandigarh',
      dressCode: 'Cocktail Glam — Midnight Blue & Sequins',
      description:
        'Clink glasses under the stars — signature cocktails, sangeet performances, and a dance floor that stays open till the last song.',
      avatar: '/media/avatars/cocktail.jpg',
      theme: {
        primary: '#8FA8FF',
        accent: '#E8CF7A',
        bgFrom: '#070B1E',
        bgTo: '#232B5C',
        backgroundPattern: 'jaali',
        decoration: 'gold-particles',
      },
    },
    {
      id: 'wedding',
      name: 'Wedding',
      date: 'Sunday, 29 November 2026',
      time: '8:00 PM — Baraat at 7:00 PM',
      startISO: '2026-11-29T20:00:00+05:30',
      endISO: '2026-11-30T00:30:00+05:30',
      venueName: 'The Grand Palace Lawns',
      venueAddress: 'Madhya Marg, New Chandigarh, Punjab 140901',
      mapsUrl: 'https://maps.google.com/?q=Madhya+Marg+Chandigarh',
      dressCode: 'Royal Indian — Maroon, Gold & Ivory',
      description:
        'Under a canopy of flowers and firelight, we take our seven vows. Join us for the pheras, followed by dinner and celebrations.',
      hero: true,
      avatar: '/media/avatars/wedding.jpg',
      theme: {
        primary: '#E8CF7A',
        accent: '#F5E08A',
        bgFrom: '#170308',
        bgTo: '#5C1626',
        backgroundPattern: 'mandala',
        decoration: 'gold-particles',
      },
    },
    {
      id: 'reception',
      name: 'Reception',
      date: 'Monday, 30 November 2026',
      time: '7:00 PM onwards',
      startISO: '2026-11-30T19:00:00+05:30',
      endISO: '2026-11-30T23:30:00+05:30',
      venueName: 'The Crystal Ballroom, Hyatt Regency',
      venueAddress: 'Industrial & Business Park, Phase 1, Chandigarh 160002',
      mapsUrl: 'https://maps.google.com/?q=Hyatt+Regency+Chandigarh',
      dressCode: 'Formal Evening — Jewel Tones',
      description:
        'One last evening of dinner, toasts and photographs, as we greet you as a married couple for the very first time.',
      avatar: '/media/avatars/reception.jpg',
      theme: {
        primary: '#D9A7E0',
        accent: '#E8CF7A',
        bgFrom: '#1A0620',
        bgTo: '#4A1B5C',
        backgroundPattern: 'floral',
        decoration: 'gold-particles',
      },
    },
  ],

  /**
   * Shareable invite variants. Examples:
   *   /?invite=shaadi     → engagement + wedding + reception
   *   /?invite=cocktail   → cocktail night only
   *   /?events=haldi,mehendi&extras=story,info → ad-hoc combination
   * No param (or unknown slug) shows everything.
   */
  invites: [
    {
      slug: 'shaadi',
      label: 'Engagement & Wedding',
      functions: ['engagement', 'wedding', 'reception'],
      extras: ['story', 'info'],
    },
    {
      slug: 'cocktail',
      label: 'Cocktail Night',
      functions: ['cocktail'],
      extras: ['info'],
    },
    {
      slug: 'reception',
      label: 'Reception',
      functions: ['reception'],
      extras: ['info', 'wishes'],
    },
  ],

  rsvp: {
    title: 'Will you be joining us?',
    message:
      'Your presence is the greatest gift. Kindly let us know if you can make it so we can save you a seat (and a plate of laddoos).',
    whatsappNumber: '919999999999',
  },

  footer: {
    message: 'We can’t wait to celebrate with you.',
    familyLine: 'With love, the Sharma & Soni families',
  },
}

/** Convenience helper: look up a function by id (e.g. "haldi"). */
export function getFunction(id: string): WeddingFunction | undefined {
  return weddingConfig.functions.find((f) => f.id === id)
}
