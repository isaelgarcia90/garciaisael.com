const commandResponses = {
    "system boot": "🖥️ Booting AI/ML/Web career career... welcome aboard!",
    "ping recruiter.com": "📡 Pinging recruiters... response received ✅",
    "find / -name job": "🔍 Searching jobs... AI/ML/Web opportunities found!",
    "sudo apt install -y motivation": "✨ Installing motivation... complete!",
    "top": "🧠 Monitoring caffeine levels ☕ ... productivity at 99% ",
    "make install": "✅ Installing new experiences... done.",
    "exit": "👋 Exiting terminal... see you soon!"
  };

  const failMessages = [
    "Nope — the raccoon stole that command 🦝",
    "Close... but the CI just judged you 😅",
    "Access denied. The server is on coffee break ☕",
    "Whoops — looks like a syntax gremlin got you 🐛",
    "Nice try — try not to break the kernel this time 😬",
    "Command not found. Have you tried turning it off and on again?",
    "Error 418: I'm a teapot — not accepting that command ☕️🤖",
    "That one lives in another dimension. Try a different command.",
    "That didn't compile in my brain. Try again.",
    "Nope — the AI intern deleted that file. Retry?"
  ];

  const commands = Object.keys(commandResponses);
  let currentIndex = 0;

  const cmdEl = document.getElementById("command");
  const inputEl = document.getElementById("input");
  const resultEl = document.getElementById("result");

  // preload simple sound effects
  const successSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
  const failSound = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");

  function newCommand() {
    if (currentIndex >= commands.length) {
      cmdEl.textContent = "> All commands executed 🎉";
      inputEl.disabled = true;
      inputEl.placeholder = "Session complete";
      resultEl.textContent = "✨ You’ve reached the end of the terminal journey!";
      return;
    }
    const nextCmd = commands[currentIndex];
    cmdEl.textContent = "> " + nextCmd;
    inputEl.value = "";
    resultEl.textContent = "";
  }

  function showFunnyFail() {
    const idx = Math.floor(Math.random() * failMessages.length);
    resultEl.textContent = failMessages[idx];
    resultEl.className = "fail";
    inputEl.classList.add("shake");
    failSound.currentTime = 0;
    failSound.play();
    setTimeout(() => inputEl.classList.remove("shake"), 400);
  }

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = inputEl.value.trim();
      const expected = commands[currentIndex];

      if (val === expected) {
        resultEl.textContent = commandResponses[val];
        resultEl.className = "success";
        successSound.currentTime = 0;
        successSound.play();
        currentIndex++;
        setTimeout(newCommand, 3000);
      } else {
        showFunnyFail();
      }
    }
  });

  newCommand();



const hoverVideo = document.getElementById("hoverVideo");

let audioUnlocked = false;

// 🔥 Track: First click/tap enabling sound
document.addEventListener("click", () => {
  if (!audioUnlocked) {
    hoverVideo.muted = false;
    hoverVideo.play().then(() => {
      hoverVideo.pause();
      hoverVideo.currentTime = 0;
      audioUnlocked = true;
      console.log("Audio unlocked ✅");

      gtag('event', 'audio_unlocked', {
        event_category: 'video',
        event_label: 'avatar_video'
      });

    }).catch(() => {});
  }
}, { once: true });

// 🔥 Desktop hover play
hoverVideo.addEventListener("mouseenter", () => {
  hoverVideo.play().catch(err => console.warn("Play blocked:", err));

  gtag('event', 'video_hover_play', {
    event_category: 'video',
    event_label: 'avatar_video'
  });
});

// 🔥 Mobile/tablet touch play
hoverVideo.addEventListener("touchstart", () => {
  hoverVideo.play().catch(err => console.warn("Play blocked:", err));

  gtag('event', 'video_touch_play', {
    event_category: 'video',
    event_label: 'avatar_video'
  });
});