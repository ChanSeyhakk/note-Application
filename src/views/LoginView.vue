<template>
  <main class="login-page" :class="{ 'login-page--dark': isDark }">
    <section class="login-shell" aria-label="Sign in to NoteMe">
      <aside class="intro-panel">
        <a class="brand" href="#/login" aria-label="NoteMe home">
          <span class="brand__mark"><img :src="logoUrl" alt="" /></span>
          <span class="brand__copy">
            <strong>NoteMe</strong>
            <small>Your personal notes</small>
          </span>
        </a>

        <div class="intro-content">
          <div class="note-illustration" aria-hidden="true">
            <span class="paper-plane">➤</span>
            <span class="orbit orbit--one"></span>
            <span class="orbit orbit--two"></span>
            <span class="leaf leaf--one"></span>
            <span class="leaf leaf--two"></span>
            <div class="back-note">
              <i></i><i></i><i></i>
            </div>
            <div class="front-note">
              <span class="front-note__line front-note__line--short"></span>
              <span class="front-note__line"></span>
              <span class="front-note__line front-note__line--medium"></span>
            </div>
            <span class="pencil-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z" /></svg>
            </span>
          </div>

          <h1>Your ideas,<br /><span>organized.</span></h1>
          <p class="intro-content__description">
            Capture your thoughts, keep track<br class="desktop-break" />
            of your plans, and find what matters.<br class="desktop-break" />
            Anytime, anywhere.
          </p>

          <div class="features">
            <div class="feature">
              <span class="feature__icon">
                <svg viewBox="0 0 24 24"><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z" /></svg>
              </span>
              <span><strong>Write</strong><small>Capture ideas</small></span>
            </div>
            <div class="feature">
              <span class="feature__icon">
                <svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3z" /></svg>
              </span>
              <span><strong>Organize</strong><small>Keep it simple</small></span>
            </div>
            <div class="feature">
              <span class="feature__icon">
                <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
              </span>
              <span><strong>Find</strong><small>Search anytime</small></span>
            </div>
          </div>
        </div>
        <div class="intro-panel__footer">
          <span>“A small note today can be a big idea tomorrow.”</span>
          <i></i><i></i><i></i>
        </div>
      </aside>

      <section class="form-panel">
        <button
          type="button"
          class="theme-toggle"
          :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="toggleTheme"
        >
          <span :class="{ 'theme-toggle__active': !isDark }" aria-hidden="true">☼</span>
          <span :class="{ 'theme-toggle__active': isDark }" aria-hidden="true">☾</span>
        </button>

        <div class="login-card">
          <div class="card-brand" aria-label="NoteMe">
            <span class="brand__mark"><img :src="logoUrl" alt="" /></span>
          </div>

          <header class="form-heading">
            <h2>Welcome back</h2>
            <p>Sign in to continue to <strong>NoteMe</strong></p>
          </header>

          <div v-if="errorMessage" class="form-message form-message--error" role="alert">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="form-message form-message--success" role="status">
            {{ successMessage }}
          </div>

          <form class="login-form" @submit.prevent="login">
            <div class="form-field">
              <label for="email">Email</label>
              <div class="input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div class="form-field">
              <label for="password">Password</label>
              <div class="input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></svg>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  class="password-toggle"
                  type="button"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="showPassword" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10.6 10.6 0 0 0 4-.8" /></svg>
                  <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                </button>
              </div>
            </div>

            <button class="submit-button" type="submit" :disabled="loading">
              {{ loading ? "Signing in..." : "Sign in" }}
              <svg v-if="!loading" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </button>
          </form>

          <p class="register-prompt">
            Don’t have an account?
            <button type="button" @click="goRegister">Create account</button>
          </p>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const logoUrl = `${import.meta.env.BASE_URL.replace(/\/?$/, "/")}noteme-logo.png`;
const router = useRouter();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const isDark = ref(false);

const loadTheme = () => {
  isDark.value = localStorage.getItem("theme") === "dark";
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
};

