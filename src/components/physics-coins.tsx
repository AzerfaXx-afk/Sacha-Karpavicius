"use client";

import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import gsap from "gsap";

interface PhysicsCoinsProps {
  containerRef: React.RefObject<HTMLElement | HTMLDivElement | null>;
  portraitRef: React.RefObject<HTMLElement | HTMLDivElement | null>;
  siteStarted?: boolean;
  enabled?: boolean;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: "dot" | "star" | "pixel";
  rotation: number;
  vRot: number;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

type FaceType = "yellow_brows" | "orange_minimal" | "purple_chill" | "pink_happy" | "white_sparkle";

interface CoinData {
  color: string;
  faceType: FaceType;
  radius: number;
  impactAmount: number;
  visualScale: number;
  entryScale: number;
  entryOpacity: number;
  squashX: number;
  squashY: number;
  pupilX: number;
  pupilY: number;
  blinkTimer: number;
  blinkProgress: number;
  isBlinking: boolean;
  // Long-press hold state
  holdProgress: number;
  // Autonomous life motion properties
  wanderTimer: number;
  idleGlanceTimer: number;
  idleGlanceX: number;
  idleGlanceY: number;
  lastCursorX: number;
  lastCursorY: number;
}

export default function PhysicsCoins({
  containerRef,
  portraitRef,
  siteStarted = true,
  enabled = true,
}: PhysicsCoinsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled || !siteStarted || !containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    const isMobile = width < 768;

    // Mobile Performance Optimization: Cap DPR to 1 on mobile to eliminate GPU lag & disable heavy canvas shadowBlur
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    const updateCanvasDimensions = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    updateCanvasDimensions();

    // 1. Matter.js Physics Engine (Lunar Low Gravity)
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.28, scale: 0.001 },
    });
    const world = engine.world;

    const particles: SparkParticle[] = [];
    const shockwaves: ShockwaveRing[] = [];

    // Mobile Motion & Gyroscope / Shake Control
    let lastAccelX = 0;
    let lastAccelY = 0;

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (!isMobile) return;
      const gamma = e.gamma || 0; // [-90, 90] left/right tilt
      const beta = e.beta || 0;   // [-180, 180] front/back tilt

      // Smoothly map mobile tilt angles to gravity force vectors
      const targetGx = Math.min(1.4, Math.max(-1.4, (gamma / 30) * 0.9));
      const targetGy = Math.min(1.4, Math.max(-1.4, (beta / 30) * 0.9));

      engine.gravity.x += (targetGx - engine.gravity.x) * 0.25;
      engine.gravity.y += (targetGy - engine.gravity.y) * 0.25;
    };

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      if (!isMobile || !e.accelerationIncludingGravity) return;
      const acc = e.accelerationIncludingGravity;
      const ax = acc.x || 0;
      const ay = acc.y || 0;

      // Shake detection: calculate instantaneous acceleration delta
      const deltaX = ax - lastAccelX;
      const deltaY = ay - lastAccelY;
      lastAccelX = ax;
      lastAccelY = ay;

      const shakeForce = Math.hypot(deltaX, deltaY);
      if (shakeForce > 3.5) {
        // Phone shake detected! Apply dynamic bounce impulse to all active coins
        const impulseMult = Math.min(0.015, shakeForce * 0.0008);
        coinBodies.forEach((coin) => {
          Matter.Body.applyForce(coin, coin.position, {
            x: (Math.random() - 0.5) * impulseMult,
            y: -impulseMult * (0.5 + Math.random() * 0.5),
          });
        });
      }
    };

    if (isMobile && typeof window !== "undefined") {
      if ("DeviceOrientationEvent" in window) {
        window.addEventListener("deviceorientation", handleDeviceOrientation, true);
      }
      if ("DeviceMotionEvent" in window) {
        window.addEventListener("devicemotion", handleDeviceMotion, true);
      }
    }

    // Intensity-Based Collision Particle Trigger
    const triggerCollisionFX = (x: number, y: number, color: string, speed: number = 4) => {
      const intensity = Math.min(1.0, Math.max(0.2, speed / 7.0));

      // Spawn Expanding Shockwave Ring
      shockwaves.push({
        x,
        y,
        radius: 6,
        maxRadius: 30 + intensity * 35,
        alpha: 1.0,
        color,
      });

      // Spawn Burst Particles (count scales with impact intensity: 6 to 22)
      const count = Math.floor(6 + intensity * 16);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
        const particleSpeed = (1.5 + Math.random() * 4.2) * (0.6 + intensity * 0.7);
        const pTypeRand = Math.random();
        const pType: "dot" | "star" | "pixel" = pTypeRand > 0.65 ? "star" : pTypeRand > 0.35 ? "pixel" : "dot";

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * particleSpeed,
          vy: Math.sin(angle) * particleSpeed - 0.5,
          life: 0,
          maxLife: 20 + Math.random() * 16,
          color,
          size: (2.0 + Math.random() * 3.5) * (0.8 + intensity * 0.4),
          type: pType,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.25,
        });
      }

      // Hard Cap to prevent lag on mobile (max 45 active particles)
      if (particles.length > 45) {
        particles.splice(0, particles.length - 45);
      }
    };

    // 2. Setup Screen Boundary Walls
    const wallOptions = { isStatic: true, friction: 0.04, restitution: 0.88 };
    const wallThickness = 120;

    let ground = Matter.Bodies.rectangle(
      width / 2,
      height + wallThickness / 2 - 10,
      width * 3,
      wallThickness,
      wallOptions
    );
    let leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2 + 10,
      height / 2,
      wallThickness,
      height * 3,
      wallOptions
    );
    let rightWall = Matter.Bodies.rectangle(
      width + wallThickness / 2 - 10,
      height / 2,
      wallThickness,
      height * 3,
      wallOptions
    );
    let ceiling = Matter.Bodies.rectangle(
      width / 2,
      -wallThickness / 2 + 10,
      width * 3,
      wallThickness,
      wallOptions
    );

    Matter.World.add(world, [ground, leftWall, rightWall, ceiling]);

    // 3. Sacha Portrait Card Obstacle (Desktop only so it doesn't block mobile screens)
    let portraitBody: Matter.Body | null = null;

    const updatePortraitBody = () => {
      if (!portraitRef.current || !container) return;

      // On Mobile (<768px), do not create a rigid wall portrait obstacle so coins float freely!
      if (isMobile) {
        if (portraitBody) Matter.World.remove(world, portraitBody);
        portraitBody = null;
        return;
      }

      const pRect = portraitRef.current.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();

      const pX = pRect.left - cRect.left + pRect.width / 2;
      const pY = pRect.top - cRect.top + pRect.height / 2;
      const pW = pRect.width;
      const pH = pRect.height;

      if (portraitBody) {
        Matter.World.remove(world, portraitBody);
      }

      portraitBody = Matter.Bodies.rectangle(pX, pY, pW, pH, {
        isStatic: true,
        chamfer: { radius: 20 },
        restitution: 0.92,
        friction: 0.05,
      });

      Matter.World.add(world, portraitBody);
    };

    updatePortraitBody();

    // 4. Create Characters (3 MAX ON MOBILE for clutter-free fluidity, 5 ON DESKTOP)
    const allCoinDefs: {
      color: string;
      faceType: FaceType;
      baseRadius: number;
      isLeft: boolean;
      spawnXRatio: number;
      spawnYRatio: number;
    }[] = [
      {
        color: "#E6FB28", // Yellow
        faceType: "yellow_brows",
        baseRadius: isMobile ? 36 : 50,
        isLeft: true,
        spawnXRatio: 0.08 + Math.random() * 0.10,
        spawnYRatio: 0.15 + Math.random() * 0.2,
      },
      {
        color: "#FF52A0", // Pink
        faceType: "pink_happy",
        baseRadius: isMobile ? 38 : 54,
        isLeft: false,
        spawnXRatio: 0.82 + Math.random() * 0.10,
        spawnYRatio: 0.15 + Math.random() * 0.2,
      },
      {
        color: "#F0EFEA", // Off-White
        faceType: "white_sparkle",
        baseRadius: isMobile ? 40 : 56,
        isLeft: true,
        spawnXRatio: 0.06 + Math.random() * 0.10,
        spawnYRatio: 0.35 + Math.random() * 0.2,
      },
      {
        color: "#FF4D26", // Deep Orange (Desktop extra)
        faceType: "orange_minimal",
        baseRadius: 52,
        isLeft: true,
        spawnXRatio: 0.14 + Math.random() * 0.10,
        spawnYRatio: 0.55 + Math.random() * 0.2,
      },
      {
        color: "#B345FF", // Electric Violet (Desktop extra)
        faceType: "purple_chill",
        baseRadius: 48,
        isLeft: false,
        spawnXRatio: 0.78 + Math.random() * 0.12,
        spawnYRatio: 0.55 + Math.random() * 0.2,
      },
    ];

    // On mobile (<768px), slice to 3 coins max!
    const activeCoinDefs = isMobile ? allCoinDefs.slice(0, 3) : allCoinDefs;

    const coinBodies: Matter.Body[] = activeCoinDefs.map((def, idx) => {
      const spawnX = width * def.spawnXRatio;
      const spawnY = height * def.spawnYRatio;

      const body = Matter.Bodies.circle(spawnX, spawnY, def.baseRadius, {
        restitution: 0.88,
        friction: 0.03,
        frictionAir: 0.005,
        density: 0.002,
        angle: (Math.random() - 0.5) * 0.5,
      });

      Matter.Body.setVelocity(body, {
        x: def.isLeft ? 0.6 + Math.random() * 1.2 : -(0.6 + Math.random() * 1.2),
        y: Math.random() * 1.5 + 0.5,
      });

      const coinData: CoinData = {
        color: def.color,
        faceType: def.faceType,
        radius: def.baseRadius,
        impactAmount: 0,
        visualScale: 1.0,
        entryScale: 0,
        entryOpacity: 0,
        squashX: 1.0,
        squashY: 1.0,
        pupilX: 0,
        pupilY: 0,
        blinkTimer: Math.floor(Math.random() * 180 + 120),
        blinkProgress: 0,
        isBlinking: false,
        holdProgress: 0,
        wanderTimer: Math.floor(Math.random() * 120 + 60),
        idleGlanceTimer: Math.floor(Math.random() * 150 + 60),
        idleGlanceX: 0,
        idleGlanceY: 0,
        lastCursorX: 0,
        lastCursorY: 0,
      };

      (body as any).coinData = coinData;

      // GSAP Pop Entry Animation
      gsap.to(coinData, {
        entryScale: 1.0,
        entryOpacity: 1.0,
        duration: 0.8,
        delay: idx * 0.1,
        ease: "back.out(2.2)",
      });

      return body;
    });

    Matter.World.add(world, coinBodies);

    // 5. Mouse / Touch Drag Constraint with STRICT LONG-PRESS REQUIREMENT & FLING THROWING
    const mouse = Matter.Mouse.create(canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.35,
        damping: 0.02,
        render: { visible: false },
      },
    });

    Matter.World.add(world, mouseConstraint);

    let cursorX = width / 2;
    let cursorY = height / 2;
    let isPointerDown = false;
    let targetHoldCoin: Matter.Body | null = null;
    let holdStartTime = 0;
    const HOLD_DURATION = 220; // 220ms mandatory hold required to activate grab!

    let pointerX = 0;
    let pointerY = 0;
    let pointerVx = 0;
    let pointerVy = 0;

    const getCoinNearPointer = (px: number, py: number) => {
      // Check distance from cursor to coin center across all characters (includes center, face features, eyes, mouth & contour + 18px margin)
      for (let i = 0; i < coinBodies.length; i++) {
        const coin = coinBodies[i];
        const data = (coin as any).coinData as CoinData;
        const r = (data?.radius || 40) * (data?.visualScale || 1.0) + 18;
        const dx = px - coin.position.x;
        const dy = py - coin.position.y;
        if (dx * dx + dy * dy <= r * r) {
          return coin;
        }
      }
      return null;
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      // On mobile, touching coins does nothing! Motion is purely driven by Gyroscope + floating gravity.
      if (isMobile && "touches" in e) return;

      isPointerDown = true;
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const px = clientX - rect.left;
      const py = clientY - rect.top;

      pointerX = px;
      pointerY = py;
      pointerVx = 0;
      pointerVy = 0;

      const hitCoin = getCoinNearPointer(px, py);
      if (hitCoin && !mouseConstraint.body) {
        targetHoldCoin = hitCoin;
        holdStartTime = Date.now();
      }
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const newX = clientX - rect.left;
      const newY = clientY - rect.top;

      pointerVx = newX - pointerX;
      pointerVy = newY - pointerY;
      pointerX = newX;
      pointerY = newY;
      cursorX = newX;
      cursorY = newY;
    };

    const handlePointerUp = () => {
      if (mouseConstraint.body) {
        // FLING / THROW PHYSICS: On release, apply throwing velocity so you can fling coins across screen!
        const grabbedCoin = mouseConstraint.body;
        (mouseConstraint as any).constraint.bodyB = null;
        Matter.Body.setVelocity(grabbedCoin, {
          x: Math.min(16, Math.max(-16, pointerVx * 0.85)),
          y: Math.min(16, Math.max(-16, pointerVy * 0.85)),
        });
      } else if (targetHoldCoin) {
        const elapsed = Date.now() - holdStartTime;
        if (elapsed < HOLD_DURATION) {
          // Quick tap: gentle push impulse instead of grabbing
          const forceX = (Math.random() - 0.5) * 0.012;
          const forceY = -0.012;
          Matter.Body.applyForce(targetHoldCoin, targetHoldCoin.position, { x: forceX, y: forceY });
        }
        const data = (targetHoldCoin as any).coinData as CoinData;
        if (data) data.holdProgress = 0;
      }
      targetHoldCoin = null;
      isPointerDown = false;
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchend", handlePointerUp);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    // Audio Sound Effects Helper Functions (Pre-instantiated for zero latency & 10% volume)
    let lastDegatsSoundTime = 0;
    const pop1Audio = typeof window !== "undefined" ? new Audio("/sounds/pop1.mp3") : null;
    const pop2Audio = typeof window !== "undefined" ? new Audio("/sounds/pop2.mp3") : null;
    const degatsAudio = typeof window !== "undefined" ? new Audio("/sounds/degats.mp3") : null;

    const playDegatsSound = () => {
      const now = Date.now();
      if (now - lastDegatsSoundTime < 110) return; // Throttle to prevent overlapping audio distortion
      lastDegatsSoundTime = now;

      try {
        if (degatsAudio) {
          degatsAudio.currentTime = 0;
          degatsAudio.volume = 0.10; // 10% volume
          degatsAudio.play().catch(() => {});
        }
      } catch (_) {}
    };

    const playGrabPopSound = () => {
      try {
        const chosen = Math.random() > 0.5 ? pop1Audio : pop2Audio;
        if (chosen) {
          chosen.currentTime = 0;
          chosen.volume = 0.10; // 10% volume
          chosen.play().catch(() => {});
        }
      } catch (_) {}
    };


    // Frame update logic
    Matter.Events.on(engine, "beforeUpdate", () => {
      const dragged = mouseConstraint.body;

      // Long-Press Grab Processing
      if (targetHoldCoin && isPointerDown && !dragged) {
        const elapsed = Date.now() - holdStartTime;
        const data = (targetHoldCoin as any).coinData as CoinData;
        if (data) {
          data.holdProgress = Math.min(1.0, elapsed / HOLD_DURATION);
        }

        if (elapsed >= HOLD_DURATION) {
          // Long press duration met -> ACTIVATE GRAB & PLAY RANDOM POP SOUND (PC)!
          (mouseConstraint as any).constraint.bodyB = targetHoldCoin;
          (mouseConstraint as any).constraint.pointB = {
            x: mouse.position.x - targetHoldCoin.position.x,
            y: mouse.position.y - targetHoldCoin.position.y,
          };
          if (data) data.holdProgress = 0;
          targetHoldCoin = null;

          // Play random pop sound on desktop grab!
          if (!isMobile) {
            playGrabPopSound();
          }
        }
      }

      // Prevent mouseConstraint from attaching without long-press
      if (!dragged && !targetHoldCoin) {
        (mouseConstraint as any).constraint.bodyB = null;
      }

      if (dragged && portraitBody) {
        const pBounds = portraitBody.bounds;
        const radius = (dragged as any).coinData?.radius || 40;
        const mX = mouse.position.x;
        const mY = mouse.position.y;

        if (
          mX > pBounds.min.x - radius * 0.5 &&
          mX < pBounds.max.x + radius * 0.5 &&
          mY > pBounds.min.y - radius * 0.5 &&
          mY < pBounds.max.y + radius * 0.5
        ) {
          (mouseConstraint as any).constraint.bodyB = null;
        }
      }

      // Autonomous Life Motion & Anti-Stuck System
      coinBodies.forEach((coin) => {
        const data = (coin as any).coinData as CoinData;
        const speed = Math.hypot(coin.velocity.x, coin.velocity.y);

        if (!dragged) {
          data.wanderTimer--;
          if (data.wanderTimer <= 0) {
            data.wanderTimer = Math.floor(140 + Math.random() * 200);
            const impulseX = (Math.random() - 0.5) * 0.0012;
            const impulseY = -(0.0006 + Math.random() * 0.001);
            Matter.Body.applyForce(coin, coin.position, { x: impulseX, y: impulseY });
          }
        }

        if (speed < 0.2 && !dragged) {
          if (coin.position.y > height - 60 || coin.position.x < 50 || coin.position.x > width - 50) {
            const nudgeX = coin.position.x < width / 2 ? 0.0005 : -0.0005;
            Matter.Body.applyForce(coin, coin.position, { x: nudgeX, y: -0.0007 });
          }
        }
      });

      // Cursor hover feedback across all characters
      const hoveredCoin = getCoinNearPointer(cursorX, cursorY);
      if (mouseConstraint.body) {
        canvas.style.cursor = "grabbing";
      } else if (hoveredCoin) {
        canvas.style.cursor = "grab";
      } else {
        canvas.style.cursor = "default";
      }
    });

    // 6. Collision Start (Awwwards Rebound FX & Impact Particle Explosion)
    Matter.Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const isCoinA = (bodyA as any).coinData;
        const isCoinB = (bodyB as any).coinData;

        const targetCoin = isCoinA ? bodyA : isCoinB ? bodyB : null;
        const otherBody = targetCoin === bodyA ? bodyB : bodyA;

        if (targetCoin && (targetCoin as any).coinData) {
          const coinData = (targetCoin as any).coinData as CoinData;
          const relVx = bodyA.velocity.x - bodyB.velocity.x;
          const relVy = bodyA.velocity.y - bodyB.velocity.y;
          const impactSpeed = Math.hypot(relVx, relVy) || Math.hypot(targetCoin.velocity.x, targetCoin.velocity.y);

          // Apply organic rubber squash deformation
          coinData.squashX = 1.28;
          coinData.squashY = 0.72;

          // Immediate Impact Damage Expression (decays over ~1.5s)
          coinData.impactAmount = 1.0;

          const isWallOrBoundary =
            otherBody === ground ||
            otherBody === leftWall ||
            otherBody === rightWall ||
            otherBody === ceiling ||
            otherBody === portraitBody;

          if (isWallOrBoundary) {
            triggerCollisionFX(targetCoin.position.x, targetCoin.position.y, coinData.color, impactSpeed * 1.4);
            playDegatsSound();

            if (otherBody === portraitBody && portraitRef.current) {
              const rot = (Math.random() - 0.5) * 8;
              gsap.killTweensOf(portraitRef.current);
              gsap.fromTo(
                portraitRef.current,
                { scale: 0.978, rotationZ: rot },
                {
                  scale: 1,
                  rotationZ: 0,
                  duration: 0.65,
                  ease: "elastic.out(1.2, 0.4)",
                }
              );
            }
          } else if (impactSpeed > 1.8) {
            triggerCollisionFX(targetCoin.position.x, targetCoin.position.y, coinData.color, impactSpeed);
            playDegatsSound();
          }
        }
      });
    });


    // Helper: Draw 4-point Star with crisp geometry
    const drawStar = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      rOuter: number,
      rInner: number
    ) => {
      c.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? rOuter : rInner;
        const a = (i * Math.PI) / 4 - Math.PI / 2;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
    };

    // 7. Render Loop with High-End Vector Artwork & Fling/Hold Mechanics
    let animationFrameId: number;

    const render = () => {
      Matter.Engine.update(engine, 1000 / 60);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Render Shockwave Rings
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 1.8;
        sw.alpha -= 0.032;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Render Impact Sparks, Stars & Pixel Fragments
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        const radius = Math.max(0, p.size * alpha);

        if (radius > 0) {
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          if (p.type === "star") {
            drawStar(ctx, 0, 0, radius * 1.8, radius * 0.6);
            ctx.fill();
          } else if (p.type === "pixel") {
            ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      // Render Active Vector Awwwards Characters
      coinBodies.forEach((coin) => {
        const data = (coin as any).coinData as CoinData;

        if (data.entryScale <= 0.05) return;

        const pos = coin.position;
        const angle = coin.angle;
        const baseR = data.radius;
        const isGrabbed = mouseConstraint.body === coin;
        const isHolding = targetHoldCoin === coin && data.holdProgress > 0;

        // Organic rubber squash/stretch easing
        data.squashX += (1.0 - data.squashX) * 0.08;
        data.squashY += (1.0 - data.squashY) * 0.08;

        // Slow impact expression decay (~1.5 seconds)
        if (data.impactAmount > 0) {
          data.impactAmount = Math.max(0, data.impactAmount - 0.011);
        }

        // Periodic Blinking Logic
        data.blinkTimer--;
        if (data.blinkTimer <= 0) {
          data.isBlinking = true;
          data.blinkProgress = 0;
          data.blinkTimer = Math.floor(180 + Math.random() * 260);
        }

        if (data.isBlinking) {
          data.blinkProgress += 0.22;
          if (data.blinkProgress >= Math.PI) {
            data.isBlinking = false;
            data.blinkProgress = 0;
          }
        }

        const eyeBlinkScaleY = data.isBlinking
          ? Math.max(0.08, Math.abs(Math.cos(data.blinkProgress)))
          : 1.0;

        let targetGrabScale = 1.0;
        if (isGrabbed) targetGrabScale = 1.08;
        else if (isHolding) targetGrabScale = 0.93 + (1 - data.holdProgress) * 0.07;

        data.visualScale += (targetGrabScale - data.visualScale) * 0.15;

        const r = Math.max(0, baseR * data.visualScale * data.entryScale);
        if (r < 6) return;

        // Eye Cursor Tracking
        const dx = cursorX - pos.x;
        const dy = cursorY - pos.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pupilMaxOffset = r * 0.16;

        if (Math.hypot(cursorX - data.lastCursorX, cursorY - data.lastCursorY) < 1) {
          data.idleGlanceTimer--;
          if (data.idleGlanceTimer <= 0) {
            data.idleGlanceTimer = Math.floor(90 + Math.random() * 150);
            data.idleGlanceX = (Math.random() - 0.5) * (pupilMaxOffset * 0.8);
            data.idleGlanceY = (Math.random() - 0.5) * (pupilMaxOffset * 0.8);
          }
        } else {
          data.idleGlanceX *= 0.9;
          data.idleGlanceY *= 0.9;
        }
        data.lastCursorX = cursorX;
        data.lastCursorY = cursorY;

        const targetPx = (dx / dist) * pupilMaxOffset + data.idleGlanceX;
        const targetPy = (dy / dist) * pupilMaxOffset + data.idleGlanceY;

        data.pupilX += (targetPx - data.pupilX) * 0.12;
        data.pupilY += (targetPy - data.pupilY) * 0.12;

        const px = data.pupilX;
        const py = data.pupilY;

        ctx.save();
        ctx.globalAlpha = Math.min(1.0, Math.max(0, data.entryOpacity));
        ctx.translate(pos.x, pos.y);
        ctx.rotate(angle);
        ctx.scale(data.squashX, data.squashY);

        // 1. Drop Shadow (Disabled on mobile for zero GPU lag & locked 60FPS)
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        if (!isMobile) {
          ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
          ctx.shadowBlur = isGrabbed ? 22 : 12;
          ctx.shadowOffsetX = isGrabbed ? 6 : 3;
          ctx.shadowOffsetY = isGrabbed ? 12 : 6;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.restore();

        // 2. Main Token Face Fill
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = data.color;
        ctx.fill();

        // 3. Bold Black Outer Border
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // 4. Long-Press Hold Progress Ring Indicator
        if (isHolding && data.holdProgress > 0) {
          ctx.beginPath();
          ctx.arc(0, 0, r - 2, -Math.PI / 2, -Math.PI / 2 + data.holdProgress * Math.PI * 2);
          ctx.strokeStyle = "#111111";
          ctx.lineWidth = 4;
          ctx.stroke();
        }

        // 5. Inset Accent Ring Line
        const insetRadius = Math.max(0, r - 5);
        if (insetRadius > 0) {
          ctx.beginPath();
          ctx.arc(0, 0, insetRadius, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(17, 17, 17, 0.28)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // 6. Render Clean Vector Face Artwork (#111111)
        const eyeSpacing = r * 0.32;
        const eyeY = -r * 0.12;
        const eyeRadius = r * 0.13;
        const imp = data.impactAmount;

        ctx.fillStyle = "#111111";
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 3.2;
        ctx.lineCap = "round";

        switch (data.faceType) {
          case "yellow_brows": {
            ctx.save();
            ctx.translate(-eyeSpacing, eyeY);
            ctx.scale(1, eyeBlinkScaleY);

            ctx.beginPath();
            ctx.moveTo(-eyeRadius - 2, -eyeRadius - 5);
            ctx.quadraticCurveTo(0, -eyeRadius - 10, eyeRadius + 2, -eyeRadius - 5);
            ctx.stroke();

            if (imp > 0.2) {
              const sz = eyeRadius * 0.8;
              ctx.beginPath();
              ctx.moveTo(-sz, -sz);
              ctx.lineTo(sz, sz);
              ctx.moveTo(sz, -sz);
              ctx.lineTo(-sz, sz);
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.arc(px * 0.8, py * 0.8, eyeRadius * 0.9, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            ctx.save();
            ctx.translate(eyeSpacing, eyeY);
            ctx.scale(1, eyeBlinkScaleY);

            ctx.beginPath();
            ctx.moveTo(-eyeRadius - 2, -eyeRadius - 5);
            ctx.quadraticCurveTo(0, -eyeRadius - 10, eyeRadius + 2, -eyeRadius - 5);
            ctx.stroke();

            if (imp > 0.2) {
              const sz = eyeRadius * 0.8;
              ctx.beginPath();
              ctx.moveTo(-sz, -sz);
              ctx.lineTo(sz, sz);
              ctx.moveTo(sz, -sz);
              ctx.lineTo(-sz, sz);
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.arc(px * 0.8, py * 0.8, eyeRadius * 0.9, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            if (imp > 0.2) {
              ctx.beginPath();
              ctx.moveTo(-r * 0.22, r * 0.2);
              ctx.quadraticCurveTo(-r * 0.1, r * 0.1, 0, r * 0.2);
              ctx.quadraticCurveTo(r * 0.1, r * 0.3, r * 0.22, r * 0.2);
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.arc(0, r * 0.1, r * 0.22, 0.15 * Math.PI, 0.85 * Math.PI, false);
              ctx.stroke();
            }
            break;
          }

          case "orange_minimal": {
            ctx.save();
            ctx.translate(-eyeSpacing, eyeY);
            ctx.scale(1, eyeBlinkScaleY);

            if (imp > 0.2) {
              ctx.beginPath();
              ctx.arc(0, 0, eyeRadius * 1.3, 0, Math.PI * 2);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(0, 0, eyeRadius * 0.4, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.beginPath();
              ctx.arc(px * 0.8, py * 0.8, eyeRadius * 0.95, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            ctx.save();
            ctx.translate(eyeSpacing, eyeY);
            ctx.scale(1, eyeBlinkScaleY);

            if (imp > 0.2) {
              ctx.beginPath();
              ctx.arc(0, 0, eyeRadius * 1.3, 0, Math.PI * 2);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(0, 0, eyeRadius * 0.4, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.beginPath();
              ctx.arc(px * 0.8, py * 0.8, eyeRadius * 0.95, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            if (imp > 0.2) {
              ctx.beginPath();
              ctx.arc(0, r * 0.22, r * 0.14, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.beginPath();
              ctx.arc(0, r * 0.1, r * 0.2, 0.1 * Math.PI, 0.9 * Math.PI, false);
              ctx.stroke();
            }
            break;
          }

          case "purple_chill": {
            ctx.save();
            ctx.translate(-eyeSpacing, eyeY);
            ctx.scale(1, eyeBlinkScaleY);

            ctx.beginPath();
            ctx.moveTo(-eyeRadius - 3, -eyeRadius - 5);
            ctx.lineTo(eyeRadius + 3, -eyeRadius - 5);
            ctx.lineWidth = 3.2;
            ctx.stroke();

            if (imp > 0.2) {
              const sz = eyeRadius * 0.8;
              ctx.beginPath();
              ctx.moveTo(-sz, -sz);
              ctx.lineTo(sz, sz);
              ctx.moveTo(sz, -sz);
              ctx.lineTo(-sz, sz);
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.arc(px * 0.8, py * 0.8, eyeRadius * 0.9, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            ctx.save();
            ctx.translate(eyeSpacing, eyeY);
            ctx.scale(1, eyeBlinkScaleY);

            ctx.beginPath();
            ctx.moveTo(-eyeRadius - 3, -eyeRadius - 5);
            ctx.lineTo(eyeRadius + 3, -eyeRadius - 5);
            ctx.lineWidth = 3.2;
            ctx.stroke();

            if (imp > 0.2) {
              const sz = eyeRadius * 0.8;
              ctx.beginPath();
              ctx.moveTo(-sz, -sz);
              ctx.lineTo(sz, sz);
              ctx.moveTo(sz, -sz);
              ctx.lineTo(-sz, sz);
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.arc(px * 0.8, py * 0.8, eyeRadius * 0.9, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            if (imp > 0.2) {
              ctx.beginPath();
              ctx.moveTo(-r * 0.2, r * 0.2);
              ctx.lineTo(-r * 0.08, r * 0.14);
              ctx.lineTo(0, r * 0.22);
              ctx.lineTo(r * 0.1, r * 0.14);
              ctx.lineTo(r * 0.2, r * 0.2);
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.moveTo(-r * 0.22, r * 0.18);
              ctx.lineTo(r * 0.22, r * 0.18);
              ctx.stroke();
            }
            break;
          }

          case "pink_happy": {
            ctx.save();
            ctx.translate(-eyeSpacing, eyeY);
            ctx.scale(1, eyeBlinkScaleY);

            if (imp > 0.2) {
              drawStar(ctx, 0, 0, eyeRadius * 1.3, eyeRadius * 0.5);
              ctx.fill();
            } else {
              ctx.beginPath();
              ctx.arc(px, py, eyeRadius * 0.95, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            ctx.save();
            ctx.translate(eyeSpacing, eyeY);
            ctx.scale(1, eyeBlinkScaleY);

            if (imp > 0.2) {
              drawStar(ctx, 0, 0, eyeRadius * 1.3, eyeRadius * 0.5);
              ctx.fill();
            } else {
              ctx.beginPath();
              ctx.arc(px, py, eyeRadius * 0.95, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            if (imp > 0.2) {
              ctx.beginPath();
              ctx.arc(0, r * 0.12, r * 0.22, 0, Math.PI, false);
              ctx.fill();
            } else {
              ctx.beginPath();
              ctx.arc(0, r * 0.08, r * 0.24, 0, Math.PI, false);
              ctx.fill();
            }
            break;
          }

          case "white_sparkle": {
            const starR = eyeRadius * 1.35;

            ctx.save();
            ctx.translate(-eyeSpacing + px * 0.65, eyeY + py * 0.65);
            ctx.scale(1, eyeBlinkScaleY);

            if (imp > 0.2) {
              drawStar(ctx, 0, 0, starR * 1.2, starR * 0.4);
              ctx.fill();
            } else {
              drawStar(ctx, 0, 0, starR, starR * 0.42);
              ctx.fillStyle = "#111111";
              ctx.fill();
            }
            ctx.restore();

            ctx.save();
            ctx.translate(eyeSpacing + px * 0.65, eyeY + py * 0.65);
            ctx.scale(1, eyeBlinkScaleY);

            if (imp > 0.2) {
              drawStar(ctx, 0, 0, starR * 1.2, starR * 0.4);
              ctx.fill();
            } else {
              drawStar(ctx, 0, 0, starR, starR * 0.42);
              ctx.fillStyle = "#111111";
              ctx.fill();
            }
            ctx.restore();

            ctx.fillStyle = "#111111";
            if (imp > 0.2) {
              ctx.beginPath();
              ctx.arc(0, r * 0.2, r * 0.12, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.beginPath();
              ctx.arc(0, r * 0.12, r * 0.2, 0.1 * Math.PI, 0.9 * Math.PI, false);
              ctx.stroke();
            }
            break;
          }
        }

        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // 8. Handle Window Resize
    const handleResize = () => {
      if (!container || !canvas) return;
      updateCanvasDimensions();

      Matter.Body.setPosition(ground, { x: width / 2, y: height + wallThickness / 2 - 10 });
      Matter.Body.setPosition(rightWall, { x: width + wallThickness / 2 - 10, y: height / 2 });
      updatePortraitBody();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleDeviceOrientation, true);
        window.removeEventListener("devicemotion", handleDeviceMotion, true);
      }
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchend", handlePointerUp);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      cancelAnimationFrame(animationFrameId);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [containerRef, portraitRef, enabled, siteStarted]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-15 pointer-events-auto w-full h-full"
    />
  );
}
