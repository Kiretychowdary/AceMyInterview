// NMKRSPVLIDATA - AI HR Avatar with Realistic 3D Face, Lip Sync & Animations
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const AIHRAvatar = ({ isSpeaking, currentText, emotion = 'neutral' }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const avatarRef = useRef(null);
  const mixerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 2.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 4, 3);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x88ccff, 0.3);
    fillLight.position.set(-2, 2, -2);
    scene.add(fillLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 5;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 1.4, 0);

    // Create Simple 3D Avatar (Professional HR Look)
    createAvatarMesh(scene);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      const delta = clock.getDelta();
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Idle animation - subtle breathing
      if (avatarRef.current && !isSpeaking) {
        const time = clock.getElapsedTime();
        avatarRef.current.position.y = Math.sin(time * 2) * 0.01;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Create avatar mesh
  const createAvatarMesh = (scene) => {
    const group = new THREE.Group();

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const skinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xfdbcb4,
      roughness: 0.6,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 1.6;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hairGeometry = new THREE.SphereGeometry(0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const hairMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3d2817,
      roughness: 0.8
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 1.75;
    group.add(hair);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.04, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2c1810,
      roughness: 0.2,
      metalness: 0.8
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 1.65, 0.25);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.1, 1.65, 0.25);
    group.add(rightEye);

    // Mouth - for lip sync
    const mouthGeometry = new THREE.CapsuleGeometry(0.02, 0.1, 8, 16);
    const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b6b });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.rotation.z = Math.PI / 2;
    mouth.position.set(0, 1.45, 0.28);
    mouth.name = 'mouth';
    group.add(mouth);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.25, 16);
    const neck = new THREE.Mesh(neckGeometry, skinMaterial);
    neck.position.y = 1.35;
    group.add(neck);

    // Body (Professional Suit)
    const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.35, 0.8, 16);
    const suitMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a2e,
      roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, suitMaterial);
    body.position.y = 0.7;
    group.add(body);

    // Shoulders
    const shoulderGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const leftShoulder = new THREE.Mesh(shoulderGeometry, suitMaterial);
    leftShoulder.position.set(-0.35, 1.0, 0);
    group.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeometry, suitMaterial);
    rightShoulder.position.set(0.35, 1.0, 0);
    group.add(rightShoulder);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);
    const leftArm = new THREE.Mesh(armGeometry, suitMaterial);
    leftArm.position.set(-0.4, 0.6, 0);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, suitMaterial);
    rightArm.position.set(0.4, 0.6, 0);
    rightArm.rotation.z = -0.2;
    group.add(rightArm);

    // Hands
    const handGeometry = new THREE.SphereGeometry(0.09, 16, 16);
    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.set(-0.45, 0.25, 0);
    group.add(leftHand);

    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.set(0.45, 0.25, 0);
    group.add(rightHand);

    // Collar/Shirt
    const collarGeometry = new THREE.RingGeometry(0.15, 0.2, 16);
    const shirtMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    const collar = new THREE.Mesh(collarGeometry, shirtMaterial);
    collar.position.set(0, 1.2, 0.1);
    collar.rotation.x = Math.PI / 2;
    group.add(collar);

    scene.add(group);
    avatarRef.current = group;
    setIsLoaded(true);
  };

  // Lip sync animation
  useEffect(() => {
    if (!avatarRef.current || !isSpeaking) return;

    const mouth = avatarRef.current.getObjectByName('mouth');
    if (!mouth) return;

    let animationFrame;
    const animateLipSync = () => {
      const time = Date.now() * 0.01;
      
      // Simulate lip movement based on speech
      const openAmount = Math.abs(Math.sin(time * 3)) * 0.15;
      mouth.scale.y = 1 + openAmount;
      
      // Slight mouth width variation
      mouth.scale.x = 1 + Math.abs(Math.sin(time * 2)) * 0.05;

      animationFrame = requestAnimationFrame(animateLipSync);
    };

    animateLipSync();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (mouth) {
        mouth.scale.set(1, 1, 1);
      }
    };
  }, [isSpeaking]);

  // Emotion-based facial expressions
  useEffect(() => {
    if (!avatarRef.current) return;

    const leftEye = avatarRef.current.children.find(c => c.position.x < 0 && c.position.y > 1.6);
    const rightEye = avatarRef.current.children.find(c => c.position.x > 0 && c.position.y > 1.6);

    switch (emotion) {
      case 'happy':
        // Slightly raised eyes, smile
        if (leftEye && rightEye) {
          leftEye.position.y = 1.67;
          rightEye.position.y = 1.67;
        }
        break;
      case 'thinking':
        // Slightly tilted head
        avatarRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
        break;
      case 'neutral':
      default:
        if (leftEye && rightEye) {
          leftEye.position.y = 1.65;
          rightEye.position.y = 1.65;
        }
        avatarRef.current.rotation.y = 0;
    }
  }, [emotion]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* AI HR Badge */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
          <span className="text-sm font-semibold text-gray-800">AI HR Interviewer</span>
        </div>
      </div>

      {/* Current Speech Text */}
      {currentText && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <p className="text-sm text-gray-800 font-medium">{currentText}</p>
        </div>
      )}

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading AI HR...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIHRAvatar;
