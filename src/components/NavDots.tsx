import { motion } from 'framer-motion'

export interface NavSection {
  id: string
  label: string
}

/**
 * Fixed vertical dot navigation on the right edge. The active slide's dot
 * grows into a gold diamond; labels appear on hover (desktop). Clicking a
 * dot jumps the carousel to that slide.
 */
export function NavDots({
  sections,
  activeId,
  onSelect,
}: {
  sections: NavSection[]
  activeId: string
  onSelect: (id: string) => void
}) {
  return (
    <nav
      aria-label="Slide navigation"
      className="fixed right-3 top-1/2 z-50 -translate-y-1/2 sm:right-5"
    >
      <ul className="flex flex-col items-center gap-4">
        {sections.map(({ id, label }) => {
          const isActive = id === activeId
          return (
            <li key={id} className="group relative flex items-center">
              <span className="pointer-events-none absolute right-6 hidden whitespace-nowrap rounded bg-royal-maroon-deep/85 px-2 py-0.5 font-body text-xs tracking-wide text-royal-ivory opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block">
                {label}
              </span>
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-label={`Go to ${label}`}
                aria-current={isActive || undefined}
                className="block cursor-pointer p-1"
              >
                <motion.span
                  className="block h-2.5 w-2.5 border"
                  animate={{
                    rotate: 45,
                    scale: isActive ? 1.35 : 1,
                    backgroundColor: isActive ? '#c9a227' : 'rgba(201, 162, 39, 0)',
                    borderColor: isActive ? '#c9a227' : 'rgba(107, 31, 47, 0.45)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
