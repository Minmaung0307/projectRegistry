import React, { useState } from "react";
import Modal from "./Modal";
export default function SetupGuide() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="wide" onClick={() => setOpen(true)}>
        Gmail login ချိတ်ဆက်နည်း
      </button>
      {open && (
        <Modal title="Firebase စတင်ချိတ်ဆက်နည်း" onClose={() => setOpen(false)}>
          <ol>
            <li>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
              >
                Firebase Console
              </a>{" "}
              မှာ project တစ်ခု ဖန်တီးပါ၊ သို့မဟုတ် ရှိပြီးသားကို ရွေးပါ။
            </li>
            <li>
              Project settings → Your apps → Web app မှ apiKey၊ authDomain၊
              projectId၊ appId ကို ယူပြီး .env.local ထဲ ထည့်ပါ။
            </li>
            <li>
              Authentication → Sign-in method → Google ကို Enable လုပ်ပြီး
              support email ရွေးပါ။
            </li>
            <li>
              Authentication → Settings → Authorized domains မှာ localhost နှင့်
              တကယ်သုံးမယ့် domain ကို ထည့်ပါ။ ယခု hostname က{" "}
              <b>{location.hostname}</b> ဖြစ်ပါတယ်။
            </li>
            <li>
              Firestore Database ကို ဖန်တီးပြီး ပါလာတဲ့ security rules ကို
              deploy လုပ်ပါ။
            </li>
            <li>
              App ကို restart / rebuild လုပ်ပါ။ ပြီးရင် Google / Gmail ခလုတ်နဲ့
              စမ်းဝင်နိုင်ပါပြီ။
            </li>
          </ol>
          <p>
            ဒီ config က public Web config ဖြစ်ပါတယ်။ Password၊ token သို့မဟုတ်
            service-account private key မပို့ပါနှင့်။
          </p>
        </Modal>
      )}
    </>
  );
}
