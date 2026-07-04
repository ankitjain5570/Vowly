import { weddingConfig } from '../wedding.config'

interface FooterProps {
  onReplay: () => void
  showReplay?: boolean
}

export function Footer({ onReplay, showReplay }: FooterProps) {
  const { couple, hashtag, footer } = weddingConfig

  return (
    <footer
      id="footer"
      className="relative flex flex-col items-center gap-3 bg-royal-maroon-deep px-6 py-14 text-center text-royal-ivory"
    >
      <p className="font-heading text-2xl italic text-royal-gold-light">
        {couple.bride} &amp; {couple.groom}
      </p>
      <p className="max-w-md text-sm font-light text-royal-ivory/80">{footer.message}</p>
      <p className="text-xs font-light text-royal-ivory/60">{footer.familyLine}</p>
      <p className="mt-2 text-xs tracking-[0.3em] text-royal-gold">{hashtag}</p>
      
      {showReplay && (
        <button
          onClick={onReplay}
          className="mt-4 cursor-pointer text-xs uppercase tracking-[0.2em] text-royal-gold hover:text-royal-gold-light underline decoration-royal-gold/30 underline-offset-4 transition-colors"
        >
          Replay entry
        </button>
      )}
    </footer>
  )
}

