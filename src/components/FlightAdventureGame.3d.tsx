import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, RotateCcw, Award, Shield, Zap } from 'lucide-react';

export const FlightAdventureGame: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'title' | 'playing' | 'gameover'>('title');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // PBR Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Composite Procedural Jet Model (3-12 parts)
    const jetGroup = new THREE.Group();

    // Fuselage
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, metalness: 0.8, roughness: 0.2 });
    const fuselage = new THREE.Mesh(new THREE.ConeGeometry(0.8, 4, 8), bodyMat);
    fuselage.rotation.x = Math.PI / 2;
    jetGroup.add(fuselage);

    // Wings
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, metalness: 0.5, roughness: 0.3 });
    const wings = new THREE.Mesh(new THREE.BoxGeometry(5, 0.1, 1.2), wingMat);
    wings.position.set(0, 0, 0.5);
    jetGroup.add(wings);

    // Cockpit Canopy
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7, roughness: 0.1 });
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), glassMat);
    canopy.position.set(0, 0.3, 0.5);
    canopy.scale.set(1, 0.8, 1.8);
    jetGroup.add(canopy);

    scene.add(jetGroup);
    jetGroup.position.set(0, 0, 0);

    // Procedural Rings / Obstacles
    const rings: THREE.Mesh[] = [];
    const ringGeo = new THREE.TorusGeometry(2, 0.15, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.5 });

    for (let i = 0; i < 8; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, -20 - i * 15);
      scene.add(ring);
      rings.push(ring);
    }

    // Grid Floor
    const grid = new THREE.GridHelper(200, 50, 0x4f46e5, 0x1e293b);
    grid.position.y = -6;
    scene.add(grid);

    // Controls
    let moveX = 0;
    let moveY = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') moveX = -0.15;
      if (e.key === 'ArrowRight' || e.key === 'd') moveX = 0.15;
      if (e.key === 'ArrowUp' || e.key === 'w') moveY = 0.15;
      if (e.key === 'ArrowDown' || e.key === 's') moveY = -0.15;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'ArrowRight', 'd'].includes(e.key)) moveX = 0;
      if (['ArrowUp', 'w', 'ArrowDown', 's'].includes(e.key)) moveY = 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let currentScore = 0;
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Move jet
      jetGroup.position.x += moveX;
      jetGroup.position.y += moveY;
      jetGroup.rotation.z = -moveX * 1.5;

      // Animate rings
      rings.forEach(ring => {
        ring.position.z += 0.3;
        if (ring.position.z > 5) {
          ring.position.z = -100;
          ring.position.x = (Math.random() - 0.5) * 10;
          ring.position.y = (Math.random() - 0.5) * 6;
          currentScore += 10;
          setScore(currentScore);
        }

        // Collision check with jet
        const dist = jetGroup.position.distanceTo(ring.position);
        if (dist < 2.2) {
          currentScore += 50;
          setScore(currentScore);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [gameState]);

  return (
    <div className="relative w-full h-[450px] bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Game UI Overlay */}
      {gameState === 'title' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center space-y-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">FPPS 3D Flight Simulator</h3>
          <p className="text-xs text-slate-300 max-w-xs">
            Pilot your aircraft through navigation rings in 3D PBR space. Use WASD or Arrow keys to steer.
          </p>
          <button
            onClick={() => setGameState('playing')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition flex items-center space-x-2 text-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Flight Mission</span>
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none px-2">
          <div className="bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-slate-700/50 text-xs font-bold tabular-nums">
            Score: {score}
          </div>
          <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs font-bold">
            60 FPS · 3D Active
          </div>
        </div>
      )}
    </div>
  );
};
