import React, { useEffect, useState } from "react";
import { Download, RefreshCw, WifiOff } from "lucide-react";
import Modal from "./Modal";
export default function PwaControls() {
  const [prompt, setPrompt] = useState(null),
    [help, setHelp] = useState(false),
    [installed, setInstalled] = useState(
      () =>
        matchMedia("(display-mode: standalone)").matches ||
        navigator.standalone === true,
    ),
    [offline, setOffline] = useState(!navigator.onLine),
    [waiting, setWaiting] = useState(null),
    [updateHelp, setUpdateHelp] = useState(false);
  useEffect(() => {
    let active = true;
    let registration;
    const mq = matchMedia("(display-mode: standalone)");
    const check = () =>
      setInstalled(mq.matches || navigator.standalone === true);
    const available = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    const done = () => {
      setInstalled(true);
      setPrompt(null);
    };
    const online = () => setOffline(!navigator.onLine);
    window.addEventListener("beforeinstallprompt", available);
    window.addEventListener("appinstalled", done);
    window.addEventListener("online", online);
    window.addEventListener("offline", online);
    mq.addEventListener("change", check);
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((r) => {
          if (!active) return;
          registration = r;
          if (r.waiting) setWaiting(r.waiting);
          r.onupdatefound = () => {
            const worker = r.installing;
            worker.onstatechange = () => {
              if (
                active &&
                worker.state === "installed" &&
                navigator.serviceWorker.controller
              )
                setWaiting(worker);
            };
          };
        })
        .catch(() => {});
    }
    return () => {
      active = false;
      if (registration) registration.onupdatefound = null;
      window.removeEventListener("beforeinstallprompt", available);
      window.removeEventListener("appinstalled", done);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
      mq.removeEventListener("change", check);
    };
  }, []);
  async function install() {
    if (!prompt) {
      setHelp(true);
      return;
    }
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      setHelp(true);
    } finally {
      setPrompt(null);
    }
  }
  function update() {
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => location.reload(),
      { once: true },
    );
    waiting.postMessage({ type: "SKIP_WAITING" });
  }
  return (
    <>
      <div className="pwa-tools">
        {offline && (
          <span className="offline" role="status">
            <WifiOff size={16} /> အင်တာနက် မချိတ်ထားပါ
          </span>
        )}
        {!installed && (
          <button onClick={install}>
            <Download size={17} /> App ထည့်သွင်းရန်
          </button>
        )}
        {waiting && (
          <button onClick={() => setUpdateHelp(true)}>
            <RefreshCw size={17} /> ဗားရှင်းအသစ် ရပြီ
          </button>
        )}
      </div>
      {help && (
        <Modal title="App ထည့်သွင်းနည်း" onClose={() => setHelp(false)}>
          <p>ဖုန်းမှာ app လို အလွယ်တကူ ဖွင့်သုံးနိုင်ပါတယ်။</p>
          <ul>
            <li>
              iPhone / iPad — Safari မှာ ဖွင့်ပြီး Share → Add to Home Screen
              ကို နှိပ်ပါ။
            </li>
            <li>
              Android / ကွန်ပျူတာ — Chrome သို့မဟုတ် Edge ရဲ့ menu မှာ Install
              app / Add to Home screen ကို ရွေးပါ။
            </li>
          </ul>
          <p>
            Install ရွေးချယ်စရာ မတွေ့သေးရင် HTTPS လိပ်စာမှာ ဖွင့်ထားကြောင်း
            စစ်ပါ။ Local development မှာ production preview ကို သုံးရပါတယ်။
          </p>
        </Modal>
      )}
      {updateHelp && (
        <Modal
          title="ဗားရှင်းအသစ် ပြောင်းမလား"
          onClose={() => setUpdateHelp(false)}
          actions={
            <>
              <button autoFocus onClick={() => setUpdateHelp(false)}>
                နောက်မှ
              </button>
              <button className="primary" onClick={update}>
                ပြန်ဖွင့်မည်
              </button>
            </>
          }
        >
          <p>
            စာမျက်နှာကို ပြန်ဖွင့်ပါမယ်။ မသိမ်းရသေးတဲ့ ပြင်ဆင်ချက်တွေကို
            အရင်သိမ်းပါ။
          </p>
        </Modal>
      )}
    </>
  );
}
