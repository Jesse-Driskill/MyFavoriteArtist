const THREE_CDN_URL = "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";
const HTML2CANVAS_CDN_URL = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";

let threeModulePromise;
let html2CanvasPromise;

function loadThree() {
  threeModulePromise ||= import(THREE_CDN_URL);
  return threeModulePromise;
}

function loadHtml2Canvas() {
  if (window.html2canvas) {
    return Promise.resolve(window.html2canvas);
  }

  html2CanvasPromise ||= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = HTML2CANVAS_CDN_URL;
    script.async = true;
    script.onload = () => resolve(window.html2canvas);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return html2CanvasPromise;
}

function initHeading() {
  const heading = document.querySelector("h1");

  if (!heading) {
    return;
  }

  const text = heading.textContent.trim().replace(/\s+/g, " ");
  let letterIndex = 0;
  heading.setAttribute("aria-label", text);
  heading.textContent = "";

  text.split(" ").forEach((word) => {
    const line = document.createElement("span");
    line.className = "name-line";
    line.setAttribute("aria-hidden", "true");

    [...word].forEach((character) => {
      const letter = document.createElement("span");
      letter.className = "letter";
      letter.style.setProperty("--delay", `${letterIndex * 80}ms`);
      letter.textContent = character;
      line.appendChild(letter);
      letterIndex += 1;
    });

    heading.appendChild(line);
  });
}

function initCustomCursor() {
  const cursor = document.querySelector(".custom-cursor");

  if (!cursor || !window.matchMedia("(pointer: fine)").matches) {
    return;
  }

  const hoverSelector = "a, button, [data-cursor-hover]";

  window.addEventListener("pointermove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.classList.add("is-visible");
    cursor.classList.toggle("is-hovering", Boolean(event.target.closest(hoverSelector)));
  });

  window.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-visible");
    cursor.classList.remove("is-hovering");
  });
}

function initMobileNav() {
  const nav = document.querySelector(".side-nav");
  const toggle = document.querySelector(".nav-menu-toggle");
  const menuLinks = [...document.querySelectorAll(".nav-menu a")];
  const homeTriggers = [...document.querySelectorAll("[data-home-trigger]")];

  if (!nav || !toggle) {
    return;
  }

  function setMenuOpen(isOpen) {
    nav.classList.toggle("is-menu-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => {
    setMenuOpen(!nav.classList.contains("is-menu-open"));
  });

  [...menuLinks, ...homeTriggers].forEach((item) => {
    item.addEventListener("click", () => {
      setMenuOpen(false);
    });
  });
}

function initTypewriter() {
  const paragraph = document.querySelector(".typewriter");

  if (!paragraph) {
    return;
  }

  const text = paragraph.textContent.trim().replace(/\s+/g, " ");
  paragraph.setAttribute("aria-label", text);
  paragraph.textContent = "";
  const characters = [];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  text.split(" ").forEach((word, wordIndex, words) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "typed-word";
    wordSpan.setAttribute("aria-hidden", "true");

    [...word].forEach((character) => {
      const span = document.createElement("span");
      span.className = "typed-char";
      span.textContent = character;
      wordSpan.appendChild(span);
      characters.push(span);
    });

    paragraph.appendChild(wordSpan);

    if (wordIndex < words.length - 1) {
      const space = document.createElement("span");
      space.className = "typed-char typed-space";
      space.setAttribute("aria-hidden", "true");
      space.textContent = " ";
      paragraph.appendChild(space);
      characters.push(space);
    }
  });

  const cursor = document.createElement("span");
  cursor.className = "type-cursor";
  cursor.setAttribute("aria-hidden", "true");

  if (prefersReducedMotion) {
    characters.forEach((character) => character.classList.add("is-visible"));
    return;
  }

  function placeCursorBefore(node) {
    node.parentNode.insertBefore(cursor, node);
  }

  placeCursorBefore(characters[0]);

  const wait = (duration) => new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

  async function typeLoop() {
    await wait(1200);

    while (true) {
      for (const character of characters) {
        character.classList.add("is-visible");
        character.after(cursor);
        await wait(38);
      }

      await wait(8500);

      for (let index = characters.length - 1; index >= 0; index -= 1) {
        const character = characters[index];
        placeCursorBefore(character);
        character.classList.remove("is-visible");
        await wait(24);
      }

      await wait(500);
    }
  }

  typeLoop();
}

