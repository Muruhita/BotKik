import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Загружаем p5.js с CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js';
    script.onload = () => {
      const sketch = (p) => {
        let particles = [];
        let colors = [];
        let parNum = 1000; // Количество частиц
        let myWidth, myHeight;

        p.setup = () => {
          myWidth = window.innerWidth;
          myHeight = window.innerHeight;
          p.createCanvas(myWidth, myHeight);
          p.colorMode(p.HSB, 360, 100, 100, 100);
          colors[0] = p.color(15, 90, 90, p.random(25, 50));
          colors[1] = p.color(175, 90, 90, p.random(25, 50));
          for (let i = 0; i < parNum; i++) {
            particles.push(new Particle(p.random(myWidth), p.random(myHeight)));
          }
          p.background(0, 0, 5, 100);
        };

        p.draw = () => {
          for (let j = particles.length - 1; j > 0; j--) {
            particles[j].update();
            particles[j].show();
            if (particles[j].finished()) {
              particles.splice(j, 1);
              p.background(0, 0, 5, 0.1);
            }
          }
          // Пополняем частицы
          for (let i = particles.length; i < parNum; i++) {
            particles.push(new Particle(p.random(myWidth), p.random(myHeight)));
          }
        };

        p.windowResized = () => {
          myWidth = window.innerWidth;
          myHeight = window.innerHeight;
          p.resizeCanvas(myWidth, myHeight);
        };

        class Particle {
          constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = p.random(-1, 1);
            this.vy = p.random(-1, 1);
            this.life = p.random(100, 300);
            this.maxLife = this.life;
            this.color = p.random(colors);
          }

          update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= 2;
          }

          show() {
            p.noStroke();
            p.fill(this.color);
            p.ellipse(this.x, this.y, 4, 4);
          }

          finished() {
            return this.life <= 0;
          }
        }
      };

      // Инициализируем p5 в контейнере
      new p5(sketch, containerRef.current);
    };
    document.body.appendChild(script);

    return () => {
      // Очистка при размонтировании
      const p5Instance = containerRef.current?._p5Instance;
      if (p5Instance) p5Instance.remove();
      script.remove();
    };
  }, []);

  return <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />;
}
