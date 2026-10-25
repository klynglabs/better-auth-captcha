export function warn(message: string, ...data: unknown[]) {
  console.warn(`[better-auth-captcha] ${message}`, ...data);
}

export function loadScript<Api>(src: string, onload: string, getApi: () => Api | undefined) {
  return new Promise<Api>((resolve, reject) => {
    const existing = getApi();
    if (existing) {
      resolve(existing);
      return;
    }

    Object.assign(window, {
      [onload]: () => {
        const api = getApi();
        if (api) resolve(api);
      },
    });

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
      once: true,
    });
    document.head.append(script);
  });
}

export function once<T>(create: () => Promise<T>) {
  let result: Promise<T> | undefined;
  return () => (result ??= create());
}

export function createQueue() {
  let tail: Promise<unknown> = Promise.resolve();
  return <T>(task: () => Promise<T>) => {
    const result = tail.then(task);
    tail = result.catch(() => {});
    return result;
  };
}