function initGallery() {
  const trigger = document.querySelector("[data-gallery-trigger]");
  const musicTrigger = document.querySelector("[data-music-trigger]");
  const biographyTrigger = document.querySelector("[data-biography-trigger]");
  const homeTriggers = [...document.querySelectorAll("[data-home-trigger]")];
  const gallery = document.querySelector(".gallery-view");
  const music = document.querySelector(".music-view");
  const biography = document.querySelector(".biography-view");
  const image = document.querySelector(".gallery-image");
  const caption = document.querySelector(".gallery-caption");
  const mobileName = document.querySelector(".gallery-mobile-name");
  const mobileArrows = [...document.querySelectorAll("[data-gallery-mobile-direction]")];
  const links = [...document.querySelectorAll("[data-gallery-image]")];

  if (!trigger || !gallery || !image || !caption || links.length === 0) {
    return;
  }

  let activeSrc = image.getAttribute("src");
  let swapTimeout;
  let captionRun = 0;
  let hasOpenedGallery = false;

  function clearCaption() {
    captionRun += 1;
    caption.textContent = "";
  }

  function openGallery() {
    document.body.classList.add("is-gallery-open");
    document.body.classList.remove("is-music-open");
    document.body.classList.remove("is-biography-open");
    gallery.setAttribute("aria-hidden", "false");
    music?.setAttribute("aria-hidden", "true");
    biography?.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-current", "page");
    musicTrigger?.removeAttribute("aria-current");
    biographyTrigger?.removeAttribute("aria-current");

    if (!hasOpenedGallery) {
      hasOpenedGallery = true;
      typeCaption(document.querySelector("[data-gallery-image].is-active")?.dataset.galleryInfo || "");
    }
  }

  function closeGallery() {
    document.body.classList.remove("is-gallery-open");
    document.body.classList.remove("is-music-open");
    document.body.classList.remove("is-biography-open");
    gallery.setAttribute("aria-hidden", "true");
    music?.setAttribute("aria-hidden", "true");
    biography?.setAttribute("aria-hidden", "true");
    trigger.removeAttribute("aria-current");
    musicTrigger?.removeAttribute("aria-current");
    biographyTrigger?.removeAttribute("aria-current");
  }

  function setActiveLink(selectedLink) {
    links.forEach((link) => {
      link.classList.toggle("is-active", link === selectedLink);
      link.removeAttribute("aria-current");
    });

    selectedLink.setAttribute("aria-current", "true");
    if (mobileName) {
      mobileName.textContent = selectedLink.textContent.trim();
    }
  }

  function typeCaption(text) {
    captionRun += 1;
    const run = captionRun;
    const words = text.trim().replace(/\s+/g, " ").split(" ");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    caption.textContent = "";
    caption.setAttribute("aria-label", words.join(" "));

    if (prefersReducedMotion) {
      caption.textContent = words.join(" ");
      return;
    }

    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "gallery-caption-word";
      wordSpan.setAttribute("aria-hidden", "true");
      wordSpan.style.setProperty("--word-delay", `${150 + wordIndex * 42}ms`);
      wordSpan.textContent = word;
      caption.appendChild(wordSpan);

      if (wordIndex < words.length - 1) {
        const space = document.createElement("span");
        space.className = "gallery-caption-space";
        space.setAttribute("aria-hidden", "true");
        space.textContent = " ";
        caption.appendChild(space);
      }

      window.setTimeout(() => {
        if (run !== captionRun) {
          return;
        }

        wordSpan.classList.add("is-visible");
      }, 150 + wordIndex * 42);
    });
  }

  function swapImage(selectedLink) {
    const nextSrc = selectedLink.dataset.galleryImage;
    const nextInfo = selectedLink.dataset.galleryInfo || "";
    clearCaption();

    if (!nextSrc || nextSrc === activeSrc) {
      setActiveLink(selectedLink);
      typeCaption(nextInfo);
      return;
    }

    window.clearTimeout(swapTimeout);
    image.classList.remove("is-visible");

    const nextImage = new Image();
    nextImage.onload = () => {
      swapTimeout = window.setTimeout(() => {
        image.src = nextSrc;
        activeSrc = nextSrc;
        image.classList.add("is-visible");
      }, 180);
    };
    nextImage.src = nextSrc;
    setActiveLink(selectedLink);
    typeCaption(nextInfo);
  }

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openGallery();
  });

  homeTriggers.forEach((homeTrigger) => {
    homeTrigger.addEventListener("click", closeGallery);
  });

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openGallery();
      swapImage(link);
    });
  });

  mobileArrows.forEach((arrow) => {
    arrow.addEventListener("click", () => {
      const activeIndex = links.findIndex((link) => link.classList.contains("is-active"));
      const direction = Number(arrow.dataset.galleryMobileDirection) || 1;
      const nextIndex = (activeIndex + direction + links.length) % links.length;
      openGallery();
      swapImage(links[nextIndex]);
    });
  });

  setActiveLink(links[0]);
}

