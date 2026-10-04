# Folio — ပရောဂျက်မှတ်တမ်း

Web app တစ်ခုချင်းစီရဲ့ local repo၊ GitHub၊ Firebase၊ domain၊ deployment နဲ့ အသုံးပြုသူ/အကောင့်များကို တစ်နေရာတည်းမှာ မှတ်သားနိုင်တဲ့ app ဖြစ်ပါတယ်။ ဖုန်းမှာ အဆင်ပြေစေဖို့ ဦးစားပေး ဒီဇိုင်းလုပ်ထားပြီး မြန်မာစာ UI၊ Google login၊ Firestore၊ PWA install နဲ့ modal များ ပါဝင်ပါတယ်။

## Gmail login ဘယ်တော့ ဝင်လို့ရမလဲ

Firebase Web config မထည့်ရသေးလို့ လောလောဆယ် Google login ခလုတ် ပိတ်ထားပါတယ်။ အောက်ပါ Firebase ပြင်ဆင်ချက်တွေ ပြီးပြီး app ကို restart / rebuild လုပ်ပြီးတာနဲ့ Gmail ဖြင့် စမ်းဝင်နိုင်ပါတယ်။ သတ်မှတ်ရက်တစ်ရက်အထိ စောင့်ရခြင်း မဟုတ်ပါ။ တကယ်ဝင်နိုင်ကြောင်းကို မိမိအကောင့်နဲ့ စမ်းသပ်ရန် လိုပါသေးတယ်။

