import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Загружаем p5.js с CDN, если ещё не загружен
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
        let isMobile = /iPhone|iPod|Android/i.test(navigator.userAgent);
        let repel_radius;
        let radius_;
        let angle = 0;
        let points = [];
        const particles = 8000;
        const attraction = 0.01;
        const damping = 0.9;
        const repel_strength = 28;

        p.setup = () => {
          if (isMobile) {
            p.createCanvas(360, 360);
            radius_ = 160;
            repel_radius = 60;
          } else {
            p.createCanvas(900, 700);
            radius_ = 250;
            repel_radius = 90;
          }

          p.pixelDensity(1);
          p.stroke(255);
          p.strokeWeight(2);

          // fill points array
          for (let i = 0; i < particles; i++) {
            points.push({
              index: i,
              pos: p.createVector(0, 0),
              vel: p.createVector(0, 0)
            });
          }
          // initialize at angle = 0
          angle = 0;
          updateTargets();
          for (let pt of points) pt.vel.set(0, 0);
        };

        p.draw = () => {
          p.background(0);
          p.translate(p.width / 2, p.height / 2);

          let mouse = p.createVector(p.mouseX - p.width / 2, p.mouseY - p.height / 2);

          for (let pt of points) {
            let i = pt.index;

            // compute the rotating “home” position
            let homeX = p.sin(i + angle) * p.sin(i * i) * radius_;
            let homeY = p.cos(i * i) * radius_;
            let home = p.createVector(homeX, homeY);

            // spring force toward home
            let toHome = p5.Vector.sub(home, pt.pos);
            let spring = toHome.mult(attraction);
            pt.vel.add(spring);

            // mouse repulsion
            let awayFromMouse = p5.Vector.sub(pt.pos, mouse);
            let distSq = awayFromMouse.magSq();
            if (distSq > 0.1 && distSq < repel_radius * repel_radius) {
              let distance = Math.sqrt(distSq);
              awayFromMouse.normalize();
              let repel = repel_strength * (1 - distance / repel_radius);
              awayFromMouse.mult(repel);
              pt.vel.add(awayFromMouse);
            }

            // damping and move
            pt.vel.mult(damping);
            pt.pos.add(pt.vel);

            p.point(pt.pos.x, pt.pos.y);
          }
          angle += 0.01;
        };

        p.windowResized = () => {
          if (isMobile) {
            p.resizeCanvas(360, 360);
            radius_ = 160;
            repel_radius = 60;
          } else {
            p.resizeCanvas(900, 700);
            radius_ = 250;
            repel_radius = 90;
          }
        };

        // put the initial positions right
        function updateTargets() {
          for (let pt of points) {
            let i = pt.index;
            let x = p.sin(i + angle) * p.sin(i * i) * radius_;
            let y = p.cos(i * i) * radius_;
            pt.pos.set(x, y);
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
