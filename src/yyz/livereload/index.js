import connect from "./ws-listener";
import loadScript from "load-script";
// import reloadCSS from "reload-css";

if (window.errorPopup) {
  if (window.errorPopup.parentElement) {
    window.errorPopup.parentElement.removeChild(window.errorPopup);
  }
  window.errorPopup = null;
}

export default function livereload_dev() {
  if (window._livereload) return;
  window._livereload = true;

  const protocol = window.location.protocol;
  const ssl = protocol === "https:";
  const host = window.location.host;
  const uri = `${ssl ? "wss" : "ws"}://${host}`;

  const io = connect({
    uri,
    log: true,
  });

  io.on("data", (data) => {
    if (data === "reload-js") {
      reload();
    }
  });

  io.on("reconnected", () => {
    window.location.reload();
  });

  function reload() {
    const src = __YYZ_SCRIPT_SRC__ + "?bust=" + Date.now();
    // console.clear();
    loadJS(src);
  }

  function loadJS(url, opts = {}) {
    return new Promise((resolve, reject) => {
      loadScript(url, opts, (err, script) => {
        if (err) reject(err);
        else resolve(script);
      });
    });
  }
}
