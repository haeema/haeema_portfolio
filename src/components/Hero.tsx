import { useCallback, useEffect, useRef, useState } from 'react'
import './Hero.css'

type SpriteSheet = {
  file: string
  startFrame: number
  frameCount: number
  width: number
  height: number
}

type SpriteMetadata = {
  frameCount: number
  holdFrame: number
  fps: number
  duration: number
  frameWidth: number
  frameHeight: number
  framesPerSheet: number
  sheets: SpriteSheet[]
}

type Zone = 'left' | 'center' | 'right' | 'away'
type Reaction = 'working' | 'left' | 'right' | 'center'

const FRAMES = {
  /**
   * Frames 0–14 have her looking up at the camera, so the typing loop lives in
   * sheet 1 (frames 20–39), where she stays heads-down at the laptop. Staying
   * inside one sheet means the idle animation never swaps its 16000px
   * background image — crossing that boundary is what made the hero blink.
   * The loop ping-pongs between these bounds rather than wrapping.
   */
  idle: 20,
  idleLoopEnd: 39,
  lookLeft: 90,
  lookRight: 150,
  /**
   * Heads-down at the laptop, the frame her head lift starts from. It is the
   * closest match to the typing loop that doesn't pass through the side
   * glances, but not an exact one, so the cut into it is crossfaded.
   */
  lookUp: 166,
  /** Eye contact: she has recognised the visitor. */
  centerStart: 178,
  waveStart: 206,
  /** No pointing gesture in this cut: the scroll cue appears on the hold frame. */
  pointStart: 214,
} as const

const METADATA_URL = '/hero-frames/metadata.json'
const SMOOTHING = 0.12
const MAX_SCRUB_FPS = 58
const ZONE_HYSTERESIS = 0.04
const SIDE_HOLD_MS = 2500
const TRIGGER_COOLDOWN_MS = 400
/** She finishes her keystroke before looking up. */
const LOOK_UP_DELAY_MS = 350
/** Playback rate for the head lift, until she makes eye contact. */
const LOOK_UP_SPEED = 0.5
/**
 * The bottom 2.2% of the frame is the dark table edge — measured, not guessed:
 * her arms and the laptop run to 97.3%. Cropping it top-anchored is the last
 * vertical headroom available before her hair or the laptop would be cut.
 */
const BOTTOM_CROP = 0.022
/** Depth parallax on the sprite. Horizontal only — vertical has no slack. */
const PARALLAX_X = 18

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

function resolveZone(x: number, previous: Zone): Exclude<Zone, 'away'> {
  const low = 1 / 3
  const high = 2 / 3
  const h = ZONE_HYSTERESIS

  if (previous === 'left') return x > low + h ? (x > high + h ? 'right' : 'center') : 'left'
  if (previous === 'right') return x < high - h ? (x < low - h ? 'left' : 'center') : 'right'
  if (x < low - h) return 'left'
  if (x > high + h) return 'right'
  return 'center'
}

