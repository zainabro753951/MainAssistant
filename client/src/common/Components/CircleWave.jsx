import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

const CircleWave = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = 500
    canvas.height = 500

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 100
    const segments = 128
    const points = new Array(segments).fill(0).map((_, i) => ({
      angle: (i / segments) * Math.PI * 2,
      amplitude: Math.random(),
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.beginPath()
      for (let i = 0; i <= segments; i++) {
        const index = i % segments
        const p = points[index]
        const amp = p.amplitude
        const r = radius + amp * 40
        const x = centerX + Math.cos(p.angle) * r
        const y = centerY + Math.sin(p.angle) * r

        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()

      // Glow effect
      ctx.shadowColor = '#00ffff'
      ctx.shadowBlur = 15
      ctx.strokeStyle = '#00bfff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Animate points
      points.forEach(p => {
        p.amplitude = gsap.utils.clamp(0.3, 1, p.amplitude + (Math.random() - 0.5) * 0.1)
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#090e18]">
      <canvas ref={canvasRef} className="rounded-full" />
    </div>
  )
}

export default CircleWave
