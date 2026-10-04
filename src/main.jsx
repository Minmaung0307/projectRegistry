import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Plus,
  Search,
  ArrowUpRight,
  Layers,
  Folder,
  Users,
  LogOut,
  ArrowLeft,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Code2,
} from "lucide-react";
import {
  groups,
  statuses,
  environments,
  blankProject,
  projectSchema,
  sampleProjects,
  filterProjects,
} from "./model";
import * as api from "./firebase";
import "./style.css";
import Modal from "./Modal";
import SetupGuide from "./SetupGuide";
import PwaControls from "./PwaControls";
import { labelOf, validationMessage } from "./my";
const prettyDate = (v) =>
  v?.toDate
    ? v.toDate().toLocaleString()
    : v
      ? new Date(v).toLocaleString()
      : "—";
function App() {
  const [confirmation, setConfirmation] = useState(null);
  const [user, setUser] = useState(null),
    [authReady, setAuthReady] = useState(!api.configured),
    [demo, setDemo] = useState(false),
    [projects, setProjects] = useState([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [view, setView] = useState("list"),
    [selected, setSelected] = useState(null),
    [draft, setDraft] = useState(blankProject()),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("All"),
    [env, setEnv] = useState("All"),
    [notice, setNotice] = useState("");
  useEffect(() => {
    if (error) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [error]);
  useEffect(
    () =>
      api.watchAuth((u) => {
        setUser(u);
        setAuthReady(true);
        setProjects([]);
        setView("list");
      }),
    [],
  );
  useEffect(() => {
    if (!user || demo) return;
    setLoading(true);
    return api.watchProjects(
      user.uid,
      (p) => {
        setProjects(p);
        setLoading(false);
      },
      () => {
        setError(
          "ပရောဂျက်များ ရယူမရပါ။ အင်တာနက်နှင့် Firestore ခွင့်ပြုချက်များကို စစ်ပါ။",
        );
        setLoading(false);
      },
    );
  }, [user, demo]);
  const current = projects.find((p) => p.id === selected);
  const visible = filterProjects(projects, search, status, env).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  async function signIn() {
    setBusy(true);
    setError("");
    try {
      await api.login();
    } catch (e) {
      setError(
        e.code === "auth/popup-closed-by-user"
          ? "အကောင့်ဝင်ခြင်းကို ပယ်ဖျက်လိုက်ပါတယ်။ ထပ်ကြိုးစားနိုင်ပါတယ်။"
          : `ဝင်မရသေးပါ (${e.code || "ချိတ်ဆက်မှုအမှား"})။ Firebase ပြင်ဆင်မှုနှင့် Google login popup ခွင့်ပြုထားခြင်းကို စစ်ပေးပါ။`,
      );
    } finally {
      setBusy(false);
    }
  }
  function openEditor(p) {
    setDraft(
      p
        ? Object.fromEntries(Object.keys(blankProject()).map((k) => [k, p[k]]))
        : blankProject(),
    );
    setSelected(p?.id || null);
    setView("edit");
    setError("");
    window.scrollTo(0, 0);
  }
  function leaveEditor() {
    setConfirmation("discard");
  }
  function discard() {
    setView(selected ? "detail" : "list");
    setError("");
    setConfirmation(null);
  }
  useEffect(() => {
    if (view !== "edit") return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [view]);
  async function save(e) {
    e.preventDefault();
    setError("");
    if (!demo && !navigator.onLine) {
      setError(
        "အင်တာနက် ပြန်ချိတ်ပြီးမှ သိမ်းပေးပါ။ ပြင်ဆင်ချက်တွေ မပျောက်သေးပါ။",
      );
      return;
    }
    const result = projectSchema.safeParse(draft);
    if (!result.success) {
      setError(
        result.error.issues.map((x) => validationMessage(x)).join(" • "),
      );
      return;
    }
    setBusy(true);
    try {
      let id = selected;
      if (demo) {
        id ||= crypto.randomUUID();
        const item = {
          ...result.data,
          id,
          createdAt: current?.createdAt || Date.now(),
          updatedAt: Date.now(),
        };
        setProjects((p) => [...p.filter((x) => x.id !== id), item]);
      } else {
        id = await api.saveProject(user.uid, result.data, id);
      }
      setSelected(id);
      setView("detail");
      setNotice("ပရောဂျက် သိမ်းပြီးပါပြီ");
    } catch {
      setError(
        "သိမ်းမရသေးပါ။ ပြင်ဆင်ချက်များ မပျောက်သေးပါ။ အင်တာနက် စစ်ပြီး ထပ်ကြိုးစားပါ။",
      );
    } finally {
      setBusy(false);
    }
  }
  async function del() {
    if (!demo && !navigator.onLine) {
      setError("ဖျက်ဖို့ အင်တာနက် လိုအပ်ပါတယ်။");
      return;
    }
    setBusy(true);
    try {
      if (demo) setProjects((p) => p.filter((x) => x.id !== selected));
      else await api.removeProject(user.uid, selected);
      setView("list");
      setSelected(null);
      setNotice("ပရောဂျက် ဖျက်ပြီးပါပြီ");
      setConfirmation(null);
    } catch {
      setError("ဖျက်မရပါ။ ထပ်ကြိုးစားပေးပါ။");
    } finally {
      setBusy(false);
    }
  }
  async function exit() {
    setBusy(true);
    try {
      if (!demo) await api.logout();
      setDemo(false);
      setProjects([]);
      setView("list");
      setError("");
      setNotice("");
      setConfirmation(null);
      setSelected(null);
      setDraft(blankProject());
    } catch {
      setError("အကောင့်ထွက်မရပါ။ ထပ်ကြိုးစားပေးပါ။");
    } finally { setBusy(false); }
  }
  if (!user && !demo)
    return (
      <main className="landing">
        <PwaControls />
        <div className="brand">
          <Layers /> folio<span>ပရောဂျက်မှတ်တမ်း</span>
        </div>
        <div className="login-card">
          <span className="eyebrow">စနစ်ကျကျ မှတ်တမ်းတင်ကြမယ်</span>
          <h1>
            သင့်ပရောဂျက်အားလုံး
            <br />
            <em>တစ်နေရာတည်းမှာ။</em>
          </h1>
          <p>
            Repo၊ deployment နှင့် အသုံးပြုထားတဲ့ အကောင့်တွေကို တစ်နေရာတည်းမှာ
            စနစ်တကျ မှတ်ထားပါ။
          </p>
          <div className="login-features">
            <span>
              <Folder /> ပရောဂျက်တိုင်းရဲ့ အချက်အလက်
            </span>
            <span>
              <Users /> အကောင့်တိုင်းရဲ့ ဆက်စပ်မှု
            </span>
            <span>
              <ShieldCheck /> သင့်အတွက် သီးသန့်နေရာ
            </span>
          </div>
          {!authReady ? (
            <p>အကောင့် စစ်ဆေးနေသည်…</p>
          ) : (
            <>
              <button
                className="primary wide"
                disabled={!api.configured || busy}
                onClick={signIn}
              >
                Google / Gmail ဖြင့် ဝင်မည် <ArrowUpRight size={18} />
              </button>
              {!api.configured && (
                <p className="hint">
                  Gmail ဖြင့် ဝင်ဖို့ Firebase ချိတ်ဆက်ရပါမယ်။ မြန်မာလို
                  ရေးထားတဲ့ စတင်အသုံးပြုနည်းကို ကြည့်ပါ။
                </p>
              )}
              <button
                className="wide"
                onClick={() => {
                  setProjects(structuredClone(sampleProjects));
                  setDemo(true);
                }}
              >
                နမူနာ စမ်းသုံးမည် <ChevronRight size={18} />
              </button>
            </>
          )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {!api.configured && <SetupGuide />}
          <small>Password၊ token နှင့် private key များ မထည့်ပါနှင့်။</small>
        </div>
        <footer>ရှာဖွေရတာ နည်းပြီး လုပ်ဆောင်ရတာ ပိုလွယ်စေဖို့။</footer>
      </main>
    );
  return (
    <div className="app">
      <aside>
        <div className="brand">
          <Layers /> folio
        </div>
        <p className="nav-caption">သင့်လုပ်ငန်းခွင်</p>
        <button
          className="nav-active"
          onClick={() => (view === "edit" ? leaveEditor() : setView("list"))}
        >
          <Folder size={19} /> ပရောဂျက်များ <span>{projects.length}</span>
        </button>
        <div className="sidebar-note">
          <ShieldCheck />
          <b>ရှင်းရှင်းလင်းလင်း မှတ်တမ်းထားပါ</b>
          <p>
            ပရောဂျက်အချက်အလက်နှင့် email များသာ မှတ်သားပါ။ လျှို့ဝှက်ချက်များကို
            password manager မှာ ထားပါ။
          </p>
        </div>
        <div className="identity">
          <div className="avatar">{(user?.displayName || "Demo")[0]}</div>
          <div>
            <b>
              {demo
                ? "နမူနာလုပ်ငန်းခွင်"
                : user?.displayName || "သင့်လုပ်ငန်းခွင်"}
            </b>
            <small>{demo ? "နမူနာအချက်အလက်များ" : user?.email}</small>
          </div>
        </div>
        <button disabled={busy} onClick={()=>view === "edit" ? setConfirmation("logout") : exit()}>
          <LogOut size={16} />
          {demo ? "နမူနာမှ ထွက်မည်" : "အကောင့်ထွက်မည်"}
        </button>
      </aside>
      <main className="workspace">
        <PwaControls />
        {confirmation && (
          <Modal
            title={
              confirmation === "delete"
                ? "ပရောဂျက်ကို ဖျက်မလား"
                : confirmation === "logout" ? "အကောင့်မှ ထွက်မလား" : "ပြင်ဆင်ချက်တွေ ပယ်ဖျက်မလား"
            }
            onClose={() => setConfirmation(null)}
            busy={busy}
            actions={
              <>
                <button
                  autoFocus
                  disabled={busy}
                  onClick={() => setConfirmation(null)}
                >
                  မလုပ်သေးပါ
                </button>
                <button
                  className={confirmation === "delete" ? "danger" : "primary"}
                  disabled={busy}
                  onClick={confirmation === "delete" ? del : confirmation === "logout" ? exit : discard}
                >
                  {busy
                    ? "လုပ်ဆောင်နေသည်…"
                    : confirmation === "delete"
                      ? "အပြီးဖျက်မည်"
                      : confirmation === "logout" ? "မသိမ်းဘဲ ထွက်မည်" : "ပယ်ဖျက်မည်"}
                </button>
              </>
            }
          >
            <p>
              {confirmation === "delete"
                ? `“${current?.name}” နှင့် ဆက်စပ်အကောင့်မှတ်တမ်းများကို အပြီးဖျက်ပါမယ်။ ပြန်ယူလို့ မရပါ။`
                : "မသိမ်းရသေးတဲ့ ပြင်ဆင်ချက်တွေ ပျောက်သွားပါမယ်။"}
            </p>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
          </Modal>
        )}
        <header>
          <span>
            သင့်လုပ်ငန်းခွင် <span className="separator">/</span>{" "}
            ပရောဂျက်မှတ်တမ်း
          </span>
          <span className="private">
            <ShieldCheck size={14} />
            {demo ? "နမူနာ" : "သီးသန့်"}
          </span>
        </header>
        {demo && (
          <div className="demo-banner">
            နမူနာပရောဂျက်များကို စမ်းသုံးနေပါတယ်။ စာမျက်နှာပြန်ဖွင့်ရင်
            ပြင်ဆင်ချက်များ ပျောက်သွားပါမယ်။
          </div>
        )}
        {error && (
          <div role="alert" className="error">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="notice">
            {notice}
            <button
              aria-label="အသိပေးချက် ပိတ်မည်"
              onClick={() => setNotice("")}
            >
              ×
            </button>
          </div>
        )}
        {view === "list" && (
          <>
            <div className="page-title">
              <div>
                <span className="eyebrow">အားလုံးကို ခြုံကြည့်မယ်</span>
                <h1>
                  သင့်ပရောဂျက်များ<span className="dot">.</span>
                </h1>
                <p>သင်ဖန်တီးထားသမျှအတွက် မှတ်တမ်းတစ်ခု။</p>
              </div>
              <button className="primary" onClick={() => openEditor()}>
                <Plus size={18} /> ပရောဂျက်အသစ်
              </button>
            </div>
            <div className="stats">
              <div>
                <span>ပရောဂျက်စုစုပေါင်း</span>
                <strong>{projects.length.toString().padStart(2, "0")}</strong>
                <Folder />
              </div>
              <div>
                <span>လက်ရှိအသုံးပြုနေသည်</span>
                <strong>
                  {projects
                    .filter((p) => p.environment === "Production")
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
                <Layers />
              </div>
              <div>
                <span>အကောင့်မှတ်တမ်းများ</span>
                <strong>
                  {projects
                    .reduce((s, p) => s + p.members.length, 0)
                    .toString()
                    .padStart(2, "0")}
                </strong>
                <Users />
              </div>
            </div>
            <section className="collection">
              <div className="collection-title">
                <h2>ပရောဂျက်စာရင်း</h2>
                <span>{visible.length} ခု</span>
              </div>
              <div className="toolbar">
                <label className="search">
                  <Search size={18} />
                  <input
                    aria-label="ပရောဂျက်နှင့် email ရှာရန်"
                    placeholder="ပရောဂျက်၊ အကောင့်၊ email ရှာရန်…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <select
                  aria-label="အခြေအနေအလိုက် စစ်ရန်"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="All">အခြေအနေအားလုံး</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {labelOf(s)}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="အသုံးပြုရာအဆင့်အလိုက် စစ်ရန်"
                  value={env}
                  onChange={(e) => setEnv(e.target.value)}
                >
                  <option value="All">အဆင့်အားလုံး</option>
                  {environments.map((s) => (
                    <option key={s} value={s}>
                      {labelOf(s)}
                    </option>
                  ))}
                </select>
              </div>
              {loading ? (
                <p role="status">ပရောဂျက်များ ရယူနေသည်…</p>
              ) : visible.length ? (
                <div className="cards">
                  {visible.map((p, i) => (
                    <button
                      key={p.id}
                      className="project-card"
                      onClick={() => {
                        setSelected(p.id);
                        setView("detail");
                      }}
                    >
                      <div className="card-top">
                        <span className={"project-icon color-" + (i % 3)}>
                          <Code2 />
                        </span>
                        <span className={"badge " + p.status.replace(" ", "-")}>
                          {labelOf(p.status)}
                        </span>
                      </div>
                      <h3>{p.name}</h3>
                      <p>
                        {p.description ||
                          "ဒီပရောဂျက်အကြောင်း ရေးထည့်နိုင်ပါတယ်။"}
                      </p>
                      <div className="tags">
                        <span>{labelOf(p.environment)}</span>
                        {p.stack && <span>{p.stack}</span>}
                      </div>
                      <div className="card-bottom">
                        <span>
                          <Users size={14} />
                          အကောင့် {p.members.length} ခု
                        </span>
                        <ArrowUpRight size={18} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <Folder size={32} />
                  <h3>
                    {projects.length
                      ? "ကိုက်ညီသော ပရောဂျက် မတွေ့ပါ"
                      : "ပထမဆုံး ပရောဂျက် ထည့်ကြမယ်"}
                  </h3>
                  <p>
                    {projects.length
                      ? "ရှာဖွေစကားလုံး သို့မဟုတ် စစ်ထုတ်မှု ပြောင်းကြည့်ပါ။"
                      : "သင့်ပရောဂျက်ရဲ့ အချက်အလက်တွေကို စတင်မှတ်သားပါ။"}
                  </p>
                  {!projects.length && (
                    <button onClick={() => openEditor()}>
                      ပရောဂျက် ဖန်တီးမည်
                    </button>
                  )}
                </div>
              )}
            </section>
            <footer>
              အချက်အလက်တွေ စုံစုံလင်လင်၊ ဆက်စပ်မှုတွေ ရှင်းရှင်းလင်းလင်း။
            </footer>
          </>
        )}
        {view === "detail" &&
          (current ? (
            <>
              <button className="back" onClick={() => setView("list")}>
                <ArrowLeft size={16} /> ပရောဂျက်အားလုံး
              </button>
              <div className="page-title">
                <div>
                  <span className="eyebrow">ပရောဂျက်အကျဉ်းချုပ်</span>
                  <h1>{current.name}</h1>
                  <p>{current.description}</p>
                </div>
                <button className="primary" onClick={() => openEditor(current)}>
                  ပရောဂျက် ပြင်မည်
                </button>
              </div>
              <div className="detail-grid">
                {groups.map(([title, fields]) => (
                  <section className="panel" key={labelOf(title)}>
                    <h2>{labelOf(title)}</h2>
                    <dl>
                      {fields.map(([key, label, type]) => (
                        <div key={key}>
                          <dt>{labelOf(label)}</dt>
                          <dd>
                            {current[key] ? (
                              type === "url" &&
                              /^https?:\/\//i.test(current[key]) ? (
                                <a
                                  href={current[key]}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {current[key]} ↗
                                </a>
                              ) : ["status", "environment"].includes(key) ? (
                                labelOf(current[key])
                              ) : (
                                current[key]
                              )
                            ) : (
                              "—"
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
                <section className="panel">
                  <h2>
                    အသုံးပြုသူနှင့် အကောင့်များ{" "}
                    <span>{current.members.length}</span>
                  </h2>
                  <p className="hint">
                    ဒီ app မှာ သုံးတဲ့ email များကို မှတ်ထားခြင်းသာ ဖြစ်ပါတယ်။
                    ဒီ role များကြောင့် registry ကို ဝင်သုံးခွင့် မရပါ။
                  </p>
                  {current.members.length ? (
                    current.members.map((m, i) => (
                      <div className="member" key={i}>
                        <span className="badge">{m.role}</span>
                        <h3>{m.name}</h3>
                        <a href={"mailto:" + m.email}>{m.email}</a>
                        {m.notes && <p>{m.notes}</p>}
                      </div>
                    ))
                  ) : (
                    <p>အကောင့်မှတ်တမ်း မထည့်ရသေးပါ။</p>
                  )}
                </section>
              </div>
              <div className="end-row">
                <small>
                  ဖန်တီးချိန် {prettyDate(current.createdAt)} · ပြင်ဆင်ချိန်{" "}
                  {prettyDate(current.updatedAt)}
                </small>
                <button
                  className="danger"
                  disabled={busy}
                  onClick={() => setConfirmation("delete")}
                >
                  <Trash2 size={16} /> ပရောဂျက် ဖျက်မည်
                </button>
              </div>
            </>
          ) : (
            <div className="empty">
              <h2>
                {loading ? "ပရောဂျက် ရယူနေသည်…" : "ပရောဂျက်ကို မတွေ့နိုင်ပါ"}
              </h2>
              <button onClick={() => setView("list")}>
                စာရင်းသို့ ပြန်မည်
              </button>
            </div>
          ))}
        {view === "edit" && (
          <>
            <button disabled={busy} className="back" onClick={leaveEditor}>
              <ArrowLeft size={16} /> ပြင်ဆင်မှု ပယ်ဖျက်မည်
            </button>
            <div className="page-title">
              <div>
                <span className="eyebrow">အချက်အလက်များ ဖြည့်ကြမယ်</span>
                <h1>
                  {selected ? "ပရောဂျက် ပြင်မည်" : "ပရောဂျက်အသစ်"}
                  <span className="dot">.</span>
                </h1>
                <p>ပရောဂျက်တစ်ခုရဲ့ ဆက်စပ်အချက်အလက်အားလုံး။</p>
              </div>
            </div>
            <form onSubmit={save}>
              <fieldset disabled={busy} className="form-fieldset">
                <div className="secret-note">
                  <ShieldCheck size={18} /> အကောင့်အမည်နှင့် email များသာ
                  ထည့်ပါ။ Password၊ API token နှင့် private key မထည့်ပါနှင့်။
                </div>
                {groups.map(([title, fields], i) => (
                  <section className="panel form-panel" key={labelOf(title)}>
                    <h2>
                      <span className="step">0{i + 1}</span>
                      {labelOf(title)}
                    </h2>
                    <div className="fields">
                      {fields.map(([key, label, type]) => (
                        <label
                          key={key}
                          className={type === "textarea" ? "full" : ""}
                        >
                          {labelOf(label)}
                          {key === "name" && " *"}
                          {type === "status" || type === "environment" ? (
                            <select
                              value={draft[key]}
                              onChange={(e) =>
                                setDraft({ ...draft, [key]: e.target.value })
                              }
                            >
                              {(type === "status"
                                ? statuses
                                : environments
                              ).map((s) => (
                                <option key={s} value={s}>
                                  {labelOf(s)}
                                </option>
                              ))}
                            </select>
                          ) : type === "textarea" ? (
                            <textarea
                              maxLength={2000}
                              rows={3}
                              value={draft[key]}
                              onChange={(e) =>
                                setDraft({ ...draft, [key]: e.target.value })
                              }
                            />
                          ) : (
                            <input
                              required={key === "name"}
                              maxLength={
                                key === "name"
                                  ? 200
                                  : type === "email"
                                    ? 254
                                    : 2000
                              }
                              type={type || "text"}
                              value={draft[key]}
                              onChange={(e) =>
                                setDraft({ ...draft, [key]: e.target.value })
                              }
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  </section>
                ))}
                <section className="panel form-panel">
                  <h2>
                    <span className="step">06</span>အသုံးပြုသူနှင့် အကောင့်များ
                  </h2>
                  <p className="hint">
                    ဒီ app အတွက် တကယ်သုံးထားတဲ့ email ကို ထည့်ပါ။
                    ပရောဂျက်တစ်ခုမှာ အကောင့် ၁၂ ခုအထိ မှတ်ထားနိုင်ပါတယ်။
                  </p>
                  {draft.members.map((m, i) => (
                    <div className="member-editor" key={i}>
                      <div className="fields">
                        {[
                          ["name", "Person / label"],
                          ["role", "Role"],
                          ["email", "Email used in this app"],
                          ["notes", "Notes"],
                        ].map(([k, label]) => (
                          <label key={k}>
                            {labelOf(label)}
                            <input
                              required={k !== "notes"}
                              type={k === "email" ? "email" : "text"}
                              list={k === "role" ? "roles" : undefined}
                              maxLength={
                                k === "role"
                                  ? 80
                                  : k === "name"
                                    ? 200
                                    : k === "email"
                                      ? 254
                                      : 2000
                              }
                              value={m[k]}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  members: draft.members.map((x, j) =>
                                    j === i ? { ...x, [k]: e.target.value } : x,
                                  ),
                                })
                              }
                            />
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="danger"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            members: draft.members.filter((_, j) => j !== i),
                          })
                        }
                      >
                        အကောင့်မှတ်တမ်း ဖြုတ်မည် {i + 1}
                      </button>
                    </div>
                  ))}
                  <datalist id="roles">
                    {["Admin", "Student", "Manager", "TA", "Staff"].map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    disabled={draft.members.length >= 12}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        members: [
                          ...draft.members,
                          { role: "Admin", name: "", email: "", notes: "" },
                        ],
                      })
                    }
                  >
                    <Plus size={16} /> အကောင့်မှတ်တမ်း ထည့်မည်
                  </button>
                </section>
                <div className="save-bar">
                  <span>
                    {selected
                      ? "ပရောဂျက်အချက်အလက်များ ပြင်ဆင်ပါ"
                      : "ဖြည့်ပြီးရင် သိမ်းနိုင်ပါပြီ"}
                  </span>
                  <button type="button" onClick={leaveEditor}>
                    ပယ်ဖျက်မည်
                  </button>
                  <button className="primary" type="submit">
                    {busy ? "သိမ်းနေသည်…" : "ပရောဂျက် သိမ်းမည်"}
                  </button>
                </div>
              </fieldset>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
