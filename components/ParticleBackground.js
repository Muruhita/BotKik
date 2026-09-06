import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Загружаем p5.js с CDN
    if (!window.p5) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js';
      script.onload = () => {
        initSketch();
      };
      document.body.appendChild(script);
    } else {
      initSketch();
    }

    function initSketch() {
      const sketch = (p) => {
        let particles = [];
        let parNum = 100; // Уменьшено для производительности
        let noiseScale = 0.005;
        let speed = 1.5;

        p.setup = () => {
          p.createCanvas(window.innerWidth, window.innerHeight);
          p.background(0, 0, 5);
          for (let i = 0; i < parNum; i++) {
            particles.push(new Particle());
          }
        };

        p.draw = () => {
          p.fill(0, 0, 5, 10);
          p.noStroke();
          p.rect(0, 0, p.width, p.height);

          for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].show();
          }
        };

        p.windowResized = () => {
          p.resizeCanvas(window.innerWidth, window.innerHeight);
        };

        class Particle {
          constructor() {
            this.x = p.random(p.width);
            this.y = p.random(p.height);
            this.vx = p.random(-1, 1);
            this.vy = p.random(-1, 1);
            this.color = p.color(p.random(30, 80), p.random(100, 160), p.random(200, 255), 35);
          }

          update() {
            let angle = p.noise(this.x * noiseScale, this.y * noiseScale) * p.TWO_PI * 2;
            this.vx += p.cos(angle) * 0.1;
            this.vy += p.sin(angle) * 0.1;

            let speedMag = p.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speedMag > speed) {
              this.vx = (this.vx / speedMag) * speed;
              this.vy = (this.vy / speedMag) * speed;
            }

            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = p.width;
            if (this.x > p.width) this.x = 0;
            if (this.y < 0) this.y = p.height;
            if (this.y > p.height) this.y = 0;
          }

          show() {
            p.stroke(this.color);
            p.strokeWeight(1.5);
            p.line(this.x, this.y, this.x - this.vx, this.y - this.vy);
          }
        }
      };

      const p5Instance = new p5(sketch, containerRef.current);
      containerRef.current._p5Instance = p5Instance;
    }

    return () => {
      if (containerRef.current?._p5Instance) {
        containerRef.current._p5Instance.remove();
        containerRef.current._p5Instance = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />;
}
