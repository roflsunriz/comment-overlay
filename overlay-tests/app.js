const moduleCandidates = [
  "./dist/comment-overlay.es.js",
  "../dist/comment-overlay.es.js",
  "../dist/comment-overlay.es",
];

const loadOverlayModule = async () => {
  const failures = [];
  for (const candidate of moduleCandidates) {
    try {
      return await import(candidate);
    } catch (error) {
      failures.push({ candidate, error });
    }
  }

  failures.forEach(({ candidate, error }) => {
    console.error(`Failed to import ${candidate}`, error);
  });
  const detail = failures
    .map(
      ({ candidate, error }) =>
        `${candidate}: ${error instanceof Error ? error.message : String(error)}`,
    )
    .join("; ");
  throw new Error(`Unable to load comment overlay module. Attempts: ${detail}`);
};

const statusEl = document.querySelector("#status");
const videoEl = document.querySelector("#test-video");
const containerEl = document.querySelector(".overlay-container");
const toggleEl = document.querySelector("#toggle-visibility");
const reloadButton = document.querySelector("#reload-comments");

const reportStatus = (message) => {
  if (statusEl) {
    statusEl.textContent = message;
  }
};

const sanitizeCommentEntry = (entry) => {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const text = typeof entry.text === "string" ? entry.text.trim() : "";
  const vpos = Number(entry.vpos);
  if (!text || !Number.isFinite(vpos) || vpos < 0) {
    return null;
  }
  const commands = Array.isArray(entry.commands)
    ? entry.commands.filter((value) => typeof value === "string" && value.length > 0)
    : [];
  return { text, vpos, commands };
};

const setup = async () => {
  if (!videoEl || !containerEl || !toggleEl || !reloadButton) {
    reportStatus("Initialization failed: required elements are missing.");
    return;
  }

  reportStatus("Bootstrapping overlay module...");

  const { CommentRenderer, cloneDefaultSettings } = await loadOverlayModule();
  const renderer = new CommentRenderer(cloneDefaultSettings(), {
    loggerNamespace: "OverlayTest",
  });

  renderer.initialize({ video: videoEl, container: containerEl });
  window.commentRenderer = renderer;

  const loadComments = async () => {
    reportStatus("Loading comment data...");
    try {
      const response = await fetch("./comments.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const rawComments = await response.json();
      const cleaned = Array.isArray(rawComments)
        ? rawComments.map(sanitizeCommentEntry).filter(Boolean)
        : [];

      renderer.clearComments();
      cleaned.forEach(({ text, vpos, commands }) => {
        renderer.addComment(text, vpos, commands);
      });

      reportStatus(`Loaded ${cleaned.length} comments.`);
      return cleaned.length;
    } catch (error) {
      console.error("Failed to load comments.json", error);
      reportStatus(
        `Failed to load comments. ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    }
  };

  toggleEl.addEventListener("change", (event) => {
    const isVisible = event.target instanceof HTMLInputElement ? event.target.checked : true;
    const nextSettings = { ...renderer.settings, isCommentVisible: isVisible };
    renderer.updateSettings(nextSettings);
  });

  reloadButton.addEventListener("click", () => {
    renderer.resetState();
    void loadComments();
  });

  window.addEventListener("beforeunload", () => {
    renderer.destroy();
  });

  await loadComments();
};

void setup();