1. [Firebase Console](https://console.firebase.google.com/) ကို Gmail နဲ့ ဝင်ပါ။ Project တစ်ခု ဖန်တီးပါ သို့မဟုတ် ရှိပြီးသားကို ရွေးပါ။
2. Project settings → Your apps → Web app (`</>`) မှာ app ကို register လုပ်ပါ။
3. ပြထားတဲ့ `firebaseConfig` ထဲက `apiKey`, `authDomain`, `projectId`, `appId` ကို ယူပါ။ ဒါတွေဟာ public Web config ဖြစ်ပါတယ်။ **Password၊ access token၊ service-account JSON၊ private key မလိုပါ။ မပို့ပါနှင့်။**
4. Authentication → Sign-in method → Google ကို Enable လုပ်ပြီး support email ရွေးပါ။
5. Authentication → Settings → Authorized domains မှာ `localhost` နဲ့ production hostname ကို ထည့်ပါ။ `127.0.0.1` ဖြင့် စမ်းသုံးမယ်ဆိုရင် အဲဒီ hostname ကိုပါ ထည့်ပါ။ အသစ်ဖန်တီးသော Firebase project များမှာ localhost အလိုအလျောက် ပါမလာနိုင်ပါ။
6. Firestore Database ကို ဖန်တီးပါ။ စတင်ချိန်မှာ locked / production mode ကို သုံးပြီး ပါလာတဲ့ rules ကို deploy လုပ်ပါ။

## စက်ထဲမှာ စတင်သုံးနည်း

Node.js 22.12+ LTS သို့မဟုတ် Node.js 24 LTS နဲ့ npm လိုပါတယ်။ ဒီ folder ထဲမှာ အောက်ပါအတိုင်း လုပ်ပါ။

```sh
npm ci
cp .env.example .env.local
```

`.env.local` ထဲမှာ မိမိ Firebase Web config အစစ် ဖြည့်ပါ။

```dotenv
VITE_FIREBASE_API_KEY=မိမိ-apiKey
VITE_FIREBASE_AUTH_DOMAIN=မိမိ-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=မိမိ-project-id
VITE_FIREBASE_APP_ID=မိမိ-appId
```

```sh
npm run dev
```

ပြထားတဲ့ local URL ကို browser မှာ ဖွင့်ပါ။ Config မရှိသေးရင် **နမူနာ စမ်းသုံးမည်** ကို နှိပ်နိုင်ပါတယ်။ နမူနာဒေတာ ပြင်ဆင်ချက်တွေဟာ လက်ရှိ session အတွင်းသာ ရှိပြီး refresh လုပ်ရင် ပျောက်ပါတယ်။ Config ပြောင်းပြီးတိုင်း dev server ကို restart လုပ်ပါ။

Google login ကို popup နဲ့ ဖွင့်ပါတယ်။ Popup ပိတ်ထားရင် browser မှာ ခွင့်ပြုပေးပါ။ Facebook/အခြား app ထဲက browser မှာ အဆင်မပြေရင် Safari သို့မဟုတ် Chrome မှာ ဖွင့်ပါ။

## Firestore rules နဲ့ website ဖြန့်ချိနည်း

ပရောဂျက် ID မှန်ကြောင်း စစ်ပြီး လုပ်ပါ။ CLI login က မိမိ Google အကောင့်ဖြင့် ဝင်ရန် ဖြစ်ပါတယ်။

```sh
npx firebase login
npx firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
npm run build
npx firebase deploy --only hosting --project YOUR_PROJECT_ID
```

Firebase Hosting မှ ထုတ်ပေးတဲ့ HTTPS URL မှာ အသုံးပြုနိုင်ပါပြီ။ Domain အသစ်ချိတ်ရင် Authentication ရဲ့ Authorized domains စာရင်းထဲပါ ထည့်ပါ။ Config ကို build လုပ်ချိန်မှာ app ထဲ ထည့်သွင်းတာဖြစ်လို့ ပြောင်းတိုင်း rebuild + deploy လုပ်ရပါတယ်။ လက်ရှိ repository ထဲမှာ Firebase account/project ရွေးချယ်ထားခြင်း မရှိပါ။

## PWA / ဖုန်းထဲ app အဖြစ် ထည့်သွင်းခြင်း

SVG favicon၊ 192/512 PNG icon၊ iOS icon၊ Web App Manifest နဲ့ service worker ပါပါတယ်။

- Android / Chrome / Edge: **App ထည့်သွင်းရန်** ခလုတ်ကို နှိပ်ပါ။ Browser က install prompt ပေးနိုင်တဲ့အချိန်မှာ တိုက်ရိုက်ပြပေးပါတယ်။ မပေးနိုင်သေးရင် ထည့်သွင်းနည်း modal ပြပေးပါတယ်။
- iPhone / iPad: Safari မှာ ဖွင့်ပြီး Share → Add to Home Screen ကို ရွေးပါ။
- App ထည့်ပြီး standalone mode နဲ့ ဖွင့်ထားရင် install ခလုတ် မပြတော့ပါ။
- HTTPS လိုအပ်ပါတယ်။ Local စမ်းသပ်ခြင်းအတွက် localhost / loopback ကို သုံးနိုင်ပါတယ်။

Service worker ကို **production build** မှာပဲ register လုပ်ပါတယ်။ Local PWA စမ်းဖို့—

```sh
npm run build
npm run preview
```

ပထမဆုံး အင်တာနက်ရှိစဉ် ဖွင့်ပြီးနောက် offline မှာ app မျက်နှာပြင်ကို ပြန်ဖွင့်နိုင်ပါတယ်။ Gmail login၊ cloud ဒေတာရယူခြင်း၊ သိမ်း/ဖျက်ခြင်းအတွက် အင်တာနက် လိုပါတယ်။ Service worker က same-origin app shell၊ icon နဲ့ static asset များကိုသာ cache လုပ်ပြီး Google OAuth လမ်းကြောင်း၊ Firestore ဒေတာ၊ account email မှတ်တမ်းများကို cache မလုပ်ပါ။ Firebase ရဲ့ persistent offline disk cache ကိုလည်း မဖွင့်ထားပါ။

အသစ် deploy လုပ်ရင် ဗားရှင်းအသစ်ကို ရရှိသည့်အချိန် **ဗားရှင်းအသစ် ရပြီ** ခလုတ် ပြပါတယ်။ နှိပ်ပြီး မသိမ်းရသေးတဲ့အချက်အလက်များကို အရင်သိမ်းကာ ပြန်ဖွင့်နိုင်ပါတယ်။ အလုပ်လုပ်နေစဉ် အလိုအလျောက် refresh မလုပ်ပါ။ Hosting မှာ `sw.js` ကို no-cache header သတ်မှတ်ထားပါတယ်။

## Modal နဲ့ ပြင်ဆင်ချက်များ

ပရောဂျက်ဖျက်ခြင်း၊ ပြင်ဆင်ချက်ပယ်ဖျက်ခြင်း၊ install လမ်းညွှန်နဲ့ update အတည်ပြုခြင်းတွေကို app ထဲက modal နဲ့ ပြထားပါတယ်။ Keyboard focus၊ Escape နဲ့ Cancel ကို ပံ့ပိုးထားပြီး ဖျက်ခြင်းကို အတည်ပြုမှ လုပ်ပါတယ်။ `window.alert` / `window.confirm` မသုံးတော့ပါ။

မသိမ်းရသေးချိန် browser tab ပိတ်ခြင်း/refresh လုပ်ခြင်းအတွက် browser ကိုယ်တိုင်ထုတ်ပေးတဲ့ `beforeunload` သတိပေးချက်ကိုတော့ ထားထားပါတယ်။ ဒါကို custom modal နဲ့ အစားထိုးရန် browser က ခွင့်မပြုပါ။

## မှတ်တမ်းဖွဲ့စည်းပုံနှင့် ဝင်ခွင့်

Google အကောင့်တစ်ခုစီမှာ **ကိုယ်ပိုင်သီးသန့် registry** ရှိပါတယ်။ App ထဲက Admin၊ Student၊ Manager၊ TA၊ Staff နဲ့ custom role များဟာ အခြား app တွင် သုံးသော အကောင့်မှတ်တမ်းများသာ ဖြစ်ပါတယ်။ ဒီ role ထည့်ထားလို့ registry ကို ဝင်ဖတ်/ပြင်ခွင့် မရပါ။

- ပရောဂျက်: `users/{firebaseAuthUid}/projects/{projectId}`
- အကောင့်မှတ်တမ်း: `users/{uid}/mappings/{projectId}_{position}`
- `position` 0–11 ဖြင့် ပရောဂျက်တစ်ခုလျှင် ၁၂ ခုအထိ မှတ်နိုင်ပါတယ်။
- ပရောဂျက်နဲ့ mapping များကို save/delete လုပ်ရာမှာ batch တစ်ခုတည်းနဲ့ လုပ်ပါတယ်။
- မိမိ UID လမ်းကြောင်းကိုသာ read/list/write/delete လုပ်နိုင်ပါတယ်။ အခြားလမ်းကြောင်းတွေကို default-deny လုပ်ထားပါတယ်။
- Mapping တစ်ခုစီကို rules နဲ့ validate လုပ်ပြီး parent project ရှိမှ ရေးခွင့်ပေးပါတယ်။ မသတ်မှတ်ထားသော field များကို ပယ်ချပါတယ်။
- `createdAt` / `updatedAt` က server timestamp ဖြစ်ပြီး `createdAt` ကို ပြန်ပြောင်းခွင့် မပေးပါ။
- App ပြင်ပ SDK ဖြင့် project ကို တိုက်ရိုက်ဖျက်ရင် mapping များကိုပါ ဖျက်ရန် လိုပါတယ်။

ပရောဂျက်မှာ အမည်၊ အကြောင်းအရာ၊ status/environment၊ local path၊ GitHub account/email/repo/branch၊ Firebase email/name/ID/hosting site၊ production URL/domain၊ tech stack၊ deployment method/date၊ notes နဲ့ timestamps တွေ ပါပါတယ်။ Mapping တစ်ခုမှာ လူအမည်၊ role၊ သက်ဆိုင်ရာ app မှာ တကယ်သုံးထားသော email နဲ့ notes ပါပါတယ်။

Passwords/tokens/private keys ထည့်ရန် field မရှိပါ။ Free-text notes ထဲမှာ လူကိုယ်တိုင် paste လုပ်သော လျှို့ဝှက်ချက်ကိုတော့ အလိုအလျောက် အမြဲခွဲခြားမသိနိုင်လို့ မထည့်ပါနှင့်။ Password manager မှာ သီးခြားထားပါ။

ပရောဂျက်တွေကို မိမိပိုင် collection များမှ ရယူပြီး စက်ထဲမှာ ရှာဖွေ/စစ်ထုတ်ပါတယ်။ Solo developer အတွက် ရိုးရှင်းတဲ့ ဖွဲ့စည်းပုံပါ။ အလွန်များလာရင် pagination နဲ့ indexed query ထပ်ထည့်သင့်ပါတယ်။ Shared workspace နဲ့ team invitations မပါသေးပါ။ စက်နှစ်လုံးက တစ်ပြိုင်နက်ပြင်ရင် နောက်ဆုံးသိမ်းသော ပြင်ဆင်ချက်ကို ယူပါတယ်။

## စမ်းသပ်နည်း

```sh
npm test
npm run build
npm run test:rules
npx playwright install chromium
npm run test:ui
npm run test:pwa
```

Rules test က Java 21+ ပါသော local Firestore emulator နဲ့ `demo-registry` ကို သုံးပါတယ်။ Live database ကို မသုံးပါ။ Chrome ရှိပြီးသား စက်မှာ `PLAYWRIGHT_CHANNEL=chrome npm run test:ui` / `npm run test:pwa` ဖြင့် စမ်းနိုင်ပါတယ်။

လက်ရှိ ပြင်ဆင်မှုမှာ model test ၅ ခု၊ phone/desktop UI test ၄ ခု၊ production PWA test ၂ ခုနဲ့ build အောင်မြင်ပါတယ်။ ယခင် private-data rules test ၃ ခုလည်း အောင်မြင်ထားပြီး ယခု rules မပြောင်းထားပါ။ Live Google OAuth နဲ့ public domain ပေါ်က device installation ကိုတော့ မိမိ Firebase config/hosting ချိတ်ပြီးမှ စမ်းသပ်နိုင်ပါတယ်။

## Developer အတွက် ဖိုင်များ

- `src/main.jsx`: အဓိက views နဲ့ session handling
- `src/model.js`: schema၊ field definitions၊ ရှာဖွေခြင်း
- `src/my.js`: မြန်မာစာ label နဲ့ validation message
- `src/firebase.js`: login၊ Firestore subscription နဲ့ atomic writes
- `src/Modal.jsx`: keyboard အသုံးပြုနိုင်သော reusable modal
- `src/PwaControls.jsx`: install၊ update နဲ့ offline အခြေအနေ
- `src/SetupGuide.jsx`: app ထဲက Firebase ချိတ်ဆက်နည်း
- `scripts/pwa.js`: build asset များအလိုက် version ပါသော service worker ထုတ်ခြင်း
- `public/`: manifest၊ SVG favicon နဲ့ PNG icons
- `firestore.rules`: server က enforce လုပ်သော permissions

`.npmrc` နဲ့ `package-lock.json` ကို အတူထားပါ။ Lockfile ပြုလုပ်စဉ် အသုံးပြုသော peer-resolution mode ကို ထိန်းထားပါတယ်။ ယခင် production dependency audit မှာ known vulnerability သုည ဖြစ်ပါတယ်။ Firebase CLI ရဲ့ development/deployment dependencies မှာ ၁၂ ခု (moderate ၅၊ high ၇) ကျန်ရှိပြီး browser bundle ထဲ မပါပါ။ CLI update များကို စစ်ဆေးရန် လိုပါတယ်။

ကိုးကားရန်: [Firebase Google login](https://firebase.google.com/docs/auth/web/google-signin)၊ [Firebase authorized domains](https://firebase.google.com/docs/auth/faq-and-troubleshooting)၊ [PWA install](https://web.dev/learn/pwa/installation-prompt)။
