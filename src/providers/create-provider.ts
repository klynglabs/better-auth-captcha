import type { CaptchaProvider } from "../types.ts";
import { warn } from "../utils/browser.ts";

interface ProviderDefinition<Widget> {
  name: string;
  mount: () => Promise<Widget>;
  execute: (widget: Widget) => Promise<string>;
}

export function createProvider<Widget>({
  name,
  mount,
  execute,
}: ProviderDefinition<Widget>): CaptchaProvider {
  let widget: Promise<Widget> | undefined;
  let queue = Promise.resolve("");

  const getWidget = () =>
    (widget ??= mount().catch((error: unknown) => {
      widget = undefined;
      throw error;
    }));

  return {
    preload: () => {
      getWidget().catch((error: unknown) => warn("Preload failed", error));
    },
    getToken: () => {
      queue = queue.then(async () => {
        try {
          return await execute(await getWidget());
        } catch (error) {
          warn(`${name} error`, error);
          return "";
        }
      });
      return queue;
    },
  };
}