async function initMusicSection() {
  const THREE = await loadThree();
  const trigger = document.querySelector("[data-music-trigger]");
  const galleryTrigger = document.querySelector("[data-gallery-trigger]");
  const biographyTrigger = document.querySelector("[data-biography-trigger]");
  const homeTriggers = [...document.querySelectorAll("[data-home-trigger]")];
  const music = document.querySelector(".music-view");
  const gallery = document.querySelector(".gallery-view");
  const biography = document.querySelector(".biography-view");
  const visualizer = document.querySelector(".music-visualizer");
  const musicTrack = document.querySelector(".music-track");
  const trackSwapTargets = [...document.querySelectorAll(".track-swap-target")];
  const trackContent = document.querySelector(".music-track-content");
  const trackTitle = document.querySelector(".music-track h2");
  const trackImage = document.querySelector(".music-track-content img");
  const trackArrows = [...document.querySelectorAll("[data-track-direction]")];
  const audio = document.querySelector(".music-audio");
  const playButtons = [...document.querySelectorAll(".track-play")];
  const progressButtons = [...document.querySelectorAll(".track-progress")];
  const progressFills = [...document.querySelectorAll(".track-progress-fill")];
  const timeLabels = [...document.querySelectorAll(".track-time")];

  if (
    !trigger
    || !music
    || !visualizer
    || !musicTrack
    || trackSwapTargets.length === 0
    || !trackContent
    || !trackTitle
    || !trackImage
    || !audio
    || playButtons.length === 0
    || progressButtons.length === 0
    || progressFills.length === 0
    || timeLabels.length === 0
  ) {
    return;
  }

  const tracks = [
    {
      title: "Faneto",
      image: "assets/chiefkeef.webp",
      audio: "assets/Chief Keef - Faneto [Official Audio].mp3"
    },
    {
      title: "Loonboon",
      image: "assets/pvz.webp",
      audio: "assets/Loonboon.mp3"
    },
    {
      title: "Minuet, String Quintet",
      image: "assets/boccherini.jpg",
      audio: "assets/Luigi Boccherini - Minuet - String Quintet(1).mp3"
    },
    {
      title: "The Entertainer",
      image: "assets/Scott-Joplin-4.jpg",
      audio: "assets/The Entertainer.mp3"
    },
    {
      title: "Techno Beat",
      image: "assets/pilotbuttons.jpg",
      audio: "assets/TechnoBeat.mp3"
    },
    {
      title: "MY JEALOUSY",
      image: "assets/jealousy.jpg",
      audio: "assets/MY JEALOUSY.mp3"
    }
  ];

  let activeTrackIndex = 0;
  let isSwappingTrack = false;

  function openMusic() {
    document.body.classList.add("is-music-open");
    document.body.classList.remove("is-gallery-open");
    document.body.classList.remove("is-biography-open");
    music.setAttribute("aria-hidden", "false");
    gallery?.setAttribute("aria-hidden", "true");
    biography?.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-current", "page");
    galleryTrigger?.removeAttribute("aria-current");
    biographyTrigger?.removeAttribute("aria-current");
  }

  function closeMusic() {
    document.body.classList.remove("is-music-open");
    music.setAttribute("aria-hidden", "true");
    trigger.removeAttribute("aria-current");
  }

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openMusic();
  });

  homeTriggers.forEach((homeTrigger) => {
    homeTrigger.addEventListener("click", closeMusic);
  });

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  visualizer.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 2;

  const lineCount = 96;
  const positions = new Float32Array(lineCount * 2 * 3);
  const colors = new Float32Array(lineCount * 2 * 3);
  const previousHeights = new Float32Array(lineCount);
  const pinkUntilHeights = new Float32Array(lineCount);
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.9
  });
  const lines = new THREE.LineSegments(geometry, material);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  scene.add(lines);

  let audioContext;
  let analyser;
  let frequencyData;
  let source;
  const startedAt = performance.now();

  function connectAudio() {
    audioContext ||= new AudioContext();
    analyser ||= audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    frequencyData ||= new Uint8Array(analyser.frequencyBinCount);

    if (!source) {
      source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }

    audioContext.resume();
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  }

  function updatePlayerControls() {
    const title = tracks[activeTrackIndex].title;
    const duration = audio.duration || 0;
    const progress = duration ? (audio.currentTime / duration) * 100 : 0;
    progressFills.forEach((progressFill) => {
      progressFill.style.width = `${progress}%`;
    });
    progressButtons.forEach((progressButton) => {
      progressButton.setAttribute("aria-valuenow", String(Math.round(progress)));
      progressButton.setAttribute("aria-label", `Seek ${title}`);
    });
    timeLabels.forEach((timeLabel) => {
      timeLabel.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
    });
    playButtons.forEach((playButton) => {
      playButton.textContent = audio.paused ? "PLAY" : "PAUSE";
      playButton.setAttribute(
        "aria-label",
        audio.paused ? `Play ${title}` : `Pause ${title}`
      );
    });
  }

  async function toggleTrack() {
    if (audio.paused) {
      connectAudio();
      await audio.play();
      return;
    }

    audio.pause();
  }

  function renderTrack(track) {
    trackTitle.textContent = track.title;
    trackImage.src = track.image;
    trackImage.alt = `${track.title} cover`;
    audio.src = track.audio;
    audio.load();
    updatePlayerControls();
  }

  function swapTrack(direction) {
    if (isSwappingTrack) {
      return;
    }

    isSwappingTrack = true;
    audio.pause();
    activeTrackIndex = (activeTrackIndex + direction + tracks.length) % tracks.length;
    trackSwapTargets.forEach((target) => {
      target.classList.remove("is-entering-left", "is-entering-right", "is-leaving-left", "is-leaving-right");
      target.classList.add(direction > 0 ? "is-leaving-left" : "is-leaving-right");
    });

    window.setTimeout(() => {
      renderTrack(tracks[activeTrackIndex]);
      syncVisualizerHeight();
      trackSwapTargets.forEach((target) => {
        target.classList.remove("is-leaving-left", "is-leaving-right");
        target.classList.add(direction > 0 ? "is-entering-right" : "is-entering-left");
      });

      window.setTimeout(() => {
        trackSwapTargets.forEach((target) => {
          target.classList.remove("is-entering-left", "is-entering-right");
        });
        isSwappingTrack = false;
      }, 360);
    }, 240);
  }

  function updateBars(time) {
    if (analyser && frequencyData) {
      analyser.getByteFrequencyData(frequencyData);
    }

    for (let index = 0; index < lineCount; index += 1) {
      const positionIndex = index * 6;
      const centerDistance = Math.abs(index - (lineCount - 1) / 2) / ((lineCount - 1) / 2);
      const bin = Math.floor(centerDistance * 112);
      const idle = 0.06 + Math.sin(time * 0.0012 + index * 0.18) * 0.028;
      const level = frequencyData ? frequencyData[bin] / 255 : idle;
      const x = THREE.MathUtils.mapLinear(index, 0, lineCount - 1, -0.96, 0.96);
      const halfHeight = THREE.MathUtils.clamp(0.035 + level * 0.72, 0.035, 0.82);
      const heightJump = halfHeight - previousHeights[index];
      const isCenterBassBar = centerDistance < 0.18 && halfHeight > 0.56;

      if (isCenterBassBar) {
        pinkUntilHeights[index] = 0;
      } else if (heightJump > 0.14) {
        pinkUntilHeights[index] = halfHeight * 0.86;
      } else if (halfHeight < pinkUntilHeights[index]) {
        pinkUntilHeights[index] = 0;
      }

      const isPink = pinkUntilHeights[index] > 0;
      const red = isPink ? 1 : 0;
      const green = 0;
      const blue = isPink ? 1 : 0;
      const colorIndex = index * 6;

      positions[positionIndex] = x;
      positions[positionIndex + 1] = -halfHeight;
      positions[positionIndex + 2] = 0;
      positions[positionIndex + 3] = x;
      positions[positionIndex + 4] = halfHeight;
      positions[positionIndex + 5] = 0;
      colors[colorIndex] = red;
      colors[colorIndex + 1] = green;
      colors[colorIndex + 2] = blue;
      colors[colorIndex + 3] = red;
      colors[colorIndex + 4] = green;
      colors[colorIndex + 5] = blue;
      previousHeights[index] = halfHeight;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  }

  function resize() {
    const { width, height } = visualizer.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.updateProjectionMatrix();
  }

  function syncVisualizerHeight() {
    const { height } = trackImage.getBoundingClientRect();
    visualizer.style.height = `${height * 0.75}px`;
    resize();
  }

  function animate(time) {
    updateBars(time - startedAt);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  audio.addEventListener("play", connectAudio);
  audio.addEventListener("play", updatePlayerControls);
  audio.addEventListener("pause", updatePlayerControls);
  audio.addEventListener("loadedmetadata", updatePlayerControls);
  audio.addEventListener("timeupdate", updatePlayerControls);
  audio.addEventListener("ended", updatePlayerControls);
  playButtons.forEach((playButton) => {
    playButton.addEventListener("click", () => {
      toggleTrack().catch(() => {});
    });
  });
  progressButtons.forEach((progressButton) => {
    progressButton.addEventListener("click", (event) => {
      const duration = audio.duration || 0;

      if (!duration) {
        return;
      }

      const rect = progressButton.getBoundingClientRect();
      const ratio = THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width, 0, 1);
      audio.currentTime = ratio * duration;
      updatePlayerControls();
    });
  });
  trackArrows.forEach((arrow) => {
    arrow.addEventListener("click", () => {
      swapTrack(Number(arrow.dataset.trackDirection) || 1);
    });
  });

  const observer = new ResizeObserver(resize);
  observer.observe(visualizer);
  const trackObserver = new ResizeObserver(syncVisualizerHeight);
  trackObserver.observe(musicTrack);
  window.addEventListener("resize", syncVisualizerHeight);
  renderTrack(tracks[activeTrackIndex]);
  syncVisualizerHeight();
  resize();
  updatePlayerControls();
  animate(startedAt);
}

