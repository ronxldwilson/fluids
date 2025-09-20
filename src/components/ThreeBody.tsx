"use client";

import React, { useEffect, useRef } from "react";
import p5 from "p5";

const ThreeBody: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sketch = (s: p5) => {
      class Body {
        pos: p5.Vector;
        vel: p5.Vector;
        mass: number;
        col: string;

        constructor(x: number, y: number, vx: number, vy: number, m: number, col: string) {
          this.pos = s.createVector(x, y);
          this.vel = s.createVector(vx, vy);
          this.mass = m;
          this.col = col;
        }

        applyForce(force: p5.Vector, speedFactor: number) {
          let acc = force.copy().div(this.mass); // ensure it's a p5.Vector
          acc.mult(speedFactor);
          this.vel.add(acc);
        }

        update(speedFactor: number) {
          this.pos.add(this.vel.copy().mult(speedFactor));
        }

        show() {
          s.fill(this.col);
          s.noStroke();
          s.circle(this.pos.x, this.pos.y, s.sqrt(this.mass) * 4);
        }
      }

      // ----------------------
      let bodies: Body[] = [];
      let GSlider: p5.Element;
      let SpeedSlider: p5.Element;
      let MassSliders: p5.Element[] = [];
      let ResetButton: p5.Element;
      let trail: { x: number; y: number; c: string }[] = [];

      const initBodies = () => {
        bodies = [];
        bodies.push(new Body(s.width / 2 - 100, s.height / 2, 0, 2, 20, "#ff5555"));
        bodies.push(new Body(s.width / 2 + 100, s.height / 2, 0, -2, 20, "#55ff55"));
        bodies.push(new Body(s.width / 2, s.height / 2 + 150, 2, 0, 30, "#5555ff"));
        trail = [];
      };

      s.setup = () => {
        if (typeof window !== "undefined") {
          s.createCanvas(window.innerWidth, window.innerHeight).parent(canvasRef.current!);
        }

        initBodies();

        // Sliders
        GSlider = s.createSlider(0.1, 5, 1, 0.1).position(20, 20).style("width", "200px");
        SpeedSlider = s.createSlider(0.1, 5, 1, 0.1).position(20, 60).style("width", "200px");

        for (let i = 0; i < bodies.length; i++) {
          let slider = s
            .createSlider(5, 100, bodies[i].mass, 1)
            .position(20, 100 + i * 40)
            .style("width", "200px");
          MassSliders.push(slider);
        }

        // Reset button
        ResetButton = s.createButton("Reset System")
          .position(20, 240)
          .mousePressed(() => {
            initBodies();
            for (let i = 0; i < bodies.length; i++) {
              (MassSliders[i] as p5.Element & { value: (val: number) => void }).value(bodies[i].mass);
            }
          });
      };

      s.draw = () => {
        s.background(0);

        let G = Number((GSlider as p5.Element & { value: () => number | string }).value());
        let speedFactor = Number((SpeedSlider as p5.Element & { value: () => number | string }).value());

        // Update masses from sliders
        for (let i = 0; i < bodies.length; i++) {
          bodies[i].mass = Number((MassSliders[i] as p5.Element & { value: () => number | string }).value());
        }

        // Gravitational interactions
        for (let i = 0; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) {
            let dir = p5.Vector.sub(bodies[j].pos, bodies[i].pos);
            let distSq = s.constrain(dir.magSq(), 25, 50000);
            let forceMag = (Number(G) * Number(bodies[i].mass) * Number(bodies[j].mass)) / Number(distSq);
            let force = dir.copy().setMag(forceMag);

            bodies[i].applyForce(force, Number(speedFactor));
            bodies[j].applyForce(force.copy().mult(-1), Number(speedFactor));
          }
        }

        // --- Auto Camera ---
        // Compute bounding box of all bodies
        let minX = Infinity,
          maxX = -Infinity,
          minY = Infinity,
          maxY = -Infinity;
        for (let b of bodies) {
          minX = Math.min(minX, b.pos.x);
          maxX = Math.max(maxX, b.pos.x);
          minY = Math.min(minY, b.pos.y);
          maxY = Math.max(maxY, b.pos.y);
        }

        let centerX = (minX + maxX) / 2;
        let centerY = (minY + maxY) / 2;
        let spanX = maxX - minX;
        let spanY = maxY - minY;
        let scaleFactor = 0.9 * Math.min(s.width / (spanX + 200), s.height / (spanY + 200));
        scaleFactor = s.constrain(scaleFactor, 0.1, 2); // limit zoom

        s.push();
        s.translate(s.width / 2, s.height / 2);
        s.scale(scaleFactor);
        s.translate(-centerX, -centerY);

        // Update + draw
        for (let b of bodies) {
          b.update(speedFactor);
          b.show();
          trail.push({ x: b.pos.x, y: b.pos.y, c: b.col });
        }

        // Trails
        s.noStroke();
        for (let t of trail) {
          s.fill(t.c + "55");
          s.circle(t.x, t.y, 2 / scaleFactor); // scale trail size
        }
        if (trail.length > 4000) trail.splice(0, 1000);

        s.pop();

        // Labels
        s.fill(255);
        s.textSize(14);
        s.text(`G: ${G.toFixed(2)}`, 240, 35);
        s.text(`Speed: ${speedFactor.toFixed(2)}`, 240, 75);
        for (let i = 0; i < bodies.length; i++) {
          s.text(`Mass ${i + 1}: ${bodies[i].mass.toFixed(0)}`, 240, 115 + i * 40);
        }
      };

      s.windowResized = () => {
        if (typeof window !== "undefined") {
          s.resizeCanvas(window.innerWidth, window.innerHeight);
        }
      };
    };

    let p5Instance: p5 | undefined;
    if (typeof window !== "undefined") {
      p5Instance = new p5(sketch, canvasRef.current!);
    }

    return () => {
      p5Instance?.remove();
    };
  }, []);

  return <div ref={canvasRef} className="w-full h-screen" />;
};

export default ThreeBody;