function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLButtonElement>(null)
  const spriteRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<SpriteMetadata | null>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  const currentFrameRef = useRef(0)
  const targetFrameRef = useRef(0)
  const drawnFrameRef = useRef(-1)
  const animationFrameRef = useRef<number | null>(null)
  const lastTickRef = useRef(0)
  const pendingSequenceRef = useRef(false)
  const beatRef = useRef('')
  const reactionRef = useRef<Reaction>('working')
  const zoneRef = useRef<Zone>('away')
  const armedZoneRef = useRef<Zone>('away')
  const holdTimerRef = useRef<number | null>(null)
  const lookUpTimerRef = useRef<number | null>(null)
  const lastTriggerRef = useRef(0)
  /** Whether the latest pointer was a finger or pen, so the stage's click can tell. */
  const touchRef = useRef(false)
  /** Keeps her typing at the desk whenever nothing else is happening. */
  const idleLoopRef = useRef(false)
  const idleDirRef = useRef(1)

  const activeSheetRef = useRef(-1)
  const scaleRef = useRef(1)
  const offsetXRef = useRef(0)
  const heroBoxRef = useRef({ left: 0, width: 1 })
  const readyRef = useRef(false)
  const reducedMotionRef = useRef(false)
  const decodedSheetsRef = useRef<HTMLImageElement[]>([])

  const [state, setState] = useState<'loading' | 'ready'>('loading')

  const drawFrame = useCallback((frame: number) => {
    const meta = metaRef.current
    const sprite = spriteRef.current
    if (!meta || !sprite) return

    const clamped = Math.min(Math.max(frame, 0), meta.frameCount - 1)
    const sheetIndex = Math.min(
      Math.floor(clamped / meta.framesPerSheet),
      meta.sheets.length - 1,
    )
    const sheet = meta.sheets[sheetIndex]
    const scale = scaleRef.current

    if (sheetIndex !== activeSheetRef.current) {
      activeSheetRef.current = sheetIndex
      sprite.style.backgroundImage = `url("${sheet.file}")`
      sprite.style.backgroundSize = `${sheet.width * scale}px ${sheet.height * scale}px`
    }

    const localFrame = clamped - sheet.startFrame
    sprite.style.backgroundPositionX = `${offsetXRef.current - localFrame * meta.frameWidth * scale}px`
    drawnFrameRef.current = clamped
  }, [])

  /**
   * Jumps to a frame that doesn't follow on from the current one. The ghost
   * layer takes a snapshot of the outgoing frame and fades out over the new one.
   */
  const crossfadeTo = useCallback(
    (frame: number) => {
      const ghost = ghostRef.current
      const sprite = spriteRef.current
      if (ghost && sprite) {
        ghost.style.transition = 'none'
        ghost.style.backgroundImage = sprite.style.backgroundImage
        ghost.style.backgroundSize = sprite.style.backgroundSize
        ghost.style.backgroundPosition = `${sprite.style.backgroundPositionX} ${sprite.style.backgroundPositionY}`
        ghost.style.transform = sprite.style.transform
        ghost.style.opacity = '1'
        void ghost.offsetWidth
        ghost.style.transition = ''
        ghost.style.opacity = '0'
      }
      currentFrameRef.current = frame
      drawFrame(frame)
    },
    [drawFrame],
  )

  const setBeat = useCallback((beat: string) => {
    if (beat === beatRef.current) return
    beatRef.current = beat
    if (heroRef.current) heroRef.current.dataset.beat = beat
  }, [])

  const setReaction = useCallback(
    (reaction: Reaction) => {
      reactionRef.current = reaction
      if (heroRef.current) {
        heroRef.current.dataset.zone = reaction === 'working' ? 'away' : reaction
      }
      if (reaction !== 'center') setBeat('')
    },
    [setBeat],
  )

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current)
    if (lookUpTimerRef.current !== null) window.clearTimeout(lookUpTimerRef.current)
    holdTimerRef.current = null
    lookUpTimerRef.current = null
  }, [])

  const layout = useCallback(() => {
    const meta = metaRef.current
    const stage = stageRef.current
    const sprite = spriteRef.current
    const hero = heroRef.current
    if (!meta || !stage || !sprite || !hero) return

    const { width, height } = stage.getBoundingClientRect()
    if (!width || !height) return

    // Scaling against the usable height (minus the table edge) and anchoring to
    // the top means the overflow is spent entirely on the strip below the desk.
    const usableHeight = meta.frameHeight * (1 - BOTTOM_CROP)
    const scale = Math.max(width / meta.frameWidth, height / usableHeight)
    scaleRef.current = scale
    offsetXRef.current = (width - meta.frameWidth * scale) / 2
    sprite.style.backgroundPositionY = '0px'

    const heroBox = hero.getBoundingClientRect()
    heroBoxRef.current = { left: heroBox.left, width: heroBox.width }

    activeSheetRef.current = -1
    drawFrame(drawnFrameRef.current < 0 ? 0 : drawnFrameRef.current)
  }, [drawFrame])

  const tick = useCallback(
    function step(now: number) {
      const meta = metaRef.current
      if (!meta) return

      const dt = Math.min((now - lastTickRef.current) / 1000, 0.05)
      lastTickRef.current = now

      // Idle: she keeps working. Ping-pong at source speed so the seam is
      // always a direction change rather than a jump back to frame 0.
      if (idleLoopRef.current) {
        let frameNow = currentFrameRef.current + idleDirRef.current * meta.fps * dt
        if (frameNow >= FRAMES.idleLoopEnd) {
          frameNow = FRAMES.idleLoopEnd
          idleDirRef.current = -1
        } else if (frameNow <= FRAMES.idle) {
          frameNow = FRAMES.idle
          idleDirRef.current = 1
        }
        currentFrameRef.current = frameNow

        const idleFrame = Math.round(frameNow)
        if (idleFrame !== drawnFrameRef.current) drawFrame(idleFrame)

        animationFrameRef.current = requestAnimationFrame(step)
        return
      }

      const target = targetFrameRef.current
      let current = currentFrameRef.current

      if (reactionRef.current === 'center' && current < target) {
        const speed = current < FRAMES.centerStart ? LOOK_UP_SPEED : 1
        current = Math.min(target, current + meta.fps * speed * dt)
      } else {
        const approach = 1 - Math.pow(1 - SMOOTHING, dt * 60)
        const maxStep = MAX_SCRUB_FPS * dt
        const delta = (target - current) * approach
        current += Math.max(-maxStep, Math.min(maxStep, delta))
      }

      if (Math.abs(target - current) < 0.4) current = target
      currentFrameRef.current = current

      const frame = Math.round(current)
      if (frame !== drawnFrameRef.current) drawFrame(frame)

      if (reactionRef.current === 'center') {
        if (frame >= FRAMES.pointStart) setBeat('point')
        else if (frame >= FRAMES.waveStart) setBeat('wave')
        else if (frame >= FRAMES.centerStart) setBeat('notice')
      }

      if (current !== target) {
        animationFrameRef.current = requestAnimationFrame(step)
        return
      }

      animationFrameRef.current = null

      if (pendingSequenceRef.current) {
        pendingSequenceRef.current = false
        setReaction('center')
        targetFrameRef.current = meta.holdFrame
        lastTickRef.current = performance.now()
        animationFrameRef.current = requestAnimationFrame(step)
        return
      }

      const reaction = reactionRef.current

      // Lowered her head after the visitor left: back to typing.
      if (reaction === 'working' && current === FRAMES.lookUp) {
        crossfadeTo(FRAMES.idle)
        idleLoopRef.current = true
        idleDirRef.current = 1
        lastTickRef.current = performance.now()
        animationFrameRef.current = requestAnimationFrame(step)
        return
      }

      if ((reaction === 'left' || reaction === 'right') && holdTimerRef.current === null) {
        holdTimerRef.current = window.setTimeout(() => {
          holdTimerRef.current = null
          setReaction('working')
          targetFrameRef.current = FRAMES.idle
          lastTickRef.current = performance.now()
          animationFrameRef.current = requestAnimationFrame(step)
        }, SIDE_HOLD_MS)
        return
      }

      // Back at the desk with nothing queued: resume typing.
      if (reaction === 'working' && !reducedMotionRef.current) {
        idleLoopRef.current = true
        idleDirRef.current = 1
        lastTickRef.current = performance.now()
        animationFrameRef.current = requestAnimationFrame(step)
      }
    },
    [crossfadeTo, drawFrame, setBeat, setReaction],
  )

  const ensureLoop = useCallback(() => {
    if (animationFrameRef.current !== null) return
    lastTickRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(tick)
  }, [tick])

  const playGreeting = useCallback(() => {
    const meta = metaRef.current
    if (!meta || !readyRef.current || reducedMotionRef.current) return

    clearHoldTimer()

    // Mid-greeting: drop back to heads-down, then play the lift again.
    if (currentFrameRef.current > FRAMES.lookUp) {
      idleLoopRef.current = false
      setReaction('working')
      targetFrameRef.current = FRAMES.lookUp
      pendingSequenceRef.current = true
      ensureLoop()
      return
    }

    // Typing (or glancing aside): keep going for a beat, then dissolve into the
    // heads-down frame and slowly lift her head until she recognises you.
    pendingSequenceRef.current = false
    setReaction('center')
    lookUpTimerRef.current = window.setTimeout(() => {
      lookUpTimerRef.current = null
      if (reactionRef.current !== 'center') return
      idleLoopRef.current = false
      crossfadeTo(FRAMES.lookUp)
      targetFrameRef.current = meta.holdFrame
      ensureLoop()
    }, LOOK_UP_DELAY_MS)
    ensureLoop()
  }, [clearHoldTimer, crossfadeTo, ensureLoop, setReaction])

  const triggerSideGlance = useCallback(
    (zone: 'left' | 'right') => {
      const now = performance.now()
      if (now - lastTriggerRef.current < TRIGGER_COOLDOWN_MS) return
      lastTriggerRef.current = now

      clearHoldTimer()
      idleLoopRef.current = false
      pendingSequenceRef.current = false
      setReaction(zone)
      targetFrameRef.current = zone === 'left' ? FRAMES.lookLeft : FRAMES.lookRight
      ensureLoop()
    },
    [clearHoldTimer, ensureLoop, setReaction],
  )

  useEffect(() => {
    let cancelled = false
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    reducedMotionRef.current = prefersReducedMotion

    const preload = async (file: string) => {
      const image = new Image()
      image.src = file
      await image.decode()
      decodedSheetsRef.current.push(image)
    }

    const load = async () => {
      const response = await fetch(METADATA_URL)
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      const meta: SpriteMetadata = await response.json()

      let startFrame: number = FRAMES.idle
      if (prefersReducedMotion) startFrame = meta.holdFrame
      const firstSheet = Math.floor(startFrame / meta.framesPerSheet)

      await preload(meta.sheets[firstSheet].file)
      if (cancelled) return

      metaRef.current = meta
      currentFrameRef.current = startFrame
      targetFrameRef.current = startFrame
      stageRef.current?.style.setProperty('--frame-aspect', `${meta.frameWidth} / ${meta.frameHeight}`)
      stageRef.current?.style.setProperty('--frame-ratio', `${meta.frameWidth / meta.frameHeight}`)
      layout()
      drawFrame(startFrame)
      setState('ready')

      if (prefersReducedMotion) return

      const rest = meta.sheets.filter(
        (sheet, index) => index !== firstSheet && sheet.startFrame <= meta.holdFrame,
      )
      await Promise.all(rest.map((sheet) => preload(sheet.file)))
      if (cancelled) return

      // Desktop and touch both start typing and wait to be noticed.
      readyRef.current = true
      idleLoopRef.current = true
      idleDirRef.current = 1
      ensureLoop()
    }

    load().catch((error) => {
      console.error('[Hero] sprite sheet unavailable', error)
    })

    return () => {
      cancelled = true
    }
  }, [drawFrame, ensureLoop, layout])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const observer = new ResizeObserver(layout)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [layout])

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      clearHoldTimer()
    },
    [clearHoldTimer],
  )

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
      cursorRef.current.style.opacity = '1'
    }
    if (spotlightRef.current) {
      spotlightRef.current.style.setProperty('--cursor-x', `${event.clientX}px`)
      spotlightRef.current.style.setProperty('--cursor-y', `${event.clientY}px`)
    }

    if (!readyRef.current || reducedMotionRef.current) return
    // A finger only reports moves while it is down, which is exactly a drag.
    if (event.pointerType !== 'mouse' && (event.target as Element).closest('a')) return

    const { left, width } = heroBoxRef.current
    const x = clamp01((event.clientX - left) / width)

    // Counter-parallax: she drifts against the cursor, which reads as depth.
    // Only the sprite is transformed — layout() measures the stage, so moving
    // the stage instead would feed it a shifted box.
    const parallax = `translate3d(${(0.5 - x) * PARALLAX_X}px, 0, 0)`
    if (spriteRef.current) spriteRef.current.style.transform = parallax
    if (ghostRef.current) ghostRef.current.style.transform = parallax

    reactToZone(resolveZone(x, zoneRef.current))
  }

  /** Shared by mouse hover, touch drags and taps: react to the third of the hero in play. */
  const reactToZone = (zone: Exclude<Zone, 'away'>) => {
    if (zone === zoneRef.current) return
    zoneRef.current = zone

    if (zone === 'center') {
      playGreeting()
      armedZoneRef.current = 'center'
      return
    }

    if (zone !== armedZoneRef.current) {
      armedZoneRef.current = zone
      triggerSideGlance(zone)
    }
  }

  /**
   * Touch has no hover, so a tap stands in for it: the left or right third makes
   * her glance that way, the middle gets the greeting. Dragging sideways keeps
   * steering her through handlePointerMove; vertical drags scroll the page.
   */
  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    touchRef.current = event.pointerType !== 'mouse'
    if (!touchRef.current || !readyRef.current || reducedMotionRef.current) return
    if ((event.target as Element).closest('a')) return

    const { left, width } = heroBoxRef.current
    const zone = resolveZone(clamp01((event.clientX - left) / width), 'away')
    // Mid-greeting or already waving: a tap shouldn't rewind her.
    if (zone === 'center' && reactionRef.current === 'center') return

    zoneRef.current = 'away'
    armedZoneRef.current = 'away'
    reactToZone(zone)
  }

  const handlePointerEnd = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse') return
    // Each tap starts fresh; whatever she is doing carries on.
    zoneRef.current = 'away'
    armedZoneRef.current = 'away'
  }

  const handleStageClick = () => {
    // Touch taps are handled on pointerdown by zone; this is for mouse clicks.
    if (touchRef.current) return
    playGreeting()
  }

  const handlePointerLeave = (event: React.PointerEvent<HTMLElement>) => {
    // The cursor is position: fixed, so it would otherwise hang over the page below.
    if (cursorRef.current) cursorRef.current.style.opacity = '0'
    if (event.pointerType !== 'mouse' || !readyRef.current) return
    if (spriteRef.current) spriteRef.current.style.transform = 'translate3d(0, 0, 0)'
    if (ghostRef.current) ghostRef.current.style.transform = 'translate3d(0, 0, 0)'
    zoneRef.current = 'away'
    armedZoneRef.current = 'away'
    clearHoldTimer()
    pendingSequenceRef.current = false
    setReaction('working')
    // Past the head lift she lowers her head to the lift's start and crossfades
    // into typing, rather than rewinding through the side glances.
    targetFrameRef.current =
      currentFrameRef.current > FRAMES.lookUp ? FRAMES.lookUp : FRAMES.idle
    ensureLoop()
  }

  const handleStageKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    playGreeting()
  }

  return (
    <section
      className="hero"
      ref={heroRef}
      data-state={state}
      data-zone="away"
      data-beat=""
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerLeave}
    >
      <div className="hero__cursor" ref={cursorRef} aria-hidden="true" />
      <div className="hero__spotlight" ref={spotlightRef} aria-hidden="true" />
      <div className="hero__backdrop" aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" />
      
      {/* Floating Cinematic Atmospheric Particles */}
      <div className="hero__particles" aria-hidden="true">
        <span style={{ '--i': 1 } as React.CSSProperties} />
        <span style={{ '--i': 2 } as React.CSSProperties} />
        <span style={{ '--i': 3 } as React.CSSProperties} />
        <span style={{ '--i': 4 } as React.CSSProperties} />
        <span style={{ '--i': 5 } as React.CSSProperties} />
      </div>

      <div className="hero__note hero__note--left">
        <div className="hero__signature-box">
          <h1 className="hero__title">Haeema <br /><span>R Nathan</span></h1>
          <p className="hero__subtitle">
            {/* Each title stays whole, so a wrap falls between titles rather than inside one. */}
            <span>Wedding Decorator ·</span> <span>Jewellery Owner ·</span>{' '}
            <span>Brand Positioning Expert ·</span> <span>Digital Marketing Expert</span>
          </p>
        </div>
        <div className="hero__slot">
          <div className="hero__bubble" data-when="away">
            <svg className="hero__pointer" viewBox="0 0 12 16" aria-hidden="true">
              <path d="M1 1 L1 13.2 L4.3 10.1 L6.5 15 L8.7 14 L6.5 9.2 L10.8 9.2 Z" />
            </svg>
            <span className="hero__hint--fine">Move cursor to call me</span>
            <span className="hero__hint--coarse">Tap me to say hi</span>
          </div>
          <div className="hero__bubble" data-when="left">
            <span>Planning a wedding to remember?</span>
          </div>
          <div className="hero__bubble" data-when="notice">
            <span>Hey, caught you!</span>
          </div>
          <div className="hero__bubble" data-when="wave">
            <span>Hello and welcome</span>
          </div>
        </div>
      </div>

      <div className="hero__note hero__note--right">
        <div className="hero__slot">
          <div className="hero__bubble" data-when="right">
            <span>Looking for the perfect jewellery?</span>
          </div>
        </div>
      </div>

      {/* Phones and tablets: the side notes don't fit, so one centred bubble speaks for her. */}
      <div className="hero__say" aria-live="polite">
        <div className="hero__bubble" data-when="away">
          <span className="hero__tap" aria-hidden="true" />
          <span className="hero__hint--fine">Move cursor to call me</span>
          <span className="hero__hint--coarse">Tap me to say hi</span>
        </div>
        <div className="hero__bubble" data-when="left">
          <span>Planning a wedding to remember?</span>
        </div>
        <div className="hero__bubble" data-when="right">
          <span>Looking for the perfect jewellery?</span>
        </div>
        <div className="hero__bubble" data-when="notice">
          <span>Hey, caught you!</span>
        </div>
        <div className="hero__bubble" data-when="wave">
          <span>Hello and welcome</span>
        </div>
      </div>

      <button
        type="button"
        className="hero__stage"
        ref={stageRef}
        onKeyDown={handleStageKeyDown}
        onClick={handleStageClick}
        aria-label="Haeema R Nathan at her desk. Move the cursor or tap across the hero to catch her attention."
      >
        <div className="hero__sprite" ref={spriteRef} />
        <div className="hero__sprite hero__sprite--ghost" ref={ghostRef} />
      </button>

      <a className="hero__scroll" href="#intro">
        <span className="hero__scroll-text">Explore Portfolio</span>
      </a>
    </section>
  )
}

export default Hero