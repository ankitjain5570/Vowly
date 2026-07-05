import { motion } from 'framer-motion'
import { weddingConfig } from '../wedding.config'
import { GodRays, GoldDust, LetterReveal, PalaceSilhouette } from './royal'

/**
 * "Our Story" slide: the couple narrates their love story as a timeline of
 * chapters (from config), alternating along a drawing gold line on desktop
 * and stacking along a left rail on mobile.
 */
export function StorySection() {
  const { loveStory } = weddingConfig
  const { theme, chapters } = loveStory

  return (
    <section
      id="story"
      className="invite-section allow-scroll flex items-start justify-center text-royal-ivory sm:items-center"
      style={{
        background: `radial-gradient(ellipse at 50% 26%, ${theme.bgTo} 0%, ${theme.bgFrom} 72%)`,
      }}
    >
      <GodRays color={theme.accent} />
      <PalaceSilhouette windows={theme.accent} />
      <GoldDust />
      <div className="vignette" />

      <div className="mobile-safe relative z-10 mx-auto w-full max-w-5xl px-6 py-6 sm:py-14 sm:px-8">
        {/* Header */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mb-3 text-[10px] uppercase tracking-[0.4em] text-royal-ivory/70 sm:text-xs"
          >
            {loveStory.eyebrow}
          </motion.p>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl">
            <LetterReveal text={loveStory.title} delay={0.55} />
          </h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mx-auto my-3 flex max-w-xs items-center gap-3 sm:my-5"
          >
            <span className="h-px flex-1 bg-royal-gold/60" />
            <span className="h-2 w-2 rotate-45 bg-royal-gold" />
            <span className="h-px flex-1 bg-royal-gold/60" />
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="relative mt-4 sm:mt-6">
          {/* central line (left rail on mobile) */}
          <motion.span
            aria-hidden="true"
            className="absolute left-4 top-0 h-full w-px lg:left-1/2"
            style={{
              background: `linear-gradient(to bottom, transparent, ${theme.accent}, transparent)`,
              transformOrigin: 'top center',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.8, delay: 0.9, ease: 'easeInOut' }}
          />

          <div className="space-y-4 sm:space-y-9 lg:space-y-12">
            {chapters.map((ch, i) => {
              const right = i % 2 === 1
              return (
                <motion.article
                  key={ch.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 1.1 + i * 0.35, ease: 'easeOut' }}
                  className={`relative pl-12 lg:w-1/2 lg:pl-0 ${
                    right ? 'lg:ml-auto lg:pl-16' : 'lg:mr-auto lg:pr-16'
                  }`}
                >
                  {/* node on the line */}
                  <span
                    aria-hidden="true"
                    className={`absolute top-2 h-3 w-3 rotate-45 border ${
                      right ? 'left-2.5 lg:-left-1.5' : 'left-2.5 lg:left-auto lg:-right-1.5'
                    }`}
                    style={{ backgroundColor: theme.accent, borderColor: '#fff6', boxShadow: `0 0 10px ${theme.accent}` }}
                  />

                  <div
                    className={`flex items-start gap-5 text-left ${
                      right ? '' : 'lg:flex-row-reverse lg:text-right'
                    }`}
                  >
                    {ch.photo && (
                      <motion.img
                        src={ch.photo}
                        alt={ch.title}
                        loading="lazy"
                        whileHover={{ scale: 1.06, rotate: right ? 2 : -2 }}
                        className="mt-1 h-24 w-20 shrink-0 rounded-t-full border-2 object-cover sm:h-32 sm:w-25"
                        style={{ borderColor: `${theme.accent}90` }}
                      />
                    )}
                    <div className="min-w-0">
                      <p
                        className="text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: theme.accent }}
                      >
                        {ch.label}
                      </p>
                      <h3 className="mt-0.5 font-heading text-xl text-royal-gold-light sm:mt-1 sm:text-3xl">
                        {ch.title}
                      </h3>
                      <p className="mt-1 max-w-md text-xs font-light leading-relaxed text-royal-ivory/75 sm:text-sm">
                        {ch.text}
                      </p>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
