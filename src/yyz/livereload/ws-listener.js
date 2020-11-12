import EventEmitter from "./tiny-event";

const noop = () => {};

export default function connect(opt = {}, cb = noop) {
  if (typeof opt === "string") {
    opt = { uri: opt };
  }

  if (cb != null && typeof cb !== "function") {
    throw new Error("cb must be a function or undefined");
  }

  const {
    uri,
    reconnect = true,
    binaryType = undefined,
    reconnectInterval = 1000,
    maxReconnects = Infinity,
  } = opt;

  if (!uri) {
    throw new Error(
      `First parameter must be a string or include { uri } option`
    );
  }

  const queued = [];
  let retries = 0;
  let reconnectIntervalHandle;
  let isReconnecting = false;
  let socket;

  const emitter = new EventEmitter();

  emitter.on("data", cb);

  if (opt.log) {
    emitter.on("connected", () => console.log("[socket] Connected"));
    emitter.on("disconnected", () => console.log("[socket] Disconnected"));
    emitter.on("reconnecting", () =>
      console.log("[socket] Attempting reconnect...")
    );
    emitter.on("reconnected", () => console.log("[socket] Reconnected"));
    emitter.on("max-reconnects", () =>
      console.log("[socket] Reached maximum reconnect attempts")
    );
  }

  open();

  return Object.assign(emitter, {
    send(message) {
      if (socket && socket.readyState === 1) {
        socket.send(message);
      } else {
        queued.push(message);
      }
    },
    close,
    open,
  });

  function scheduleReconnect() {
    if (retries >= maxReconnects) {
      emitter.emit("max-reconnects");
      return;
    }
    if (!isReconnecting) {
      isReconnecting = true;
      emitter.emit("reconnecting");
    }
    retries++;
    clearTimeout(reconnectIntervalHandle);
    reconnectIntervalHandle = setTimeout(handleReconnect, reconnectInterval);
  }

  function open() {
    close();
    socket = createWebSocket();
  }

  function close(code, reason) {
    clearTimeout(reconnectIntervalHandle);
    retries = 0;
    isReconnecting = false;
    closeSocket(code, reason);
  }

  function closeSocket(code, reason) {
    if (socket && (socket.readyState === 0 || socket.readyState === 1)) {
      // force close the existing socket
      // this should send code 1000 and not trigger a reconnect
      socket.close(code != null ? code : 1000, reason);
    }
  }

  function handleReconnect() {
    closeSocket();
    socket = createWebSocket();
  }

  function createWebSocket() {
    var ws = new window.WebSocket(uri);
    if (binaryType != null) ws.binaryType = binaryType;
    ws.onmessage = function (event) {
      emitter.emit("socket-message", event);
      emitter.emit("data", event.data);
    };
    ws.onclose = function (ev) {
      // Ignore subsequent close events
      ws.onclose = () => {};

      emitter.emit("socket-close", ev);

      if (!isReconnecting) {
        emitter.emit("disconnected");
      }

      if (ev.code === 1000) {
        // Closed normally, don't reconnect
        return;
      }

      if (reconnect) {
        scheduleReconnect();
      }
    };
    ws.onopen = function (ev) {
      emitter.emit("socket-open", ev);
      if (isReconnecting) {
        isReconnecting = false;
        retries = 0;
        emitter.emit("reconnected");
      } else {
        emitter.emit("connected");
      }
      if (queued.length && ws.readyState === 1) {
        queued.forEach((message) => {
          ws.send(message);
        });
        queued.length = 0;
      }
    };
    ws.onerror = function (ev) {
      emitter.emit("socket-error", ev);
      return false;
    };
    return ws;
  }
}