const login = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!email.value.trim()) {
    errorMessage.value = "Please enter your email.";
    return;
  }

  if (!password.value) {
    errorMessage.value = "Please enter your password.";
    return;
  }

  loading.value = true;

  try {
    const response = await api.post("/Auth/login", {
      email: email.value.trim(),
      password: password.value,
    });

    localStorage.setItem("token", response.data.token);

    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    successMessage.value = "Login successful.";
    setTimeout(() => {
      router.push("/notes");
    }, 400);
  } catch (error: any) {
    console.error(error);
    errorMessage.value =
      error?.response?.data?.message || "Invalid email or password.";
  } finally {
    loading.value = false;
  }
};

const goRegister = () => {
  router.push("/register");
};

onMounted(() => {
  loadTheme();
});
</script>

<style scoped>
.login-page {
  --form-bg: #f3f7fc;
  --card-bg: #fff;
  --ink: #17243a;
  --muted: #8593a9;
  --line: #e6edf6;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 36px;
  background: #202020;
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.login-page--dark {
  --form-bg: #111a29;
  --card-bg: #1c293b;
  --ink: #edf3ff;
  --muted: #9ba9bd;
  --line: #314157;
}

.login-shell {
  display: grid;
  grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr);
  width: min(1120px, 100%);
  min-height: 610px;
  overflow: hidden;
  border-radius: 3px;
  background: var(--form-bg);
  box-shadow: 0 25px 90px #0005;
}

.intro-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 38px clamp(30px, 5vw, 64px) 25px;
  background: linear-gradient(145deg, #102446 0%, #102b58 52%, #153e9e 100%);
  color: #fff;
}

.intro-panel::before, .intro-panel::after {
  position: absolute;
  right: -90px;
  bottom: -155px;
  width: 430px;
  height: 260px;
  border: 1px solid #6fa2ff1f;
  border-radius: 50%;
  background: #174da83b;
  content: "";
  transform: rotate(-19deg);
}

