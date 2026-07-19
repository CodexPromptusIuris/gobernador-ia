import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 400);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const pCount = 250;
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) positions[i] = (Math.random() - 0.5) * 800;
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ size: 1.5, color: 0x1a1a2e, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    scene.add(new THREE.Points(pGeo, pMat));

    const iGeo = new THREE.IcosahedronGeometry(80, 2);
    const iMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e, wireframe: true, transparent: true, opacity: 0.08 });
    const iMesh = new THREE.Mesh(iGeo, iMat);
    scene.add(iMesh);

    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => { mouseX = (e.clientX / window.innerWidth) * 2 - 1; mouseY = -(e.clientY / window.innerHeight) * 2 + 1; };
    window.addEventListener("mousemove", onMouse);

    const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
    window.addEventListener("resize", onResize);

    let frameId;
    const animate = () => {
      iMesh.rotation.y += 0.001; iMesh.rotation.x += 0.0005;
      const particles = scene.children[0]; if (particles) particles.rotation.y += 0.0005;
      camera.position.x += (mouseX * 30 - camera.position.x) * 0.03;
      camera.position.y += (mouseY * 30 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement.parentNode) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose(); pGeo.dispose(); pMat.dispose(); iGeo.dispose(); iMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
}
