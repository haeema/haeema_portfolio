import { useEffect, useRef } from 'react'
import Icon from './Icon'
import {
  coreSkills,
  creations,
  experience,
  expertise,
  pillars,
  positioningElements,
  profile,
  stats,
} from '../content'
import './Portfolio.css'

/** Fades sections in as they scroll into view; everything is visible without JS. */
function useReveal() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = root.querySelectorAll<HTMLElement>('[data-reveal]')
    root.classList.add('pf--animate')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return rootRef
}

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as React.CSSProperties

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="pf-eyebrow">
      <Icon name="sparkle" className="pf-eyebrow__icon" />
      {children}
    </p>
  )
}

function Portfolio() {
  const rootRef = useReveal()

  return (
    <div className="pf" ref={rootRef}>
      {/* ---- Introduction ---- */}
      <section id="intro" className="pf-section pf-intro">
        <div className="pf-wrap pf-intro__inner" data-reveal>
          <Eyebrow>Wedding · Décor · Jewellery</Eyebrow>
          <h2 className="pf-display">
            Creating celebrations that are <em>beautifully designed</em>, thoughtfully positioned
            &amp; <em>impossible to forget.</em>
          </h2>
          <div className="pf-rule" aria-hidden="true" />
          <p className="pf-lead">
            I’m <strong>{profile.name}</strong>, a wedding decorator and jewellery business owner
            with <strong>{profile.years} years of experience in the wedding and creative industry</strong>.
          </p>
          <p className="pf-lead">
            From designing breathtaking wedding spaces to curating exquisite jewellery, I bring
            together <strong>creativity, craftsmanship and a strong understanding of brand
            positioning</strong> to create experiences that stand apart.
          </p>
          <div className="pf-actions">
            <a className="pf-btn pf-btn--solid" href="#creations">
              Explore My Work <Icon name="arrow" className="pf-btn__icon" />
            </a>
            <a className="pf-btn pf-btn--ghost" href="#contact">
              Let’s Talk
            </a>
          </div>
        </div>
      </section>

      {/* ---- Beautifully positioned ---- */}
      <section id="positioned" className="pf-section pf-pillars-section">
        <div className="pf-wrap">
          <header className="pf-heading pf-heading--center" data-reveal>
            <h2 className="pf-heading__title">
              More than beautiful.
              <br />
              <em>Beautifully positioned.</em>
            </h2>
            <p className="pf-heading__lead">
              Whether it’s a wedding décor experience or a jewellery brand, standing out takes more
              than aesthetics.
            </p>
            <p className="pf-heading__lead">
              It takes a clear identity, a compelling story and a strong understanding of what makes
              people remember you.
            </p>
          </header>

          <ul className="pf-pillars">
            {pillars.map((pillar, index) => (
              <li key={pillar.title} className="pf-card pf-pillar" data-reveal style={delay(index * 100)}>
                <span className="pf-ring">
                  <Icon name={pillar.icon} />
                </span>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </li>
            ))}
          </ul>

          <dl className="pf-stats" data-reveal>
            {stats.map((stat) => (
              <div key={stat.label} className="pf-stat">
                <dt>
                  {stat.value}
                  {stat.unit && <small>{stat.unit}</small>}
                </dt>
                <dd>{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- Décor & jewellery ---- */}
      <section id="creations" className="pf-section pf-creations">
        <div className="pf-wrap">
          <header className="pf-heading pf-heading--center" data-reveal>
            <Eyebrow>Décor &amp; Jewellery</Eyebrow>
            <h2 className="pf-heading__title">
              Where creativity meets <em>celebration</em>
            </h2>
          </header>

          <div className="pf-creations__grid">
            {creations.map((item, index) => (
              <article
                key={item.title}
                className={`pf-creation pf-creation--${item.tone}`}
                data-reveal
                style={delay(index * 120)}
              >
                <span className="pf-creation__index">0{index + 1}</span>
                <span className="pf-creation__badge">
                  <Icon name={item.icon} />
                </span>
                <h3 className="pf-creation__title">{item.title}</h3>
                <p className="pf-creation__body">{item.body}</p>
                <a className="pf-link" href="#contact">
                  {item.cta} <Icon name="arrow" className="pf-link__icon" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Brand positioning ---- */}
      <section id="positioning" className="pf-section pf-positioning">
        <div className="pf-wrap pf-positioning__grid">
          <div data-reveal>
            <Eyebrow>Brand Positioning</Eyebrow>
            <h2 className="pf-heading__title">
              Experts in <em>Brand Positioning</em>
            </h2>
            <p className="pf-lead pf-lead--strong">
              A beautiful product or service deserves an identity that is just as distinctive.
            </p>
            <p className="pf-lead">
              With years of experience across the wedding and creative industry, Haeema understands
              how to bring together <strong>visual identity, storytelling, audience perception and
              positioning</strong> to create a brand that feels memorable and meaningful.
            </p>
          </div>

          <aside className="pf-card pf-elements" data-reveal style={delay(120)}>
            <ol className="pf-elements__list">
              {positioningElements.map((element, index) => (
                <li key={element}>
                  <span className="pf-elements__num">0{index + 1}</span>
                  <span>{element}</span>
                </li>
              ))}
            </ol>
            <p className="pf-elements__motto">
              Clarity. <em>Creativity.</em> Positioning.
            </p>
          </aside>
        </div>
      </section>

      {/* ---- Digital marketing expertise ---- */}
      <section id="expertise" className="pf-section pf-expertise">
        <div className="pf-wrap">
          <header className="pf-heading pf-heading--center" data-reveal>
            <Eyebrow>Digital Marketing Expert</Eyebrow>
            <h2 className="pf-heading__title">
              Digital Marketing <em>Expertise</em>
            </h2>
            <p className="pf-heading__lead">
              {profile.years} years of marketing in the wedding and creative industry, using Meta
              advertising, Instagram, SEO and creative storytelling to build visibility, engagement
              and enquiries.
            </p>
          </header>

          <div className="pf-expertise__grid">
            {expertise.map((group, index) => (
              <article
                key={group.title}
                className="pf-card pf-expert"
                data-reveal
                style={delay((index % 2) * 110)}
              >
                <div className="pf-expert__head">
                  <span className="pf-ring">
                    <Icon name={group.icon} />
                  </span>
                  <h3>{group.title}</h3>
                </div>
                <ul className="pf-expert__list">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="pf-skills" data-reveal>
            <h3 className="pf-skills__title">Core Skills</h3>
            <ul className="pf-skills__list">
              {coreSkills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---- The experience ---- */}
      <section id="experience" className="pf-section pf-experience">
        <div className="pf-wrap">
          <header className="pf-heading pf-heading--center" data-reveal>
            <Eyebrow>The Experience</Eyebrow>
            <h2 className="pf-heading__title">
              The <em>{profile.name}</em> Experience
            </h2>
            <p className="pf-heading__lead">
              From the first idea to the final detail, every element is thoughtfully considered.
            </p>
          </header>

          <ol className="pf-steps">
            {experience.map((step, index) => (
              <li key={step.title} className="pf-step" data-reveal style={delay(index * 110)}>
                <span className="pf-ring pf-ring--lg">
                  <Icon name={step.icon} />
                </span>
                <span className="pf-step__num">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Contact ---- */}
      <section id="contact" className="pf-contact">
        <div className="pf-wrap pf-contact__inner" data-reveal>
          <span className="pf-contact__icon">
            <Icon name="chat" />
          </span>
          <h2 className="pf-contact__title">
            Let’s create something <em>unforgettable.</em>
          </h2>
          <p className="pf-contact__lead">
            Planning a wedding, looking for the perfect jewellery, or building a distinctive creative
            brand?
          </p>

          <div className="pf-actions pf-actions--center">
            <a className="pf-btn pf-btn--rose" href={profile.whatsappHref} target="_blank" rel="noreferrer">
              Let’s talk <Icon name="arrow" className="pf-btn__icon" />
            </a>
            <a className="pf-btn pf-btn--line" href={`mailto:${profile.email}`}>
              Send an email
            </a>
          </div>

          <ul className="pf-contact__details">
            <li>
              <Icon name="mail" />
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <Icon name="phone" />
              <a href={profile.phoneHref}>{profile.phone}</a>
            </li>
            <li>
              <Icon name="pin" />
              <span>{profile.location}</span>
            </li>
          </ul>
        </div>
      </section>

      <footer className="pf-footer">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>{profile.role}</span>
      </footer>
    </div>
  )
}

export default Portfolio
