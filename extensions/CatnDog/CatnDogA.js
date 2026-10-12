(function (Scratch) {
  "use strict";

  //TODO: Add pet size options, Add pet upload?, Add 'sit' command on right click?
  //TODO: rename to 'pet'
  //TODO: add resolution options

  // ──────────────────────────────────────────────────────────────
  // CONFIG
  // ──────────────────────────────────────────────────────────────
  // Base URL where the "png" folder lives. Must end with a slash.
  // Example final path: BASE_URL + "cat/Run (1).png"
  const BASE_URL_64 = "https://raw.githubusercontent.com/Trbenne/turbowarp-extension-assets/main/CodePet/png_64/";
  const BASE_URL_128 = "https://raw.githubusercontent.com/Trbenne/turbowarp-extension-assets/main/CodePet/png_128/";
  const BASE_URL_256 = "https://raw.githubusercontent.com/Trbenne/turbowarp-extension-assets/main/CodePet/png_256/";
  const BASE_URL_512 = "https://raw.githubusercontent.com/Trbenne/turbowarp-extension-assets/main/CodePet/png/";

  const BASE_URLS = {
    64: BASE_URL_64,
    128: BASE_URL_128,
    256: BASE_URL_256,
    512: BASE_URL_512,
  };

  const DEFAULT_RESOLUTION = 128;

  const BASE_URL = BASE_URLS[DEFAULT_RESOLUTION];

  // Number of frames available per animation (per pet).
  const FRAME_COUNTS = {
    Idle: 10,
    Run: 8,
    Slide: 10,
    Jump: 8,
    Hurt: 10,
    Dead: 10,
  };

  const DISPLAY_WIDTH = 64;
  const DISPLAY_HEIGHT = 64;

  const SPEED = 13;             // px per frame while running
  const ARRIVE_DISTANCE = 72;   // stop & slide when closer than this
  const WAKE_DISTANCE = 96;     // distance needed to wake from dead / resume
  const FRAME_MS = 100;         // animation tick speed
  const TICKS_PER_SEC = 1000 / FRAME_MS;

  const SLIDE_FRICTION = 0.6;   // velocity multiplier each slide frame
  const JUMP_HEIGHT = 40;       // px arc height for a jump

  // Idle timing (seconds)
  const IDLE_HURT_SECONDS = 30; // after this idle time: play Hurt, keep idling
  const IDLE_DEAD_SECONDS = 60; // after this idle time: play Hurt, then Dead

  // ──────────────────────────────────────────────────────────────

  const petIcon = "data:image/png;base64,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";

  function loadFrames(pet) {
    const frames = {};
    for (const anim in FRAME_COUNTS) {
      frames[anim] = [];
      for (let i = 1; i <= FRAME_COUNTS[anim]; i++) {
        const img = new Image();
        img.src = `${BASE_URL}${pet}/${anim} (${i}).png`;
        frames[anim].push(img);
      }
    }
    return frames;
  }

  class CodePet {
    constructor() {
      this.el = null;
      this.imgEl = null;

      this.pet = "cat";
      this.frames = null;

      this.posX = 500;
      this.posY = 300;
      this.mouseX = 0;
      this.mouseY = 0;

      this.facing = 1; // 1 = right (default), -1 = left
      this.jumpOffset = 0;

      // state: "idle" | "run" | "slide" | "jump" | "hurt" | "dead"
      this.state = "idle";
      this.animFrame = 0;

      // movement helpers
      this.lastDirX = 1;
      this.lastDirY = 0;
      this.slideVX = 0;
      this.slideVY = 0;

      // idle/hurt/dead tracking
      this.idleTicks = 0;
      this.hurtTriggered = false; // 10s hurt done
      this.deadTriggered = false; // 60s sequence started
      this.hurtThenDead = false;  // current hurt should lead to dead

      this.lastTimestamp = null;
      this.running = false;

      document.addEventListener("mousemove", (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      });
    }

    getInfo() {
      return {
        id: "codepet",
        name: "Code Pet",
        menuIconURI: petIcon,
        blocks: [
          {
            opcode: "setPet",
            blockType: Scratch.BlockType.COMMAND,
            text: "set pet to [PET]",
            arguments: {
              PET: {
                type: Scratch.ArgumentType.STRING,
                menu: "petMenu",
                defaultValue: "cat",
              },
            },
          },
        ],
        menus: {
          petMenu: {
            acceptReporters: false,
            items: ["cat", "dog"],
          },
        },
      };
    }

    setPet(args) {
      this.pet = args.PET;
      this.frames = loadFrames(this.pet);

      if (!this.el) {
        this.el = document.createElement("div");
        this.el.id = "codepet";
        this.el.style.position = "fixed";
        this.el.style.pointerEvents = "auto"; // needed to detect clicks
        this.el.style.cursor = "pointer";
        this.el.style.width = `${DISPLAY_WIDTH}px`;
        this.el.style.height = `${DISPLAY_HEIGHT}px`;
        this.el.style.zIndex = Number.MAX_VALUE;
        this.el.style.imageRendering = "pixelated";

        this.imgEl = document.createElement("img");
        this.imgEl.style.width = "100%";
        this.imgEl.style.height = "100%";
        this.imgEl.draggable = false;
        this.el.appendChild(this.imgEl);

        // Click to jump
        this.el.addEventListener("mousedown", () => this.triggerJump());

        document.body.appendChild(this.el);
      }

      this.enterIdle(true);

      if (!this.running) {
        this.running = true;
        window.requestAnimationFrame((t) => this.onFrame(t));
      }
    }

    // ── state helpers ──────────────────────────────────────────
    enterIdle(reset) {
      this.state = "idle";
      this.animFrame = 0;
      if (reset) {
        this.idleTicks = 0;
        this.hurtTriggered = false;
        this.deadTriggered = false;
      }
    }

    enterActive() {
      // wake from idle/dead and start chasing
      this.state = "run";
      this.animFrame = 0;
      this.idleTicks = 0;
      this.hurtTriggered = false;
      this.deadTriggered = false;
    }

    triggerJump() {
      if (this.state === "jump") return;
      this.state = "jump";
      this.animFrame = 0;
      // a click counts as activity (also revives from dead)
      this.idleTicks = 0;
      this.hurtTriggered = false;
      this.deadTriggered = false;
    }

    // ── rendering ──────────────────────────────────────────────
    setSprite(anim, frame) {
      const set = this.frames[anim];
      if (!set || set.length === 0) return;
      const img = set[frame % set.length];
      if (this.imgEl.src !== img.src) this.imgEl.src = img.src;
      this.imgEl.style.transform = `scaleX(${this.facing})`;
    }

    clampPos() {
      this.posX = Math.min(
        Math.max(DISPLAY_WIDTH / 2, this.posX),
        window.innerWidth - DISPLAY_WIDTH / 2
      );
      this.posY = Math.min(
        Math.max(DISPLAY_HEIGHT / 2, this.posY),
        window.innerHeight - DISPLAY_HEIGHT / 2
      );
    }

    updateEl() {
      this.el.style.left = `${this.posX - DISPLAY_WIDTH / 2}px`;
      this.el.style.top = `${this.posY - DISPLAY_HEIGHT / 2 + this.jumpOffset}px`;
    }

    // ── main loop ──────────────────────────────────────────────
    onFrame(timestamp) {
      if (!this.el || !this.el.isConnected) {
        this.running = false;
        return;
      }
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      if (timestamp - this.lastTimestamp > FRAME_MS) {
        this.lastTimestamp = timestamp;
        this.tick();
      }
      window.requestAnimationFrame((t) => this.onFrame(t));
    }

    tick() {
      const diffX = this.mouseX - this.posX;
      const diffY = this.mouseY - this.posY;
      const distance = Math.sqrt(diffX * diffX + diffY * diffY) || 0.0001;

      switch (this.state) {
        // ── JUMP (one-shot) ─────────────────────────────────────
        case "jump": {
          const len = this.frames.Jump.length;
          const prog = this.animFrame / len;
          this.jumpOffset = -Math.sin(prog * Math.PI) * JUMP_HEIGHT;
          if (diffX > 0.5) this.facing = 1;
          else if (diffX < -0.5) this.facing = -1;

          this.setSprite("Jump", this.animFrame);
          this.animFrame++;

          if (this.animFrame >= len) {
            this.jumpOffset = 0;
            if (distance >= ARRIVE_DISTANCE) this.enterActive();
            else this.enterIdle(true);
          }
          this.updateEl();
          return;
        }

        // ── HURT (one-shot) ─────────────────────────────────────
        case "hurt": {
          this.setSprite("Hurt", this.animFrame);
          this.animFrame++;
          if (this.animFrame >= this.frames.Hurt.length) {
            if (this.hurtThenDead) {
              this.state = "dead";
              this.animFrame = 0;
            } else {
              // keep idling; do NOT reset idleTicks so 60s can still hit
              this.state = "idle";
              this.animFrame = 0;
            }
          }
          this.updateEl();
          return;
        }

        // ── DEAD (holds last frame until clicked) ───────────────
        case "dead": {
          // Hold on the final frame.
          const lastFrame = this.frames.Dead.length - 1;
          this.setSprite("Dead", Math.min(this.animFrame, lastFrame));
          if (this.animFrame < lastFrame) this.animFrame++;
          // No auto-revive — triggerJump() (a click) brings them back.
          this.updateEl();
          return;
        }

        // ── SLIDE (decelerate to a stop) ────────────────────────
        case "slide": {
          // cursor ran off again → resume chasing
          if (distance >= WAKE_DISTANCE) {
            this.enterActive();
            return;
          }
          this.posX += this.slideVX;
          this.posY += this.slideVY;
          this.slideVX *= SLIDE_FRICTION;
          this.slideVY *= SLIDE_FRICTION;
          this.clampPos();

          this.setSprite("Slide", this.animFrame);
          this.animFrame++;
          if (this.animFrame >= this.frames.Slide.length) {
            this.enterIdle(true);
          }
          this.updateEl();
          return;
        }

        // ── RUN ─────────────────────────────────────────────────
        case "run": {
          if (distance < ARRIVE_DISTANCE) {
            // begin sliding stop using current velocity
            this.state = "slide";
            this.animFrame = 0;
            this.slideVX = this.lastDirX * SPEED;
            this.slideVY = this.lastDirY * SPEED;
            return;
          }

          this.lastDirX = diffX / distance;
          this.lastDirY = diffY / distance;

          if (diffX > 0.5) this.facing = 1;
          else if (diffX < -0.5) this.facing = -1;

          this.setSprite("Run", this.animFrame);
          this.animFrame++;

          this.posX += this.lastDirX * SPEED;
          this.posY += this.lastDirY * SPEED;
          this.clampPos();
          this.updateEl();
          return;
        }

        // ── IDLE ────────────────────────────────────────────────
        case "idle":
        default: {
          if (distance >= ARRIVE_DISTANCE) {
            this.enterActive();
            return;
          }

          this.idleTicks++;
          const seconds = this.idleTicks / TICKS_PER_SEC;

          // 60s: hurt then dead
          if (!this.deadTriggered && seconds >= IDLE_DEAD_SECONDS) {
            this.deadTriggered = true;
            this.hurtThenDead = true;
            this.state = "hurt";
            this.animFrame = 0;
            return;
          }

          // 10s: hurt then keep idling
          if (!this.hurtTriggered && seconds >= IDLE_HURT_SECONDS) {
            this.hurtTriggered = true;
            this.hurtThenDead = false;
            this.state = "hurt";
            this.animFrame = 0;
            return;
          }

          this.setSprite("Idle", this.animFrame);
          this.animFrame++;
          this.updateEl();
          return;
        }
      }
    }
  }

  Scratch.extensions.register(new CodePet());
})(Scratch);