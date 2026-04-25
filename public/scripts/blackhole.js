// Black Hole Canvas — Gargantua-inspired with orbiting topic stars
// Supports Stars ↔ Cards view toggle with animated transition
(function () {
  const canvas = document.getElementById('space');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById('tooltip');
  const ttTitle = document.getElementById('ttTitle');
  const ttDesc = document.getElementById('ttDesc');
  const ttTag = document.getElementById('ttTag');
  const dotsLayer = document.getElementById('dotsLayer');
  const cardsLayer = document.getElementById('cardsLayer');
  const cardsGrid = document.getElementById('cardsGrid');
  const pageLabel = document.getElementById('pageLabel');

  let W, H, cx, cy;
  let currentView = 'stars'; // 'stars' | 'cards'
  let drawStars = true; // whether to render topic stars on canvas

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W / 2;
    cy = H / 2;
  }
  resize();
  window.addEventListener('resize', resize);

  // Load topics
  const topics = window.__TOPICS__ && window.__TOPICS__.length > 0
    ? window.__TOPICS__
    : [{ title: 'Add topics', description: 'Create .md files in src/content/want-to-learn/', tag: 'setup' }];

  // Black hole parameters
  const BH_RADIUS = 52;
  const DISK_INNER = 60;
  const DISK_OUTER = 180;
  const t0 = Date.now();

  // Create orbiting stars
  const stars = topics.map((topic, i) => {
    const orbitRadius = 120 + Math.random() * (Math.min(W, H) * 0.32);
    const angle = (Math.PI * 2 * i / topics.length) + Math.random() * 0.5;
    const speed = (0.0003 + Math.random() * 0.0006) * (Math.random() > 0.5 ? 1 : -1);
    const eccentricity = 0.7 + Math.random() * 0.5;
    const size = 2.5 + Math.random() * 2;
    return {
      ...topic, orbitRadius, angle, speed, eccentricity, size,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.02 + Math.random() * 0.03,
      x: 0, y: 0,
    };
  });

  // Background stars
  const bgStars = Array.from({ length: 200 }, () => ({
    x: Math.random() * 4000 - 500,
    y: Math.random() * 3000 - 200,
    size: Math.random() * 1.2,
    alpha: 0.2 + Math.random() * 0.5,
    twinkle: Math.random() * Math.PI * 2,
  }));

  let mouseX = -1000, mouseY = -1000;
  let hoveredStar = null;

  canvas.addEventListener('mousemove', (e) => {
    if (currentView !== 'stars') return;
    mouseX = e.clientX;
    mouseY = e.clientY;

    hoveredStar = null;
    for (const star of stars) {
      const dx = mouseX - star.x;
      const dy = mouseY - star.y;
      if (Math.sqrt(dx * dx + dy * dy) < 28) {
        hoveredStar = star;
        break;
      }
    }

    if (hoveredStar) {
      canvas.style.cursor = 'pointer';
      ttTitle.textContent = hoveredStar.title;
      ttDesc.textContent = hoveredStar.description;
      ttTag.textContent = hoveredStar.tag;
      tooltip.classList.add('visible');
      let tx = mouseX + 18;
      let ty = mouseY - 10;
      if (tx + 270 > W) tx = mouseX - 278;
      if (ty + 100 > H) ty = mouseY - 100;
      tooltip.style.left = tx + 'px';
      tooltip.style.top = ty + 'px';
    } else {
      canvas.style.cursor = 'default';
      tooltip.classList.remove('visible');
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredStar = null;
    tooltip.classList.remove('visible');
  });

  // ═══════════════════════════════════════
  // VIEW TOGGLE — Stars ↔ Cards animation
  // ═══════════════════════════════════════

  // Build card DOM elements once
  function buildCards() {
    cardsGrid.innerHTML = '';
    topics.forEach((topic) => {
      const card = document.createElement('div');
      card.className = 'someday-card';
      card.innerHTML = `
        <span class="sc-tag">${topic.tag}</span>
        <div class="sc-title">${topic.title}</div>
        <div class="sc-desc">${topic.description}</div>
      `;
      cardsGrid.appendChild(card);
    });
  }
  buildCards();

  function transitionToCards() {
    currentView = 'cards';
    hoveredStar = null;
    tooltip.classList.remove('visible');
    canvas.style.cursor = 'default';

    // Hide page label
    pageLabel.classList.add('hidden');

    // Create glowing dots at each star's current canvas position
    dotsLayer.innerHTML = '';
    const dotSize = 12; // visible starting size
    const dots = stars.map((star, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      // Center the dot on the star position
      dot.style.left = (star.x - dotSize / 2) + 'px';
      dot.style.top = (star.y - dotSize / 2) + 'px';
      dot.style.width = dotSize + 'px';
      dot.style.height = dotSize + 'px';
      dotsLayer.appendChild(dot);
      return dot;
    });

    // Stop drawing topic stars on canvas (black hole + bg stars continue)
    drawStars = false;

    // Measure card grid positions while cards layer is invisible
    cardsLayer.style.transition = 'none';
    cardsLayer.style.opacity = '0';
    cardsLayer.style.pointerEvents = 'none';
    cardsLayer.classList.add('visible');

    const cardEls = cardsGrid.querySelectorAll('.someday-card');
    const cardRects = Array.from(cardEls).map(el => el.getBoundingClientRect());

    // Let the dots render at star positions for one frame, then fly to card positions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dots.forEach((dot, i) => {
          const rect = cardRects[i];
          if (!rect) return;
          dot.classList.add('to-card');
          dot.style.left = rect.left + 'px';
          dot.style.top = rect.top + 'px';
          dot.style.width = rect.width + 'px';
          dot.style.height = rect.height + 'px';
        });

        // After flight animation completes, show real cards and remove dots
        setTimeout(() => {
          cardsLayer.style.transition = '';
          cardsLayer.style.opacity = '1';
          cardsLayer.style.pointerEvents = 'auto';
          dotsLayer.innerHTML = '';
        }, 1300);
      });
    });
  }

  function transitionToStars() {
    currentView = 'stars';

    // Get current card positions
    const cardEls = cardsGrid.querySelectorAll('.someday-card');
    const cardRects = Array.from(cardEls).map(el => el.getBoundingClientRect());

    // Hide cards layer immediately
    cardsLayer.style.transition = 'none';
    cardsLayer.style.opacity = '0';
    cardsLayer.style.pointerEvents = 'none';

    // Create dots at card positions (card-shaped with white glow)
    dotsLayer.innerHTML = '';
    const dotSize = 12;
    const dots = stars.map((star, i) => {
      const rect = cardRects[i];
      const dot = document.createElement('div');
      dot.className = 'dot to-card';
      if (rect) {
        dot.style.left = rect.left + 'px';
        dot.style.top = rect.top + 'px';
        dot.style.width = rect.width + 'px';
        dot.style.height = rect.height + 'px';
      }
      dotsLayer.appendChild(dot);
      return dot;
    });

    // Animate dots from card shapes back to glowing star dots
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dots.forEach((dot, i) => {
          const star = stars[i];
          dot.classList.remove('to-card');
          dot.style.left = (star.x - dotSize / 2) + 'px';
          dot.style.top = (star.y - dotSize / 2) + 'px';
          dot.style.width = dotSize + 'px';
          dot.style.height = dotSize + 'px';
        });

        // After flight animation, remove dots and resume canvas stars
        setTimeout(() => {
          dotsLayer.innerHTML = '';
          drawStars = true;
          cardsLayer.classList.remove('visible');
          pageLabel.classList.remove('hidden');
        }, 1300);
      });
    });
  }

  // Wire up toggle buttons
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view === currentView) return;

      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (view === 'cards') transitionToCards();
      else transitionToStars();
    });
  });

  // ═══════════════════════
  // DRAWING
  // ═══════════════════════

  function drawAccretionDisk(scaleY, startAngle, endAngle, t, alphaMultiplier) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, scaleY);

    const layers = [
      { rMin: DISK_INNER, rMax: DISK_INNER + 30, color: [255, 240, 200], baseAlpha: 0.18, width: 28 },
      { rMin: DISK_INNER + 10, rMax: DISK_INNER + 55, color: [255, 200, 100], baseAlpha: 0.12, width: 40 },
      { rMin: DISK_INNER + 30, rMax: DISK_INNER + 85, color: [255, 160, 50], baseAlpha: 0.08, width: 50 },
      { rMin: DISK_INNER + 60, rMax: DISK_OUTER, color: [200, 100, 30], baseAlpha: 0.04, width: 35 },
    ];

    layers.forEach((layer, li) => {
      const r = (layer.rMin + layer.rMax) / 2;
      const segments = 60;
      const step = (endAngle - startAngle) / segments;
      for (let s = 0; s < segments; s++) {
        const a1 = startAngle + s * step;
        const a2 = a1 + step;
        const brightness = 0.6 + 0.4 * Math.sin(a1 * 2 + t * (0.4 + li * 0.1));
        const flicker = 0.9 + 0.1 * Math.sin(a1 * 7 + t * 3 + li);
        const alpha = layer.baseAlpha * brightness * flicker * alphaMultiplier;
        ctx.beginPath();
        ctx.arc(0, 0, r, a1, a2);
        ctx.strokeStyle = `rgba(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]}, ${alpha})`;
        ctx.lineWidth = layer.width;
        ctx.stroke();
      }
    });

    const innerSegments = 80;
    const innerStep = (endAngle - startAngle) / innerSegments;
    for (let s = 0; s < innerSegments; s++) {
      const a1 = startAngle + s * innerStep;
      const a2 = a1 + innerStep;
      const brightness = 0.5 + 0.5 * Math.sin(a1 * 3 + t * 0.8);
      const alpha = 0.3 * brightness * alphaMultiplier;
      ctx.beginPath();
      ctx.arc(0, 0, DISK_INNER + 2, a1, a2);
      ctx.strokeStyle = `rgba(255, 250, 230, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawBlackHole() {
    const t = (Date.now() - t0) * 0.001;

    const ambGrad = ctx.createRadialGradient(cx, cy, BH_RADIUS, cx, cy, DISK_OUTER * 1.6);
    ambGrad.addColorStop(0, 'rgba(255, 179, 45, 0)');
    ambGrad.addColorStop(0.2, 'rgba(255, 160, 40, 0.03)');
    ambGrad.addColorStop(0.5, 'rgba(255, 120, 20, 0.02)');
    ambGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ambGrad;
    ctx.fillRect(cx - DISK_OUTER * 2, cy - DISK_OUTER * 2, DISK_OUTER * 4, DISK_OUTER * 4);

    drawAccretionDisk(0.28, Math.PI, Math.PI * 2, t, 0.6);

    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 6; i++) {
      const r = BH_RADIUS + 6 + i * 4;
      const alpha = (0.12 - i * 0.018) * (0.85 + 0.15 * Math.sin(t * 1.5 + i));
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = i < 3
        ? `rgba(255, 230, 180, ${alpha})`
        : `rgba(255, 180, 80, ${alpha * 0.7})`;
      ctx.lineWidth = 3 - i * 0.3;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, BH_RADIUS + 3, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 240, 210, ${0.35 + 0.1 * Math.sin(t * 2)})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, BH_RADIUS + 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 240, ${0.2 + 0.08 * Math.sin(t * 3)})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    const bhGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, BH_RADIUS + 2);
    bhGrad.addColorStop(0, '#000000');
    bhGrad.addColorStop(0.88, '#000000');
    bhGrad.addColorStop(0.96, 'rgba(0, 0, 0, 0.97)');
    bhGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, BH_RADIUS + 2, 0, Math.PI * 2);
    ctx.fillStyle = bhGrad;
    ctx.fill();

    drawAccretionDisk(0.28, 0, Math.PI, t, 1.0);

    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 4; i++) {
      const r = BH_RADIUS + 2 + i * 2.5;
      const alpha = (0.3 - i * 0.06) * (0.8 + 0.2 * Math.sin(t * 1.8 + i * 0.5));
      ctx.beginPath();
      ctx.arc(0, 0, r, -Math.PI * 0.85, -Math.PI * 0.15);
      const topGrad = ctx.createLinearGradient(-r, 0, r, 0);
      topGrad.addColorStop(0, `rgba(255, 200, 100, 0)`);
      topGrad.addColorStop(0.2, `rgba(255, 220, 160, ${alpha})`);
      topGrad.addColorStop(0.5, `rgba(255, 245, 220, ${alpha * 1.2})`);
      topGrad.addColorStop(0.8, `rgba(255, 220, 160, ${alpha})`);
      topGrad.addColorStop(1, `rgba(255, 200, 100, 0)`);
      ctx.strokeStyle = topGrad;
      ctx.lineWidth = 2.5 - i * 0.4;
      ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const r = BH_RADIUS + 2 + i * 2.5;
      const alpha = (0.12 - i * 0.03) * (0.8 + 0.2 * Math.sin(t * 1.8 + i * 0.5));
      ctx.beginPath();
      ctx.arc(0, 0, r, Math.PI * 0.15, Math.PI * 0.85);
      const botGrad = ctx.createLinearGradient(-r, 0, r, 0);
      botGrad.addColorStop(0, `rgba(255, 160, 60, 0)`);
      botGrad.addColorStop(0.3, `rgba(255, 180, 100, ${alpha})`);
      botGrad.addColorStop(0.5, `rgba(255, 200, 140, ${alpha})`);
      botGrad.addColorStop(0.7, `rgba(255, 180, 100, ${alpha})`);
      botGrad.addColorStop(1, `rgba(255, 160, 60, 0)`);
      ctx.strokeStyle = botGrad;
      ctx.lineWidth = 2 - i * 0.4;
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background stars (always drawn)
    bgStars.forEach(s => {
      s.twinkle += 0.01;
      const a = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 210, 230, ${a})`;
      ctx.fill();
    });

    drawBlackHole();

    // Topic stars — only when in stars view
    if (drawStars) {
      stars.forEach(star => {
        if (!hoveredStar) {
          star.angle += star.speed;
        }
        star.twinkle += star.twinkleSpeed;

        star.x = cx + Math.cos(star.angle) * star.orbitRadius;
        star.y = cy + Math.sin(star.angle) * star.orbitRadius * star.eccentricity;

        const twinkleAlpha = 0.6 + 0.4 * Math.sin(star.twinkle);
        const isHovered = hoveredStar === star;
        const size = isHovered ? star.size * 2 : star.size;

        const glowGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 6);
        glowGrad.addColorStop(0, isHovered
          ? 'rgba(187, 146, 243, 0.4)'
          : `rgba(187, 146, 243, ${0.12 * twinkleAlpha})`);
        glowGrad.addColorStop(1, 'rgba(187, 146, 243, 0)');
        ctx.beginPath();
        ctx.arc(star.x, star.y, size * 6, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#bb92f3' : `rgba(220, 210, 255, ${twinkleAlpha})`;
        ctx.fill();

        if (isHovered) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, size + 2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(187, 146, 243, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    } else {
      // Still update positions even when not drawing (for transition back)
      stars.forEach(star => {
        star.angle += star.speed;
        star.x = cx + Math.cos(star.angle) * star.orbitRadius;
        star.y = cy + Math.sin(star.angle) * star.orbitRadius * star.eccentricity;
      });
    }

    requestAnimationFrame(draw);
  }

  draw();
})();
