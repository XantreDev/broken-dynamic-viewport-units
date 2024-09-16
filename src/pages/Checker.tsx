import { createMutable, createStore } from "solid-js/store";
import {
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
  untrack,
} from "solid-js";
import Drawer from "@corvu/drawer";
const history = createMutable<Vhs[]>([]);

const processVhs = (vhs: Vhs) => {
  const lastVhs = history.at(-1);
  if (!lastVhs || !Vhs_isEqual(lastVhs, vhs)) {
    history.push(vhs);
  }
};

type Vhs = Record<"lvh" | "dvh" | "svh" | "vh" | "timestamp", number>;
const Vhs_isEqual = (a: Vhs, b: Vhs) =>
  a.dvh === b.dvh && a.lvh === b.lvh && a.svh === b.svh && a.vh === b.vh;

const checkVh = (): Vhs => {
  const getUnit = (unit: "lvh" | "dvh" | "svh" | "vh") => {
    var fixed = document.createElement("div");
    fixed.style.width = "1px";
    fixed.style.height = "100" + unit;
    fixed.style.position = "fixed";
    fixed.style.left = "0";
    fixed.style.top = "0";
    fixed.style.visibility = "hidden";

    document.body.appendChild(fixed);

    var height = fixed.clientHeight;

    fixed.remove();

    // to have a precision
    return height / 100;
  };

  return {
    lvh: getUnit("lvh"),
    dvh: getUnit("dvh"),
    svh: getUnit("svh"),
    vh: getUnit("vh"),
    timestamp: performance.now(),
  };
};

const initialize = () => {
  processVhs(checkVh());

  document.addEventListener("DOMContentLoaded", () => {
    processVhs(checkVh());
  });

  window.addEventListener("resize", () => {
    processVhs(checkVh());
  });
};

export const Checker = () => {
  onMount(() => {
    if (!import.meta.env.SSR) {
      initialize();
    }
  });

  const [changed, setChanged] = createStore({
    lvh: false,
    svh: false,
  });

  createEffect(() => {
    const changedCopy = untrack(() => ({
      ...changed,
    }));
    if (history.length < 2 || (changedCopy.lvh && changedCopy.svh)) return;
    for (let i = 0; i < history.length - 1; ++i) {
      const cur = history[i];
      const next = history[i + 1];
      if (cur.lvh !== next.lvh) {
        changedCopy.lvh = true;
      }
      if (cur.svh !== next.svh) {
        changedCopy.svh = true;
      }
    }
    setChanged(changedCopy);
  });

  const lastVhs = () => history.at(-1);
  const [isHistoryShown, setIsHistoryShown] = createSignal(false);

  return (
    <div class="fixed inset-0 prose pt-10 px-6 mx-auto [contain:strict]">
      <h2>
        Broken{" "}
        <a href="https://web.dev/blog/viewport-units">dynamic viewport</a> units
        demo
      </h2>

      <p>
        Scroll to see how values changes (makes sense only on mobile with hiding
        url bar). Lvh and svh must be static
      </p>

      <ul class="flex flex-col">
        <li>
          <span class="min-w-20 inline-block mr-2">lvh: {lastVhs()?.lvh ?? "Loading..."}</span>
          <span
            classList={{
              "text-green-500": !changed.lvh,
              "text-red-500": changed.lvh,
            }}
          >
            {changed.lvh ? "❌ unstable" : "✔️ is stable"}
          </span>
        </li>
        <li>
          <span class="min-w-20 inline-block mr-2">vh: {lastVhs()?.vh ?? "Loading..."}</span>
        </li>
        <li>
          <span class="min-w-20 inline-block mr-2">dvh: {lastVhs()?.dvh ?? "Loading..."}</span>
        </li>
        <li>
          <span class="min-w-20 inline-block mr-2">svh: {lastVhs()?.svh ?? "Loading..."}</span>
          <span
            classList={{
              "text-green-500": !changed.svh,
              "text-red-500": changed.svh,
            }}
          >
            {changed.svh ? "❌ unstable" : "✔️ is stable"}
          </span>
        </li>
      </ul>

      <Drawer>
        {(props) => (
          <>
            <Drawer.Trigger
              onClick={() => {
                setIsHistoryShown(!isHistoryShown());
              }}
              class="bg-black text-white rounded-full px-6 py-1 active:scale-95 transition-transform"
            >
              Show history
            </Drawer.Trigger>

            <Drawer.Portal>
              <Drawer.Overlay
                class="fixed inset-0 z-50 corvu-transitioning:transition-colors corvu-transitioning:duration-500 corvu-transitioning:ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{
                  "background-color": `rgb(0 0 0 / ${
                    0.5 * props.openPercentage
                  })`,
                }}
              />
              <Drawer.Content class="fixed inset-x-0 bottom-0 z-50 flex h-full max-h-[500px] flex-col rounded-t-lg border-t-4 bg-gray-100 pt-3 after:absolute after:inset-x-0 after:top-[calc(100%-1px)] after:h-1/2 after:bg-inherit corvu-transitioning:transition-transform corvu-transitioning:duration-500 corvu-transitioning:ease-[cubic-bezier(0.32,0.72,0,1)] md:select-none pb-4">
                <div class="h-1 w-10 shrink-0 self-center rounded-full bg-gray-500" />
                <Drawer.Label class="mt-2 text-center text-xl font-bold">
                  History
                </Drawer.Label>
                <div class="mt-3 grow divide-y divide-gray-400 overflow-y-auto overflow-x-hidden flex flex-col ">
                  <For each={history}>
                    {(item, idx) => (
                      <p
                        classList={{
                          "py-2 px-2 font-bold max-w-full text-wrap [overflow-wrap:break-word]":
                            true,
                          "bg-gray-200": idx() % 2 === 0,
                        }}
                      >
                        {JSON.stringify(item, null, 2)}
                      </p>
                    )}
                  </For>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </>
        )}
      </Drawer>
    </div>
  );
};
