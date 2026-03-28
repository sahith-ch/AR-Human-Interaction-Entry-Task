
    const video  = document.getElementById('video')
    const canvas = document.getElementById('canvas')
    const ctx    = canvas.getContext('2d')

    canvas.width  = 640
    canvas.height = 480

  const GESTURE_COLORS = {
      'Thumbs Up': '#48bb78',
      'Fist':       '#e53e3e',
      'Open Hand':  '#38b2ac',
      'Peace':      '#9f7aea',
      'Point':      '#ed8936',
      'Unknown':    '#4a5568'
    }

    const GESTURE_EMOJIS = {
      'Thumbs Up': '👍',
      'Fist':      '✊',
      'Open Hand': '🖐',
      'Peace':     '✌️',
      'Point':     '☝️',
      'Unknown':   '—'
    }

    const titleEl   = document.getElementById('gestureTitle')
    const ring      = document.getElementById('ring')
    const ring2     = document.getElementById('ring2')
    const confFill  = document.getElementById('confFill')

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1,3),16)
      const g = parseInt(hex.slice(3,5),16)
      const b = parseInt(hex.slice(5,7),16)
      return {r,g,b}
    }
    function darken(hex, f=0.52) {
      const {r,g,b} = hexToRgb(hex)
      return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`
    }
    function lighten(hex, f=1.4) {
      const {r,g,b} = hexToRgb(hex)
      return `rgb(${Math.min(255,Math.round(r*f))},${Math.min(255,Math.round(g*f))},${Math.min(255,Math.round(b*f))})`
    }

    let currentGesture = ''

    function applyTheme(gesture) {
      if (gesture === currentGesture) return
      currentGesture = gesture

      const col   = GESTURE_COLORS[gesture] || GESTURE_COLORS['Unknown']
      const dark  = darken(col)
      const light = lighten(col)

      document.documentElement.style.setProperty('--current', col)

      document.querySelectorAll('.cham-body path').forEach(el => {
        el.setAttribute('fill', col)
      })

      let glowStyle = document.getElementById('glow-style')
      if (!glowStyle) {
        glowStyle = document.createElement('style')
        glowStyle.id = 'glow-style'
        document.head.appendChild(glowStyle)
      }
      glowStyle.textContent = 
       ` #chameleon-svg { filter: drop-shadow(0 0 18px \${col}) drop-shadow(0 0 6px \${col}); }`
      

      titleEl.textContent = `${GESTURE_EMOJIS[gesture] || ''} ${gesture.toUpperCase()}`
      confFill.style.width = gesture === 'Unknown' ? '10%' : `${70 + Math.random()*28}%`
    }

    function detectGesture(lm) {
      const thumb  = lm[4].x  > lm[3].x
      const index  = lm[8].y  < lm[6].y
      const middle = lm[12].y < lm[10].y
      const ring   = lm[16].y < lm[14].y
      const pinky  = lm[20].y < lm[18].y

      if ( thumb && !index && !middle && !ring && !pinky)
      { 
        return 'Thumbs Up'
      }
      if (!thumb && !index && !middle && !ring && !pinky) return 'Fist'
      if ( thumb &&  index &&  middle &&  ring &&  pinky) return 'Open Hand'
      if (!thumb &&  index &&  middle && !ring && !pinky) return 'Peace'
      if (!thumb &&  index && !middle && !ring && !pinky) return 'Point'
      return 'Unknown'
    }

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    })

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    })

    hands.onResults(results => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

      if (results.multiHandLandmarks?.length) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: 'rgba(126,255,212,0.7)',
            lineWidth: 2
          })
          drawLandmarks(ctx, landmarks, {
            color: '#ff6b6b',
            lineWidth: 1,
            radius: 4
          })
          const gesture = detectGesture(landmarks)
          applyTheme(gesture)
        }
      } else {
        applyTheme('Unknown')
        titleEl.textContent = 'SHOW YOUR HAND'
        confFill.style.width = '0%'
      }
    })

    applyTheme('Unknown')
    titleEl.textContent = 'SHOW YOUR HAND'

    const camera = new Camera(video, {
      onFrame: async () => { await hands.send({ image: video }) },
      width: 640,
      height: 480
    })
    camera.start()
