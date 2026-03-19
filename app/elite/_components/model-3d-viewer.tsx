"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ── Model definitions ──────────────────────────────────────────────────────
type Atom = { element: string; pos: [number, number, number]; color: string; radius: number };
type Bond = { from: number; to: number };
type Model3D = { name: string; subject: string; atoms?: Atom[]; bonds?: Bond[]; type: "molecule" | "wave" | "cell" };

const MODELS: Model3D[] = [
  // Chemistry
  {
    name: "Water (H₂O)", subject: "Chemistry", type: "molecule",
    atoms: [
      { element: "O", pos: [0, 0, 0],       color: "#ff4444", radius: 0.4 },
      { element: "H", pos: [-0.8, -0.6, 0], color: "#ffffff", radius: 0.25 },
      { element: "H", pos: [0.8, -0.6, 0],  color: "#ffffff", radius: 0.25 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }],
  },
  {
    name: "Carbon Dioxide (CO₂)", subject: "Chemistry", type: "molecule",
    atoms: [
      { element: "C", pos: [0, 0, 0],   color: "#888888", radius: 0.35 },
      { element: "O", pos: [-1.2, 0, 0], color: "#ff4444", radius: 0.4 },
      { element: "O", pos: [1.2, 0, 0],  color: "#ff4444", radius: 0.4 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }],
  },
  {
    name: "Methane (CH₄)", subject: "Chemistry", type: "molecule",
    atoms: [
      { element: "C", pos: [0, 0, 0],          color: "#888888", radius: 0.35 },
      { element: "H", pos: [0.9, 0.9, 0.9],    color: "#ffffff", radius: 0.25 },
      { element: "H", pos: [-0.9, -0.9, 0.9],  color: "#ffffff", radius: 0.25 },
      { element: "H", pos: [-0.9, 0.9, -0.9],  color: "#ffffff", radius: 0.25 },
      { element: "H", pos: [0.9, -0.9, -0.9],  color: "#ffffff", radius: 0.25 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }, { from: 0, to: 4 }],
  },
  {
    name: "Ammonia (NH₃)", subject: "Chemistry", type: "molecule",
    atoms: [
      { element: "N", pos: [0, 0.3, 0],       color: "#4444ff", radius: 0.38 },
      { element: "H", pos: [-0.9, -0.4, 0.5], color: "#ffffff", radius: 0.25 },
      { element: "H", pos: [0.9, -0.4, 0.5],  color: "#ffffff", radius: 0.25 },
      { element: "H", pos: [0, -0.4, -1.0],   color: "#ffffff", radius: 0.25 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }],
  },
  // Physics — sine wave
  { name: "Sine Wave", subject: "Physics", type: "wave" },
  // Biology — simplified cell
  { name: "Animal Cell", subject: "Biology", type: "cell" },
];

// ── Build molecule scene ───────────────────────────────────────────────────
function buildMolecule(scene: THREE.Scene, model: Model3D) {
  if (!model.atoms) return;
  const atomMeshes: THREE.Mesh[] = [];

  model.atoms.forEach((atom) => {
    const geo = new THREE.SphereGeometry(atom.radius, 32, 32);
    const mat = new THREE.MeshPhongMaterial({ color: atom.color, shininess: 80 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...atom.pos);
    scene.add(mesh);
    atomMeshes.push(mesh);
  });

  model.bonds?.forEach(({ from, to }) => {
    const a = new THREE.Vector3(...model.atoms![from].pos);
    const b = new THREE.Vector3(...model.atoms![to].pos);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const geo = new THREE.CylinderGeometry(0.08, 0.08, len, 12);
    const mat = new THREE.MeshPhongMaterial({ color: "#cccccc" });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    scene.add(mesh);
  });
}

// ── Build wave scene ───────────────────────────────────────────────────────
function buildWave(scene: THREE.Scene) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = (i / 100) * 6 - 3;
    points.push(new THREE.Vector3(x, Math.sin(x * 2) * 0.8, 0));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color: "#FF8D28", linewidth: 2 });
  scene.add(new THREE.Line(geo, mat));

  // Axes
  const axisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-3.5, 0, 0), new THREE.Vector3(3.5, 0, 0),
  ]);
  scene.add(new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: "#555" })));
}

// ── Build cell scene ───────────────────────────────────────────────────────
function buildCell(scene: THREE.Scene) {
  // Cell membrane
  const memGeo = new THREE.TorusGeometry(1.8, 0.08, 16, 100);
  const memMat = new THREE.MeshPhongMaterial({ color: "#4CAF50", transparent: true, opacity: 0.8 });
  scene.add(new THREE.Mesh(memGeo, memMat));

  // Nucleus
  const nucGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const nucMat = new THREE.MeshPhongMaterial({ color: "#2196F3" });
  scene.add(new THREE.Mesh(nucGeo, nucMat));

  // Mitochondria
  [[-1.1, 0.6, 0], [1.1, -0.5, 0], [0.3, 1.1, 0]].forEach(([x, y, z]) => {
    const geo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 12);
    const mat = new THREE.MeshPhongMaterial({ color: "#FF9800" });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.z = Math.random() * Math.PI;
    scene.add(mesh);
  });

  // Ribosomes (tiny dots)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const r = 1.1 + Math.random() * 0.4;
    const geo = new THREE.SphereGeometry(0.07, 8, 8);
    const mat = new THREE.MeshPhongMaterial({ color: "#E91E63" });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
    scene.add(mesh);
  }
}

// ── Component ──────────────────────────────────────────────────────────────
export const Model3DViewer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a0a0a");

    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const model = MODELS[activeIdx];
    if (model.type === "molecule") buildMolecule(scene, model);
    else if (model.type === "wave")  buildWave(scene);
    else if (model.type === "cell")  buildCell(scene);

    // Auto-rotate
    let angle = 0;
    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      angle += 0.008;
      scene.rotation.y = angle;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      renderer.dispose();
    };
  }, [activeIdx]);

  const model = MODELS[activeIdx];

  const subjectColor = {
    Chemistry: "text-green-400 bg-green-900/30 border-green-700/40",
    Physics:   "text-blue-400 bg-blue-900/30 border-blue-700/40",
    Biology:   "text-pink-400 bg-pink-900/30 border-pink-700/40",
  }[model.subject] ?? "text-zinc-400 bg-zinc-800 border-zinc-700";

  return (
    <div className="bg-zinc-950 border border-yellow-500/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-yellow-400 text-lg">⚛</span>
          <span className="text-white font-semibold text-sm">3D Interactive Models</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-bold">ELITE</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${subjectColor}`}>
          {model.subject}
        </span>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas ref={canvasRef} className="w-full h-64" style={{ display: "block" }} />
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <p className="text-white text-sm font-semibold">{model.name}</p>
          <p className="text-zinc-400 text-xs">Drag to rotate • Scroll to zoom</p>
        </div>
      </div>

      {/* Model selector */}
      <div className="p-3 flex flex-wrap gap-2">
        {MODELS.map((m, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              i === activeIdx
                ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Legend for molecules */}
      {model.type === "molecule" && model.atoms && (
        <div className="px-4 pb-4 flex flex-wrap gap-3">
          {[...new Set(model.atoms.map(a => a.element))].map(el => {
            const atom = model.atoms!.find(a => a.element === el)!;
            return (
              <div key={el} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <div className="w-3 h-3 rounded-full" style={{ background: atom.color }} />
                {el}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};