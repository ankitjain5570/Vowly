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
    bride: 'Aarohi',
    groom: 'Vihaan',
  },
  couplePhoto: '/media/photos/couple-main.jpeg',
  loveStory: {
    eyebrow: 'Every love has a beginning',
    title: 'Our Story',
    chapters: [
      {
        label: '2019 · Jaipur',
        title: 'The First Hello',
        text: 'A friend’s sangeet, one borrowed dance partner, and a conversation that refused to end. Vihaan forgot the steps; Aarohi pretended not to notice.',
        photo: '/media/photos/story-1.jpeg',
      },
      {
        label: '2021 · Two Cities',
        title: 'Long Distance, Longer Calls',
        text: 'Between Mumbai deadlines and Jaipur monsoons, we wore out two phone batteries a day and learnt that home is a person, not a place.',
        photo: '/media/photos/story-2.jpeg',
      },
      {
        label: '2023 · Udaipur',
        title: 'The Question',
        text: 'On a lake-side terrace at sunset, Vihaan went down on one knee. She said yes before he finished the sentence.',
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
        a: 'Rajmahal Palace Lawns is on Sardar Patel Marg, C-Scheme. From Jaipur Airport it is a 30-minute drive (12 km) via Tonk Road; from Jaipur Junction railway station about 15 minutes (6 km). Uber/Ola work reliably, and prepaid taxis are available at both.',
      },
      {
        q: 'Will there be shuttles between functions?',
        a: 'Yes — a shuttle leaves from the Hotel Devi Palace lobby 90 and 45 minutes before every function, and returns until 1 AM on the wedding night. No booking needed, just hop in.',
      },
      {
        q: 'Is parking available at the venues?',
        a: 'Valet parking is available at the main gate for the Engagement and Wedding. For the Haldi at the family home, street parking is limited — we recommend the shuttle or a cab.',
      },
      {
        q: 'What will the weather be like?',
        a: 'Jaipur in late November is lovely — sunny days around 24°C and cool evenings near 12°C. Carry a shawl or light jacket for the outdoor evening functions.',
      },
      {
        q: 'What about gifts?',
        a: 'Your presence (and your dance moves) are the only gifts we need. If you insist, a warm hug and a photo with us will do just fine.',
      },
    ],
    hotels: [
      {
        name: 'Hotel Devi Palace',
        note: 'Our guest block — mention "AaroVihaan Wedding" for reserved rates. 2 km from the venue; all shuttles start here.',
        mapsUrl: 'https://maps.google.com/?q=Hotel+Devi+Palace+Jaipur',
      },
      {
        name: 'The Amber Courtyard',
        note: 'Boutique stay 10 minutes away, great for families — limited rooms, book by 1 November.',
        mapsUrl: 'https://maps.google.com/?q=Amber+Courtyard+Jaipur',
      },
    ],
    contacts: [
      { name: 'Rohan Sharma', role: 'Bride’s brother — travel & stay', phone: '919876543210' },
      { name: 'Karan Mehta', role: 'Groom’s cousin — venue & logistics', phone: '919812345678' },
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
  hashtag: '#AaroToldVihaanYes',
  entryVideo: '/media/entry-video.mp4',
  music: '/media/wedding-music.mp3',

  functions: [
    {
      id: 'engagement',
      name: 'Engagement',
      date: 'Friday, 20 November 2026',
      time: '7:00 PM onwards',
      startISO: '2026-11-20T19:00:00+05:30',
      endISO: '2026-11-20T23:00:00+05:30',
      venueName: 'The Regal Pavilion',
      venueAddress: '12 Palace Road, Jaipur, Rajasthan 302001',
      mapsUrl: 'https://maps.google.com/?q=The+Regal+Pavilion+Jaipur',
      dressCode: 'Cocktail Elegance — Blush & Rose Gold',
      description:
        'An evening of rings, promises and celebration as our families come together for the very first chapter of our story.',
      story:
        'It began with a chance meeting at a friend’s sangeet, grew over long chai-fuelled conversations, and turned into forever the day Vihaan went down on one knee. Now we make it official — with two rings, two families, and one very big party.',
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
      date: 'Saturday, 21 November 2026',
      time: '10:00 AM onwards',
      startISO: '2026-11-21T10:00:00+05:30',
      endISO: '2026-11-21T13:00:00+05:30',
      venueName: 'Sharma Family Residence',
      venueAddress: '45 Marigold Lane, Civil Lines, Jaipur, Rajasthan 302006',
      mapsUrl: 'https://maps.google.com/?q=Civil+Lines+Jaipur',
      dressCode: 'Shades of Yellow & Marigold',
      description:
        'A morning drenched in turmeric, laughter and blessings — come ready to get your hands (and clothes) gloriously yellow.',
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
      date: 'Saturday, 21 November 2026',
      time: '4:00 PM onwards',
      startISO: '2026-11-21T16:00:00+05:30',
      endISO: '2026-11-21T21:00:00+05:30',
      venueName: 'Bagh-e-Bahar Gardens',
      venueAddress: '8 Amer Road, Jaipur, Rajasthan 302002',
      mapsUrl: 'https://maps.google.com/?q=Amer+Road+Jaipur',
      dressCode: 'Greens & Festive Florals',
      description:
        'An evening of henna, folk songs and swings under the stars, as intricate patterns weave our two families into one.',
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
      id: 'wedding',
      name: 'Wedding',
      date: 'Sunday, 22 November 2026',
      time: '8:00 PM — Baraat at 7:00 PM',
      startISO: '2026-11-22T20:00:00+05:30',
      endISO: '2026-11-23T00:30:00+05:30',
      venueName: 'Rajmahal Palace Lawns',
      venueAddress: 'Sardar Patel Marg, C-Scheme, Jaipur, Rajasthan 302001',
      mapsUrl: 'https://maps.google.com/?q=Rajmahal+Palace+Jaipur',
      dressCode: 'Royal Indian — Maroon, Gold & Ivory',
      description:
        'Under a canopy of flowers and firelight, we take our seven vows. Join us for the pheras, followed by dinner and celebrations.',
      hero: true,
      theme: {
        primary: '#E8CF7A',
        accent: '#F5E08A',
        bgFrom: '#170308',
        bgTo: '#5C1626',
        backgroundPattern: 'mandala',
        decoration: 'gold-particles',
      },
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
    familyLine: 'With love, the Sharma & Mehta families',
  },
}

/** Convenience helper: look up a function by id (e.g. "haldi"). */
export function getFunction(id: string): WeddingFunction | undefined {
  return weddingConfig.functions.find((f) => f.id === id)
}
