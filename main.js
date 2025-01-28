const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

// Parameters
const particleCount = 300;
const particleSize = 0.03;
const connectionDistance = 2;
const phosphorGreen = new THREE.Color(0x00ff9f);
const grayColor = new THREE.Color(0x808080);

// Create particles
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

// Line material for connections
const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
});

// Store particles for connection calculations
const particles = [];

for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 15;
    const y = (Math.random() - 0.5) * 15;
    const z = (Math.random() - 0.5) * 15;
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    const mix = Math.random();
    const color = new THREE.Color().lerpColors(grayColor, phosphorGreen, mix);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    
    particles.push(new THREE.Vector3(x, y, z));
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Point material
const pointsMaterial = new THREE.PointsMaterial({
    size: particleSize,
    vertexColors: true,
    blending: THREE.AdditiveBlending
});

const pointCloud = new THREE.Points(geometry, pointsMaterial);
scene.add(pointCloud);

// Lines for connections
const lineGeometry = new THREE.BufferGeometry();
const linePositions = [];
const lineColors = [];

function updateConnections() {
    linePositions.length = 0;
    lineColors.length = 0;
    
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const distance = particles[i].distanceTo(particles[j]);
            
            if (distance < connectionDistance) {
                linePositions.push(particles[i].x, particles[i].y, particles[i].z);
                linePositions.push(particles[j].x, particles[j].y, particles[j].z);
                
                const alpha = 1 - (distance / connectionDistance);
                const color = new THREE.Color().lerpColors(grayColor, phosphorGreen, alpha);
                lineColors.push(color.r, color.g, color.b);
                lineColors.push(color.r, color.g, color.b);
            }
        }
    }
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
}

const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lines);

// Scene setup
scene.fog = new THREE.FogExp2(0x000000, 0.05);
camera.position.z = 15;

// Animation
function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Update particle positions with wave motion
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        particle.y += Math.sin(time + particle.x) * 0.003;
        particle.x += Math.cos(time + particle.y) * 0.003;
        
        positions[i * 3] = particle.x;
        positions[i * 3 + 1] = particle.y;
        positions[i * 3 + 2] = particle.z;
    }
    
    geometry.attributes.position.needsUpdate = true;
    updateConnections();
    
    renderer.render(scene, camera);
}

// Window resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();