.intro-panel::after { right: -165px; bottom: -182px; width: 480px; height: 240px; background: #367aff1c; }
.intro-panel__glow { position: absolute; border-radius: 50%; background: #2d69d5; filter: blur(75px); opacity: .24; }
.intro-panel__glow--one { top: 80px; left: 10%; width: 190px; height: 190px; }
.intro-panel__glow--two { right: -55px; bottom: 15%; width: 180px; height: 180px; background: #4289ff; }
.brand, .card-brand { display: inline-flex; align-items: center; gap: 12px; text-decoration: none; }
.brand { position: relative; z-index: 1; align-self: flex-start; color: #fff; }
.brand__mark { display: block; width: 43px; height: 43px; flex: 0 0 auto; overflow: hidden; border-radius: 12px; background: #fff; box-shadow: 0 7px 19px #0055ef50; }
.brand__mark img { display: block; width: 100%; height: 100%; object-fit: cover; transform: scale(1.2); }
.brand__copy { display: grid; gap: 3px; }
.brand__copy strong { font-size: 16px; line-height: 1.1; letter-spacing: -.2px; }
.brand__copy small { color: #a8b8d0; font-size: 10px; }
.intro-content { position: relative; z-index: 1; width: min(390px, 100%); margin: auto 0; padding: 20px 0 24px; }
.intro-content h1 { margin: 4px 0 9px; font-size: clamp(28px, 3.2vw, 39px); font-weight: 780; letter-spacing: -1px; line-height: 1.12; }
.intro-content h1 span { color: #4382ff; }
.intro-content__description { margin: 0; color: #a9bad3; font-size: 13px; line-height: 1.65; }
.note-illustration { position: relative; width: 275px; height: 188px; margin: 0 0 12px 5px; }
.note-illustration::before { position: absolute; top: 31px; left: 37px; width: 186px; height: 130px; border-radius: 50%; background: #2551a15c; content: ""; transform: rotate(-16deg); }
.paper-plane { position: absolute; z-index: 2; top: 15px; left: 15px; color: #5392ff; font-size: 30px; transform: rotate(-28deg); text-shadow: 0 5px 14px #3e85ff7a; }
.orbit { position: absolute; z-index: 1; border: 1px dashed #74a7ff6b; border-radius: 50%; }
.orbit--one { top: 40px; left: 9px; width: 91px; height: 76px; transform: rotate(-34deg); }
.orbit--two { top: 18px; left: 27px; width: 34px; height: 20px; border-color: transparent; }
.back-note { position: absolute; z-index: 2; top: 36px; left: 119px; display: grid; gap: 11px; width: 95px; height: 105px; padding: 22px 15px; border-radius: 8px; background: linear-gradient(150deg, #2a5aa7, #1a3a74); box-shadow: 0 12px 25px #06163555; transform: rotate(10deg); }
.back-note i { height: 6px; border-radius: 5px; background: #6688ba; }
.back-note i:nth-child(2) { width: 75%; }
.back-note i:nth-child(3) { width: 55%; }
.front-note { position: absolute; z-index: 3; top: 61px; left: 55px; display: flex; flex-direction: column; gap: 13px; width: 128px; height: 104px; padding: 21px 15px; border-radius: 11px; background: #f8fbff; box-shadow: 0 13px 29px #06163555; transform: rotate(-8deg); }
.front-note__line { display: block; width: 88px; height: 7px; border-radius: 8px; background: #4486ff; }
.front-note__line--short { width: 17px; height: 12px; border-radius: 4px; background: #a9caff; }
.front-note__line--medium { width: 67px; }
.leaf { position: absolute; z-index: 2; bottom: 4px; left: 15px; width: 25px; height: 49px; border-radius: 100% 0 100% 0; background: #19c59a; transform: rotate(-34deg); }
.leaf--two { bottom: 0; left: 29px; width: 21px; height: 41px; background: #38d1ab; transform: rotate(20deg); }
.pencil-badge { position: absolute; z-index: 4; top: 119px; left: 160px; display: grid; width: 39px; height: 39px; place-items: center; border: 2px solid #fff; border-radius: 50%; background: #3482ff; box-shadow: 0 5px 14px #071a3d65; }
.pencil-badge svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.features { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 21px; }
.feature { display: flex; align-items: center; gap: 8px; }
.feature__icon { display: grid; width: 29px; height: 29px; place-items: center; border-radius: 7px; background: #ffffff1c; color: #fff; }
.feature__icon svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.feature > span:last-child { display: grid; gap: 2px; }
.feature strong { color: #f2f6ff; font-size: 9px; }
.feature small { color: #a6bad7; font-size: 8px; white-space: nowrap; }
.intro-panel__footer { position: relative; z-index: 1; display: flex; justify-content: space-between; height: 10px; }
.intro-panel__footer span:first-child { width: 70%; border-top: 1px solid #ffffff1c; border-radius: 50%; }
.intro-panel__footer span:last-child { width: 27%; border-top: 1px solid #ffffff15; border-radius: 50%; }

.form-panel { position: relative; display: grid; place-items: center; min-width: 0; padding: 70px 32px; background: radial-gradient(ellipse at 50% 45%, #fff 0%, #f7faff 66%, #eff5fc 100%); }
.login-page--dark .form-panel { background: radial-gradient(ellipse at 50% 45%, #23334b 0%, #172438 70%, #111a29 100%); }
.theme-toggle { position: absolute; top: 20px; right: 20px; display: flex; align-items: center; gap: 3px; padding: 4px; border: 1px solid #e3eaf3; border-radius: 18px; background: #eaf0f8; color: #5a6c84; cursor: pointer; }
.login-page--dark .theme-toggle { border-color: #35465d; background: #24334a; color: #c2d1e7; }
.theme-toggle span { display: grid; width: 24px; height: 24px; place-items: center; border-radius: 50%; font-size: 15px; }
.theme-toggle .theme-toggle__active { background: #fff; color: #e6a526; box-shadow: 0 1px 4px #162c4c20; }
.login-page--dark .theme-toggle .theme-toggle__active { background: #334865; color: #ffd16a; }
.login-card { width: min(100%, 390px); padding: 31px 32px 28px; border: 1px solid #edf1f7; border-radius: 14px; background: var(--card-bg); box-shadow: 0 13px 36px #39578116; }
.login-page--dark .login-card { border-color: #2d3b50; box-shadow: 0 13px 36px #0002; }
.card-brand { display: flex; justify-content: center; }
.card-brand .brand__mark { width: 39px; height: 39px; border-radius: 10px; font-size: 21px; }
.card-brand .brand__copy { color: var(--ink); text-align: left; }
.card-brand .brand__copy strong { font-size: 14px; }
.card-brand .brand__copy small { color: var(--muted); font-size: 8px; }
.form-heading { margin: 18px 0 22px; text-align: center; }
.form-heading h2 { margin: 0; color: var(--ink); font-size: 25px; font-weight: 760; letter-spacing: -.7px; }
.form-heading p { margin: 6px 0 0; color: var(--muted); font-size: 11px; }
.form-heading p strong { color: #2864e8; font-weight: 650; }
.form-message { margin: 0 0 14px; padding: 10px 12px; border: 1px solid; border-radius: 8px; font-size: 11px; line-height: 1.5; }
.form-message--error { border-color: #f1c7ca; background: #fff4f4; color: #c43e48; }
.form-message--success { border-color: #bee8d0; background: #effbf4; color: #198550; }
.login-form { display: grid; gap: 17px; }
.form-field { display: grid; gap: 7px; }
.form-field label { color: var(--ink); font-size: 10px; font-weight: 700; }
.input-wrap { display: flex; align-items: center; gap: 9px; min-height: 39px; padding: 0 10px; border: 1px solid var(--line); border-radius: 8px; background: color-mix(in srgb, var(--form-bg) 64%, var(--card-bg)); transition: border-color .18s ease, box-shadow .18s ease; }
.input-wrap:focus-within { border-color: #75a2ff; box-shadow: 0 0 0 3px #3478f51b; }
.input-wrap > svg { width: 14px; height: 14px; flex: 0 0 auto; fill: none; stroke: #8393aa; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.input-wrap input { width: 100%; min-width: 0; padding: 10px 0; border: 0; outline: 0; background: transparent; color: var(--ink); font: inherit; font-size: 10px; }
.input-wrap input::placeholder { color: #a3afc0; }
.password-toggle { flex: 0 0 auto; padding: 4px; border: 0; background: transparent; color: #7586a0; cursor: pointer; font: inherit; font-size: 9px; }
.password-toggle:hover { color: #2864e8; }
.submit-button { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; margin-top: 1px; border: 0; border-radius: 8px; background: linear-gradient(100deg, #1760f5, #286bfa); color: #fff; cursor: pointer; font: inherit; font-size: 11px; font-weight: 700; box-shadow: 0 6px 14px #2864e82e; transition: transform .18s ease, box-shadow .18s ease; }
.submit-button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 9px 18px #2864e845; }
.submit-button:disabled { cursor: wait; opacity: .7; }
.submit-button svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.divider { display: flex; align-items: center; gap: 13px; margin: 20px 0 17px; }
.divider span { height: 1px; flex: 1; background: var(--line); }
.divider small { color: #94a1b4; font-size: 8px; }
.register-prompt { margin: 0; color: var(--muted); font-size: 9px; text-align: center; }
.register-prompt button { margin-left: 3px; padding: 0; border: 0; background: transparent; color: #1760ec; cursor: pointer; font: inherit; font-weight: 700; }
.register-prompt button:hover { color: #0d49c3; text-decoration: underline; }

@media (min-width: 1200px) {
  .login-shell { min-height: 660px; }
  .intro-panel { padding-left: 68px; padding-right: 68px; }
  .intro-content { margin-left: 10px; }
}

@media (max-width: 760px) {
  .login-page { padding: 0; background: var(--form-bg); }
  .login-shell { grid-template-columns: 1fr; min-height: 100vh; border-radius: 0; box-shadow: none; }
  .intro-panel { min-height: 285px; padding: 22px 28px 18px; }
  .brand__mark { width: 38px; height: 38px; }
  .intro-content { display: grid; grid-template-columns: 170px 1fr; align-items: center; column-gap: 14px; width: 100%; margin: auto 0; padding: 8px 0; }
  .note-illustration { grid-column: 1; grid-row: 1 / span 2; width: 170px; height: 130px; margin: 0; transform: scale(.72); transform-origin: center left; }
  .intro-content h1 { grid-column: 2; grid-row: 1; margin: 0 0 6px; font-size: clamp(23px, 5vw, 31px); }
  .intro-content__description { grid-column: 2; grid-row: 2; font-size: 11px; }
  .features { grid-column: 1 / -1; gap: 22px; margin: 6px 0 0; }
  .intro-panel__footer { display: none; }
  .form-panel { min-height: 490px; padding: 50px 22px; }
  .theme-toggle { top: 13px; right: 14px; }
}

@media (max-width: 430px) {
  .intro-panel { min-height: 270px; padding: 18px 20px; }
  .intro-content { grid-template-columns: 112px 1fr; column-gap: 7px; }
  .note-illustration { margin-left: -2px; transform: scale(.56); }
  .intro-content h1 { font-size: 23px; }
  .intro-content__description { font-size: 10px; }
  .desktop-break { display: none; }
  .features { justify-content: space-between; gap: 8px; }
  .feature { gap: 5px; }
  .feature__icon { width: 25px; height: 25px; }
  .feature strong { font-size: 8px; }
  .feature small { font-size: 7px; }
  .form-panel { min-height: 460px; padding: 40px 16px; }
  .login-card { padding: 27px 22px 24px; }
}

@media (max-height: 720px) and (min-width: 761px) {
  .login-page { padding: 20px; }
  .login-shell { min-height: min(610px, calc(100vh - 40px)); }
  .intro-content { padding: 8px 0; }
  .note-illustration { transform: scale(.85); transform-origin: bottom left; margin-bottom: 0; }
  .login-card { padding-top: 25px; padding-bottom: 23px; }
  .form-heading { margin: 13px 0 17px; }
  .login-form { gap: 13px; }
}

.login-page {
  width: 100%;
  padding: 0;
  background: var(--form-bg);
}

.login-shell {
  grid-template-columns: minmax(0, .78fr) minmax(0, 1fr);
  width: 100%;
  min-height: 100vh;
  border-radius: 0;
  box-shadow: none;
}

.intro-panel {
  padding: 32px clamp(28px, 4vw, 52px) 22px;
  background:
    radial-gradient(ellipse at 5% 87%, #ffffff55 0 2px, transparent 3px),
    radial-gradient(ellipse at 83% 74%, #ffffff45 0 6px, transparent 7px),
    linear-gradient(180deg, #dceeff 0%, #cee7ff 38%, #82baff 67%, #2473f0 100%);
  color: #132342;
}

.intro-panel::before {
  right: -120px;
  bottom: -146px;
  width: 470px;
  height: 235px;
  border: 0;
  background: #1b63e7a3;
}

.intro-panel::after {
  right: -195px;
  bottom: -176px;
  width: 500px;
  height: 230px;
  border: 0;
  background: #1454d9a3;
}

.brand { color: #142441; }
.brand__copy strong { color: #17243d; }
.brand__copy small { color: #617795; }
.brand__mark { border-radius: 11px; box-shadow: 0 6px 15px #1764f94a; }

.intro-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 34px 0 auto;
  padding: 0 0 12px;
}

.intro-content h1 {
  order: 1;
  margin: 0 0 9px;
  color: #17243d;
  font-size: clamp(29px, 3vw, 37px);
  line-height: 1.08;
}

.intro-content h1 span { color: #1764f9; }
.intro-content__description { order: 2; color: #536986; font-size: 12px; line-height: 1.55; }
.features { order: 3; gap: 13px; margin-top: 20px; }
.feature__icon { background: #1764f9; color: white; box-shadow: 0 4px 9px #155dde35; }
.feature strong { color: #15233d; font-size: 9px; }
.feature small { color: #506887; font-size: 8px; }

.note-illustration {
  order: 4;
  width: 100%;
  max-width: 290px;
  height: 183px;
  margin: auto 0 2px;
}

.note-illustration::before {
  top: 32px;
  left: 30px;
  width: 213px;
  height: 135px;
  background: #8cc4ff54;
}

.paper-plane { top: 5px; left: 20px; color: #fff; }
.orbit--one { top: 16px; left: 9px; width: 229px; height: 164px; border-color: #ffffff66; }
.back-note { top: 39px; left: 136px; width: 102px; height: 112px; background: linear-gradient(150deg, #73a8ff, #3977e7); }
.front-note { top: 65px; left: 57px; width: 137px; height: 112px; }
.front-note__line { background: #367cff; }
.leaf--one { left: 26px; bottom: 1px; background: #23d2a2; }
.leaf--two { left: 43px; bottom: 1px; background: #47ddb0; }
.pencil-badge { top: 124px; left: 165px; }

.intro-panel__footer {
  z-index: 2;
  align-items: center;
  height: auto;
  min-height: 19px;
  color: #eaf3ff;
  font-size: 8px;
}

.intro-panel__footer span:first-child {
  width: auto;
  border: 0;
  font-style: italic;
}

.intro-panel__footer i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ffffffa8;
}

.intro-panel__footer i:first-of-type { margin-left: auto; }
.intro-panel__footer i + i { margin-left: 4px; }

.form-panel {
  padding: 68px clamp(24px, 5vw, 60px) 48px;
  background: radial-gradient(ellipse at 50% 42%, #fff 0%, #f8fbff 68%, #eef5ff 100%);
}

.login-page--dark .form-panel { background: radial-gradient(ellipse at 50% 42%, #23334b 0%, #172438 70%, #111a29 100%); }
.theme-toggle { top: 18px; right: 18px; }
.login-card { width: min(100%, 350px); padding: 27px 24px 25px; border-radius: 13px; box-shadow: 0 14px 38px #43618a1c; }
.login-page--dark .login-card { box-shadow: 0 14px 38px #0003; }
.card-brand .brand__mark { width: 43px; height: 43px; border-radius: 12px; font-size: 23px; }
.form-heading { margin: 14px 0 22px; }
.form-heading h2 { font-size: 23px; }
.form-heading p { font-size: 10px; }
.login-form { gap: 15px; }
.form-field { gap: 6px; }
.form-field label { font-size: 9px; }
.input-wrap { min-height: 38px; border-radius: 7px; }
.input-wrap input { font-size: 9px; }
.password-toggle { display: grid; width: 25px; height: 25px; place-items: center; padding: 4px; }
.password-toggle svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.submit-button { min-height: 39px; border-radius: 7px; }
.register-prompt { margin-top: 20px; font-size: 9px; }
.form-message { font-size: 10px; }
.login-page :is(button, a):focus-visible {
  outline: 3px solid #4382ff9c;
  outline-offset: 3px;
}

.login-page .input-wrap input:focus-visible { outline: none; }

@media (max-width: 760px) {
  .login-page { padding: 0; }
  .login-shell { grid-template-columns: 1fr; min-height: 100vh; border-radius: 0; }
  .intro-panel { min-height: 390px; padding: 22px 28px 16px; }
  .brand__mark { width: 38px; height: 38px; }
  .intro-content {
    display: flex;
    width: 100%;
    margin: 24px 0 auto;
    padding: 0;
  }
  .intro-content h1 { order: 1; margin: 0 0 7px; font-size: clamp(27px, 6vw, 34px); }
  .intro-content__description { order: 2; font-size: 11px; }
  .features { order: 3; gap: 20px; margin-top: 14px; }
  .note-illustration {
    order: 4;
    align-self: center;
    width: 275px;
    height: 151px;
    margin: 4px 0 0;
    transform: scale(.78);
    transform-origin: center top;
  }
  .front-note { top: 47px; }
  .back-note { top: 24px; }
  .pencil-badge { top: 108px; }
  .intro-panel__footer { display: flex; }
  .form-panel { min-height: 480px; padding: 56px 22px 38px; }
  .login-card { width: min(100%, 390px); padding: 28px 28px 26px; }
  .theme-toggle { top: 14px; right: 14px; }
}

@media (max-width: 430px) {
  .intro-panel { min-height: 365px; padding: 18px 21px 14px; }
  .intro-content { margin-top: 21px; }
  .intro-content h1 { font-size: 27px; }
  .features { gap: 13px; }
  .note-illustration { margin-top: 0; transform: scale(.68); }
  .form-panel { min-height: 460px; padding: 49px 16px 30px; }
  .login-card { padding: 25px 22px 23px; }
}

@media (max-width: 350px) {
  .intro-panel { min-height: 345px; padding-right: 17px; padding-left: 17px; }
  .intro-content h1 { font-size: 25px; }
  .intro-content__description { font-size: 10px; }
  .features { gap: 9px; }
  .feature { gap: 5px; }
  .feature__icon { width: 25px; height: 25px; }
  .note-illustration { transform: scale(.6); }
}

@media (max-width: 760px) {
  .login-page { padding: 0; }
  .login-shell { grid-template-columns: 1fr; width: 100%; min-height: 100vh; border-radius: 0; }
  .intro-panel { min-height: 390px; padding: 22px 28px 16px; }
  .intro-content { margin: 24px 0 auto; padding: 0; }
  .intro-content h1 { font-size: clamp(27px, 6vw, 34px); }
  .intro-content__description { font-size: 11px; }
  .features { gap: 20px; margin-top: 14px; }
  .note-illustration { align-self: center; width: 275px; height: 151px; margin: 4px 0 0; transform: scale(.78); transform-origin: center top; }
  .front-note { top: 47px; }
  .back-note { top: 24px; }
  .pencil-badge { top: 108px; }
  .intro-panel__footer { display: flex; }
  .form-panel { min-height: 480px; padding: 56px 22px 38px; }
  .login-card { width: min(100%, 390px); padding: 28px 28px 26px; }
  .theme-toggle { top: 14px; right: 14px; }
}

@media (max-width: 430px) {
  .intro-panel { min-height: 365px; padding: 18px 21px 14px; }
  .intro-content { margin-top: 21px; }
  .intro-content h1 { font-size: 27px; }
  .features { gap: 13px; }
  .note-illustration { margin-top: 0; transform: scale(.68); }
  .form-panel { min-height: 460px; padding: 49px 16px 30px; }
  .login-card { padding: 25px 22px 23px; }
}

@media (max-width: 350px) {
  .intro-panel { min-height: 345px; padding-right: 17px; padding-left: 17px; }
  .intro-content h1 { font-size: 25px; }
  .intro-content__description { font-size: 10px; }
  .features { gap: 9px; }
  .feature { gap: 5px; }
  .feature__icon { width: 25px; height: 25px; }
  .note-illustration { transform: scale(.6); }
}

@media (max-height: 720px) and (min-width: 761px) {
  .login-page { padding: 0; }
  .login-shell { min-height: 100vh; }
}

.login-card {
  display: flex;
  flex-direction: column;
  width: min(100%, 445px);
  min-height: 523px;
  padding: 28px;
  border: 1px solid #edf1f7;
  border-radius: 17px;
}

.login-page--dark .login-card { border-color: #2d3b50; }
.form-heading { margin: 15px 0 24px; }
.form-heading h2 { font-size: 27px; letter-spacing: -.8px; }
.form-heading p { margin-top: 8px; font-size: 13px; }
.login-form { gap: 16px; }
.form-field { gap: 8px; }
.form-field label { font-size: 12px; }
.input-wrap { min-height: 44px; padding: 0 12px; border-radius: 9px; }
.input-wrap input { padding: 10px 0; font-size: 12px; }
.submit-button { min-height: 47px; margin-top: 1px; border-radius: 9px; font-size: 13px; }
.register-prompt { margin-top: auto; padding-top: 22px; font-size: 12px; }

@media (max-width: 760px) {
  .login-card { width: min(100%, 445px); min-height: 0; padding: 26px 28px 22px; }
  .register-prompt { margin-top: 22px; padding-top: 0; }
}

@media (max-width: 430px) {
  .login-card { padding: 24px 22px 20px; }
}

@media (min-width: 761px) {
  .intro-panel { padding: 38px clamp(34px, 5.9vw, 82px) 26px; }
  .intro-content { margin: 42px 0 0; }
  .intro-content h1 {
    margin-bottom: 12px;
    font-size: clamp(36px, 4vw, 48px);
    letter-spacing: -1.5px;
    line-height: 1.04;
  }
  .intro-content__description { color: #536986; font-size: 16px; line-height: 1.55; }
  .features { display: grid; gap: 13px; margin-top: 22px; }
  .feature { gap: 12px; }
  .feature__icon { width: 44px; height: 44px; border-radius: 11px; background: #1764f9; box-shadow: 0 4px 9px #155dde35; }
  .feature:nth-child(3) .feature__icon { background: #6948f5; }
  .feature__icon svg { width: 21px; height: 21px; }
  .feature strong { color: #15233d; font-size: 14px; }
  .feature small { color: #506887; font-size: 12px; }
  .note-illustration {
    align-self: center;
    width: 290px;
    max-width: 100%;
    height: 183px;
    margin: auto 0 0;
    transform: scale(1.3);
    transform-origin: center bottom;
  }
  .note-illustration::before { top: 32px; left: 30px; width: 213px; height: 135px; background: #8cc4ff54; }
  .paper-plane { top: 5px; left: 20px; color: #fff; }
  .orbit--one { top: 16px; left: 9px; width: 229px; height: 164px; border-color: #ffffff66; }
  .back-note { top: 39px; left: 136px; width: 102px; height: 112px; background: linear-gradient(150deg, #73a8ff, #3977e7); }
  .front-note { top: 65px; left: 57px; width: 137px; height: 112px; }
  .front-note__line { background: #367cff; }
  .leaf--two { left: 43px; bottom: 1px; background: #47ddb0; }
  .pencil-badge { top: 124px; left: 165px; }
  .intro-panel__footer { align-items: center; height: auto; min-height: 28px; color: #eaf3ff; font-size: 12px; }
  .intro-panel__footer span:first-child { width: auto; border: 0; font-style: italic; }
  .intro-panel__footer i { width: 4px; height: 4px; border-radius: 50%; background: #ffffffa8; }
  .intro-panel__footer i:first-of-type { margin-left: auto; }
  .intro-panel__footer i + i { margin-left: 4px; }
}

@media (max-width: 760px) {
  .intro-panel { min-height: 470px; padding: 25px 30px 18px; }
  .intro-content { margin: 23px 0 auto; padding: 0; }
  .intro-content h1 { margin: 0 0 9px; font-size: clamp(33px, 7vw, 43px); letter-spacing: -1.5px; line-height: 1.04; }
  .intro-content__description { font-size: 13px; }
  .features { display: grid; gap: 10px; margin-top: 16px; }
  .feature { gap: 12px; }
  .feature__icon { width: 36px; height: 36px; border-radius: 9px; }
  .feature__icon svg { width: 18px; height: 18px; }
  .feature strong { font-size: 11px; }
  .feature small { font-size: 9px; }
  .note-illustration { align-self: flex-end; width: 250px; height: 155px; margin: auto 0 -5px; transform: scale(.9); transform-origin: right bottom; }
}

@media (max-width: 430px) {
  .intro-panel { min-height: 430px; padding: 18px 21px 14px; }
  .intro-content { margin-top: 17px; }
  .intro-content h1 { font-size: 32px; }
  .intro-content__description { font-size: 11px; }
  .features { gap: 9px; margin-top: 14px; }
  .note-illustration { margin-top: auto; transform: scale(.75); }
}

@media (max-width: 350px) {
  .intro-panel { min-height: 410px; padding-right: 17px; padding-left: 17px; }
  .intro-content h1 { font-size: 29px; }
  .features { gap: 8px; }
  .feature { gap: 5px; }
  .feature__icon { width: 25px; height: 25px; }
  .note-illustration { transform: scale(.64); }
}
</style>