function initBiographySection() {
  const trigger = document.querySelector("[data-biography-trigger]");
  const musicTrigger = document.querySelector("[data-music-trigger]");
  const galleryTrigger = document.querySelector("[data-gallery-trigger]");
  const homeTriggers = [...document.querySelectorAll("[data-home-trigger]")];
  const biography = document.querySelector(".biography-view");
  const music = document.querySelector(".music-view");
  const gallery = document.querySelector(".gallery-view");
  const sections = [...document.querySelectorAll(".biography-section")];
  const bioImages = [...document.querySelectorAll(".biography-image")];

  if (!trigger || !biography) {
    return;
  }

  sections.forEach((section, sectionIndex) => {
    const button = section.querySelector(".biography-play");
    const text = section.querySelector(".biography-text");
    const pairedImage = bioImages[sectionIndex];

    if (!button || !text) {
      return;
    }

    const originalText = text.textContent.trim().replace(/\s+/g, " ");
    const title = section.querySelector("h2 span")?.textContent || "Biography";
    let run = 0;

    text.textContent = "";
    text.setAttribute("aria-label", originalText);

    function stopText() {
      run += 1;
      section.classList.remove("is-playing");
      section.classList.add("is-hiding");
      pairedImage?.classList.remove("is-visible");
      button.setAttribute("aria-label", `Play ${title} text`);
      window.setTimeout(() => {
        if (!section.classList.contains("is-hiding")) {
          return;
        }

        text.textContent = "";
        section.classList.remove("is-hiding");
      }, 260);
    }

    function playText() {
      run += 1;
      const currentRun = run;
      const words = originalText.split(" ");
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      text.textContent = "";
      section.classList.remove("is-hiding");
      section.classList.add("is-playing");
      pairedImage?.classList.add("is-visible");
      button.setAttribute("aria-label", `Stop ${title} text`);

      if (prefersReducedMotion) {
        text.textContent = originalText;
        return;
      }

      const cursor = document.createElement("span");
      cursor.className = "type-cursor";
      cursor.setAttribute("aria-hidden", "true");
      text.appendChild(cursor);

      let characterIndex = 0;

      words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement("span");
        wordSpan.className = "typed-word";
        wordSpan.setAttribute("aria-hidden", "true");
        text.insertBefore(wordSpan, cursor);

        [...word].forEach((character) => {
          window.setTimeout(() => {
            if (currentRun !== run) {
              return;
            }

            const span = document.createElement("span");
            span.className = "typed-char is-visible";
            span.textContent = character;
            wordSpan.appendChild(span);
          }, characterIndex * 22);
          characterIndex += 1;
        });

        if (wordIndex < words.length - 1) {
          const space = document.createElement("span");
          space.className = "typed-char typed-space";
          space.setAttribute("aria-hidden", "true");
          space.textContent = " ";
          text.insertBefore(space, cursor);

          window.setTimeout(() => {
            if (currentRun !== run) {
              return;
            }

            space.classList.add("is-visible");
          }, characterIndex * 22);
          characterIndex += 1;
        }
      });
    }

    button.addEventListener("click", () => {
      if (section.classList.contains("is-playing")) {
        stopText();
        return;
      }

      playText();
    });
  });

  function openBiography() {
    document.body.classList.add("is-biography-open");
    document.body.classList.remove("is-music-open");
    document.body.classList.remove("is-gallery-open");
    biography.setAttribute("aria-hidden", "false");
    music?.setAttribute("aria-hidden", "true");
    gallery?.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-current", "page");
    musicTrigger?.removeAttribute("aria-current");
    galleryTrigger?.removeAttribute("aria-current");
  }

  function closeBiography() {
    document.body.classList.remove("is-biography-open");
    biography.setAttribute("aria-hidden", "true");
    trigger.removeAttribute("aria-current");
  }

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openBiography();
  });

  homeTriggers.forEach((homeTrigger) => {
    homeTrigger.addEventListener("click", closeBiography);
  });
}

