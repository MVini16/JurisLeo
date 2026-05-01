import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './SplashScreen.css'

// frases motivacionais — podes adicionar mais aqui
const frases = [
  "O direito é a mais poderosa das forças sociais.",
  "A justiça é a ideia mais elevada da civilização humana.",
  "Conhece as leis, não para as seguir, mas para as compreender.",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "A determinação de hoje é a vitória de amanhã.",
]

function SplashScreen() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animFrameRef = useRef(null)

  // controla as animações de entrada
  const [logoVisivel, setLogoVisivel] = useState(false)
  const [letrasVisiveis, setLetrasVisiveis] = useState(false)
  const [fraseVisivel, setFraseVisivel] = useState(false)
  const [botaoVisivel, setBotaoVisivel] = useState(false)
  const [saindo, setSaindo] = useState(false)

  // frase aleatória e efeito máquina de escrever
  const [frase] = useState(() => frases[Math.floor(Math.random() * frases.length)])
  const [fraseTexto, setFraseTexto] = useState('')

  // letras do título separadas para animar uma a uma
  const titulo = 'JurisLeo'.split('')

  // sequência de animações de entrada
  useEffect(() => {
    const t1 = setTimeout(() => setLogoVisivel(true), 300)
    const t2 = setTimeout(() => setLetrasVisiveis(true), 800)
    const t3 = setTimeout(() => setFraseVisivel(true), 1400)
    const t4 = setTimeout(() => setBotaoVisivel(true), 2200)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  // efeito máquina de escrever na frase
  useEffect(() => {
    if (!fraseVisivel) return
    let i = 0
    const interval = setInterval(() => {
      setFraseTexto(frase.slice(0, i + 1))
      i++
      if (i >= frase.length) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [fraseVisivel, frase])

  // canvas para partículas de fundo e clique
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // ajusta o tamanho do canvas à janela
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // cria partículas flutuantes de fundo
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -Math.random() * 0.4 - 0.1,
        opacity: Math.random() * 0.5 + 0.1,
        click: false, // partícula de fundo
      })
    }

    // loop de animação do canvas
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter(p => p.opacity > 0)

      particlesRef.current.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity})`
        ctx.fill()

        p.x += p.speedX
        p.y += p.speedY

        // partículas de fundo reaparecem no fundo
        if (!p.click) {
          if (p.y < 0) p.y = canvas.height
          if (p.x < 0) p.x = canvas.width
          if (p.x > canvas.width) p.x = 0
        } else {
          // partículas de clique desaparecem gradualmente
          p.opacity -= 0.015
          p.size *= 0.98
        }
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // cria partículas ao clicar
  const handleClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20
      const speed = Math.random() * 3 + 1
      particlesRef.current.push({
        x,
        y,
        size: Math.random() * 4 + 1,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 1,
        opacity: 1,
        click: true,
      })
    }
  }, [])

  // transição de saída suave antes de navegar
  const handleEntrar = () => {
    setSaindo(true)
    setTimeout(() => navigate('/login'), 800)
  }

  return (
    <div className="splash-container" onClick={handleClick}>
      {/* canvas de partículas */}
      <canvas ref={canvasRef} className="splash-canvas" />

      {/* fundo com gradiente */}
      <div className="splash-bg" />

      {/* conteúdo central */}
      <div className={`splash-content ${saindo ? 'splash-saindo' : ''}`}>

        {/* balança svg com animação */}
        <div className={`splash-logo ${logoVisivel ? 'splash-logo-visivel' : ''}`}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="50" y1="10" x2="50" y2="85" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="20" y1="25" x2="80" y2="25" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round"/>
            {/* prato esquerdo a oscilar */}
            <g className="prato-esquerdo">
              <line x1="20" y1="25" x2="10" y2="45" stroke="#C9A84C" strokeWidth="1.5"/>
              <line x1="20" y1="25" x2="30" y2="45" stroke="#C9A84C" strokeWidth="1.5"/>
              <path d="M10 45 Q20 55 30 45" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
            </g>
            {/* prato direito a oscilar */}
            <g className="prato-direito">
              <line x1="80" y1="25" x2="70" y2="45" stroke="#C9A84C" strokeWidth="1.5"/>
              <line x1="80" y1="25" x2="90" y2="45" stroke="#C9A84C" strokeWidth="1.5"/>
              <path d="M70 45 Q80 55 90 45" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
            </g>
            <line x1="35" y1="85" x2="65" y2="85" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* título com letras a entrarem uma a uma */}
        <h1 className="splash-titulo">
          {titulo.map((letra, i) => (
            <span
              key={i}
              className={`splash-letra ${letrasVisiveis ? 'splash-letra-visivel' : ''}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              {letra}
            </span>
          ))}
        </h1>

        {/* frase com efeito máquina de escrever */}
        <p className={`splash-frase ${fraseVisivel ? 'splash-frase-visivel' : ''}`}>
          "{fraseTexto}"
        </p>

        {/* botão com brilho */}
        <button
          className={`splash-botao ${botaoVisivel ? 'splash-botao-visivel' : ''}`}
          onClick={(e) => { e.stopPropagation(); handleEntrar() }}
        >
          <span className="splash-botao-brilho" />
          Entrar
        </button>

      </div>
    </div>
  )
}

export default SplashScreen