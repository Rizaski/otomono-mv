// Import Three.js (ES Module)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {
    OrbitControls
} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, jersey, controls;

// Initialize the 3D Scene
init();
animate();

function init() {
    const canvas = document.getElementById('jerseyCanvas');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 3);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(ambient, dirLight);

    // Jersey Base (Cylinder as placeholder)
    const geometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 64);
    const material = new THREE.MeshStandardMaterial({
        color: 0x00aaff,
        roughness: 0.6,
        metalness: 0.2
    });
    jersey = new THREE.Mesh(geometry, material);
    jersey.castShadow = true;
    jersey.receiveShadow = true;
    scene.add(jersey);

    // Ground Plane (optional visual depth)
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({
            color: 0x222222
        })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.75;
    scene.add(ground);

    // Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 6;

    // Responsive Resize
    window.addEventListener('resize', onWindowResize);

    // Connect UI Controls
    setupUI(material);
}

// Responsive Resizing
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animate the Scene
function animate() {
    requestAnimationFrame(animate);
    jersey.rotation.y += 0.005;
    controls.update();
    renderer.render(scene, camera);
}

// UI Logic for Customization
function setupUI(material) {
    const primaryColor = document.getElementById('primaryColor');
    const secondaryColor = document.getElementById('secondaryColor');
    const metalness = document.getElementById('metalness');
    const roughness = document.getElementById('roughness');
    const resetBtn = document.getElementById('resetBtn');
    const saveBtn = document.getElementById('saveBtn');

    primaryColor.addEventListener('input', () => {
        material.color.set(primaryColor.value);
    });

    secondaryColor.addEventListener('input', () => {
        scene.background = new THREE.Color(secondaryColor.value);
    });

    metalness.addEventListener('input', () => {
        material.metalness = parseFloat(metalness.value);
    });

    roughness.addEventListener('input', () => {
        material.roughness = parseFloat(roughness.value);
    });

    resetBtn.addEventListener('click', () => {
        primaryColor.value = "#00aaff";
        secondaryColor.value = "#ffffff";
        metalness.value = 0.2;
        roughness.value = 0.6;

        material.color.set(0x00aaff);
        scene.background = new THREE.Color(0x111111);
        material.metalness = 0.2;
        material.roughness = 0.6;
    });

    saveBtn.addEventListener('click', () => {
        renderer.render(scene, camera);
        const dataURL = renderer.domElement.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "jersey-design.png";
        link.href = dataURL;
        link.click();
    });
}