async function initPixelDistortion() {
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!hasFinePointer || prefersReducedMotion) {
    return;
  }

  const [THREE, html2canvas] = await Promise.all([
    loadThree(),
    loadHtml2Canvas()
  ]);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    premultipliedAlpha: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = "pixel-distortion";
  renderer.domElement.setAttribute("aria-hidden", "true");
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const fallbackCanvas = document.createElement("canvas");
  fallbackCanvas.width = 1;
  fallbackCanvas.height = 1;
  const fallbackTexture = new THREE.CanvasTexture(fallbackCanvas);
  fallbackTexture.colorSpace = THREE.SRGBColorSpace;

  const uniforms = {
    uTexture: { value: fallbackTexture },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uPointer: { value: new THREE.Vector2(-9999, -9999) },
    uVelocity: { value: new THREE.Vector2(0, 0) },
    uStrength: { value: 0 },
    uRadius: { value: 118 }
  };

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms,
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform vec2 uResolution;
      uniform vec2 uPointer;
      uniform vec2 uVelocity;
      uniform float uStrength;
      uniform float uRadius;

      varying vec2 vUv;

      void main() {
        vec2 pixel = vec2(vUv.x * uResolution.x, (1.0 - vUv.y) * uResolution.y);
        vec2 toPointer = pixel - uPointer;
        float distanceFromPointer = length(toPointer);
        float influence = 1.0 - smoothstep(0.0, uRadius, distanceFromPointer);
        influence = pow(influence, 1.85) * uStrength;

        if (influence <= 0.002) {
          discard;
        }

        vec2 drag = (uVelocity / uResolution) * influence * 0.82;
        vec2 pull = normalize(toPointer + 0.0001) * influence * 0.014;
        vec2 uv = vUv - vec2(drag.x, -drag.y) - vec2(pull.x, -pull.y);
        vec2 fringe = normalize(uVelocity + 0.0001) / uResolution * influence * 3.2;

        float red = texture2D(uTexture, uv - fringe).r;
        float green = texture2D(uTexture, uv).g;
        float blue = texture2D(uTexture, uv + fringe).b;
        float ring = smoothstep(uRadius * 0.64, 0.0, distanceFromPointer) * 0.1;

        gl_FragColor = vec4(vec3(red, green, blue) + ring, influence * 0.98);
      }
    `
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  let width = 0;
  let height = 0;
  let active = false;
  let isCapturing = false;
  let captureQueued = false;
  let lastCaptureAt = 0;
  let isPointerInside = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let targetVelocityX = 0;
  let targetVelocityY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let strength = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height, false);
    uniforms.uResolution.value.set(width, height);
    queueCapture();
  }

  async function capturePage() {
    if (isCapturing) {
      captureQueued = true;
      return;
    }

    isCapturing = true;
    renderer.domElement.classList.add("is-capturing");

    try {
      const pageCanvas = await html2canvas(document.body, {
        backgroundColor: null,
        logging: false,
        scale: Math.min(window.devicePixelRatio, 1.5),
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        ignoreElements: (element) => (
          element === renderer.domElement
          || element.classList?.contains("custom-cursor")
        )
      });

      const texture = new THREE.CanvasTexture(pageCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      uniforms.uTexture.value.dispose();
      uniforms.uTexture.value = texture;
      lastCaptureAt = performance.now();
    } finally {
      renderer.domElement.classList.remove("is-capturing");
      isCapturing = false;

      if (captureQueued) {
        captureQueued = false;
        capturePage();
      }
    }
  }

  function queueCapture() {
    window.clearTimeout(queueCapture.timeout);
    queueCapture.timeout = window.setTimeout(capturePage, 80);
  }

  function animate(time = performance.now()) {
    const idleVelocityX = isPointerInside ? Math.sin(time * 0.0031) * 8 : 0;
    const idleVelocityY = isPointerInside ? Math.cos(time * 0.0027) * 8 : 0;
    const targetStrength = isPointerInside ? 0.34 : 0;

    velocityX += (targetVelocityX + idleVelocityX - velocityX) * 0.22;
    velocityY += (targetVelocityY + idleVelocityY - velocityY) * 0.22;
    targetVelocityX *= 0.72;
    targetVelocityY *= 0.72;
    strength += (targetStrength - strength) * 0.08;
    uniforms.uVelocity.value.set(velocityX, velocityY);
    uniforms.uStrength.value = strength;

    renderer.render(scene, camera);

    if (isPointerInside || strength > 0.0015 || Math.abs(velocityX) > 0.015 || Math.abs(velocityY) > 0.015) {
      requestAnimationFrame(animate);
      return;
    }

    active = false;
    renderer.clear();
  }

  window.addEventListener("pointermove", (event) => {
    const deltaX = event.clientX - lastPointerX;
    const deltaY = event.clientY - lastPointerY;

    isPointerInside = true;
    uniforms.uPointer.value.set(event.clientX, event.clientY);
    targetVelocityX = THREE.MathUtils.clamp(deltaX, -80, 80);
    targetVelocityY = THREE.MathUtils.clamp(deltaY, -80, 80);
    strength = Math.min(1, strength + 0.08 + Math.hypot(deltaX, deltaY) * 0.04);
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

    if (performance.now() - lastCaptureAt > 2400) {
      queueCapture();
    }

    if (!active) {
      active = true;
      requestAnimationFrame(animate);
    }
  });

  window.addEventListener("pointerleave", () => {
    isPointerInside = false;
  });

  window.addEventListener("resize", resize);
  resize();
}

initHeading();
initCustomCursor();
initMobileNav();
initTypewriter();
initGallery();
initMusicSection();
initBiographySection();
// initPixelDistortion().catch(() => {});
