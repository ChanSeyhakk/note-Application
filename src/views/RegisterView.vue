<template>
  <main class="auth-page" :class="{ 'auth-page--dark': isDark }">
    <section class="auth-shell" aria-label="Create a NoteMe account">
      <aside class="intro-panel">
        <a class="brand" href="#/register" aria-label="NoteMe home">
          <span class="brand__mark"><img :src="logoUrl" alt="" /></span>
          <span class="brand__copy">
            <strong>NoteMe</strong>
            <small>Your personal notes</small>
          </span>
        </a>

        <div class="intro-content">
          <h1>Make room for<br /><span>your ideas.</span></h1>
          <p class="intro-description">
            Create your free account and keep<br class="desktop-break" />
            your thoughts organized in one place.
          </p>

          <div class="features">
            <div class="feature">
              <span class="feature__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z" /></svg>
              </span>
              <span><strong>Write</strong><small>Capture ideas</small></span>
            </div>
            <div class="feature">
              <span class="feature__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3z" /></svg>
              </span>
              <span><strong>Organize</strong><small>Keep it simple</small></span>
            </div>
            <div class="feature">
              <span class="feature__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
              </span>
              <span><strong>Find</strong><small>Search anytime</small></span>
            </div>
          </div>

          <div class="note-illustration" aria-hidden="true">
            <span class="paper-plane">➤</span>
            <span class="orbit"></span>
            <span class="leaf leaf--one"></span>
            <span class="leaf leaf--two"></span>
            <div class="back-note"><i></i><i></i><i></i></div>
            <div class="front-note">
              <span class="front-note__line front-note__line--short"></span>
              <span class="front-note__line"></span>
              <span class="front-note__line front-note__line--medium"></span>
            </div>
            <span class="pencil-badge">
              <svg viewBox="0 0 24 24"><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z" /></svg>
            </span>
          </div>
        </div>

        <div class="intro-footer">
          <span>“A small note today can be a big idea tomorrow.”</span>
          <span class="footer-dots"><i></i><i></i><i></i></span>
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

        <div class="register-card">
          <div class="card-brand" aria-label="NoteMe">
            <span class="brand__mark"><img :src="logoUrl" alt="" /></span>
          </div>

          <header class="form-heading">
            <h2>Create your account</h2>
            <p>Start organizing your ideas with <strong>NoteMe</strong></p>
          </header>

          <div v-if="errorMessage" class="form-message form-message--error" role="alert">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="form-message form-message--success" role="status">
            {{ successMessage }}
          </div>

          <form class="register-form" @submit.prevent="register">
            <div class="form-field">
              <label for="username">Username</label>
              <div class="input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  autocomplete="username"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

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
                  autocomplete="new-password"
                  placeholder="Create a password"
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
              {{ loading ? "Creating account..." : "Create account" }}
              <svg v-if="!loading" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </button>
          </form>

          <p class="login-prompt">
            Already have an account?
            <button type="button" @click="goLogin">Sign in</button>
          </p>
          <p class="copyright">© {{ new Date().getFullYear() }} NoteMe. Keep your ideas organized.</p>
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

const username = ref("");
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

const register = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!username.value.trim()) {
    errorMessage.value = "Please enter a username.";
    return;
  }

  if (!email.value.trim()) {
    errorMessage.value = "Please enter your email.";
    return;
  }

  if (!password.value) {
    errorMessage.value = "Please enter a password.";
    return;
  }

  loading.value = true;

  try {
    await api.post("/Auth/register", {
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
    });

    successMessage.value =
      "Account created successfully. Redirecting to login...";
    username.value = "";
    email.value = "";
    password.value = "";

    setTimeout(() => {
      router.push("/login");
    }, 700);
  } catch (error: any) {
    console.error(error);
    errorMessage.value =
      error?.response?.data?.message || "Failed to create account.";
  } finally {
    loading.value = false;
  }
};

const goLogin = () => router.push("/login");

onMounted(loadTheme);
</script>

<style scoped>
.auth-page {
  --card-bg: #fff;
  --ink: #17243a;
  --muted: #8593a9;
  --line: #e6edf6;
  display: grid;
  width: 100%;
  min-height: 100vh;
  place-items: center;
  padding: 0;
  background: #f3f7fc;
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.auth-page--dark {
  --card-bg: #1c293b;
  --ink: #edf3ff;
  --muted: #9ba9bd;
  --line: #314157;
}

.auth-shell {
  display: grid;
  grid-template-columns: minmax(0, .78fr) minmax(0, 1fr);
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  border-radius: 0;
  background: #f3f7fc;
}

.intro-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 38px clamp(34px, 5.9vw, 82px) 26px;
  background:
    radial-gradient(ellipse at 5% 87%, #ffffff55 0 2px, transparent 3px),
    radial-gradient(ellipse at 83% 74%, #ffffff45 0 6px, transparent 7px),
    linear-gradient(180deg, #dceeff 0%, #cee7ff 38%, #82baff 67%, #2473f0 100%);
  color: #132342;
}

.intro-panel::before, .intro-panel::after {
  position: absolute;
  right: -120px;
  bottom: -146px;
  width: 470px;
  height: 235px;
  border-radius: 50%;
  background: #1b63e7a3;
  content: "";
  transform: rotate(-19deg);
}

.intro-panel::after { right: -195px; bottom: -176px; width: 500px; height: 230px; background: #1454d9a3; }
.brand { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 12px; align-self: flex-start; color: #142441; text-decoration: none; }
.brand__mark { display: block; width: 43px; height: 43px; flex: 0 0 auto; overflow: hidden; border-radius: 12px; background: #fff; box-shadow: 0 7px 19px #0055ef50; }
.brand__mark img { display: block; width: 100%; height: 100%; object-fit: cover; transform: scale(1.2); }
.brand__copy { display: grid; gap: 3px; }
.brand__copy strong { color: #17243d; font-size: 16px; line-height: 1.1; letter-spacing: -.2px; }
.brand__copy small { color: #617795; font-size: 10px; }
.intro-content { position: relative; z-index: 1; display: flex; flex: 1; flex-direction: column; width: 100%; margin: 42px 0 0; }
.intro-content h1 { margin: 0 0 12px; color: #17243d; font-size: clamp(36px, 4vw, 48px); font-weight: 780; letter-spacing: -1.5px; line-height: 1.04; }
.intro-content h1 span { color: #1764f9; }
.intro-description { margin: 0; color: #536986; font-size: 16px; line-height: 1.55; }
.features { display: grid; gap: 13px; margin-top: 22px; }
.feature { display: flex; align-items: center; gap: 12px; }
.feature__icon { display: grid; width: 44px; height: 44px; flex: 0 0 auto; place-items: center; border-radius: 11px; background: #1764f9; color: #fff; box-shadow: 0 4px 9px #155dde35; }
.feature:nth-child(3) .feature__icon { background: #6948f5; }
.feature__icon svg { width: 21px; height: 21px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.feature > span:last-child { display: grid; gap: 2px; }
.feature strong { color: #15233d; font-size: 14px; }
.feature small { color: #506887; font-size: 12px; white-space: nowrap; }
.note-illustration { position: relative; align-self: center; width: 290px; max-width: 100%; height: 183px; margin: auto 0 0; transform: scale(1.3); transform-origin: center bottom; }
.note-illustration::before { position: absolute; top: 32px; left: 30px; width: 213px; height: 135px; border-radius: 50%; background: #8cc4ff54; content: ""; transform: rotate(-16deg); }
.paper-plane { position: absolute; z-index: 2; top: 5px; left: 20px; color: #fff; font-size: 30px; transform: rotate(-28deg); text-shadow: 0 5px 14px #3e85ff7a; }
.orbit { position: absolute; z-index: 1; top: 16px; left: 9px; width: 229px; height: 164px; border: 1px dashed #ffffff66; border-radius: 50%; transform: rotate(-34deg); }
.back-note { position: absolute; z-index: 2; top: 39px; left: 136px; display: grid; gap: 11px; width: 102px; height: 112px; padding: 22px 15px; border-radius: 8px; background: linear-gradient(150deg, #73a8ff, #3977e7); box-shadow: 0 12px 25px #06163535; transform: rotate(10deg); }
.back-note i { height: 6px; border-radius: 5px; background: #a5c1ee; }
.back-note i:nth-child(2) { width: 75%; }
.back-note i:nth-child(3) { width: 55%; }
.front-note { position: absolute; z-index: 3; top: 65px; left: 57px; display: flex; flex-direction: column; gap: 13px; width: 137px; height: 112px; padding: 21px 15px; border-radius: 11px; background: #f8fbff; box-shadow: 0 13px 29px #06163535; transform: rotate(-8deg); }
.front-note__line { display: block; width: 88px; height: 7px; border-radius: 8px; background: #367cff; }
.front-note__line--short { width: 17px; height: 12px; border-radius: 4px; background: #a9caff; }
.front-note__line--medium { width: 67px; }
.leaf { position: absolute; z-index: 2; bottom: 4px; left: 15px; width: 25px; height: 49px; border-radius: 100% 0 100% 0; background: #19c59a; transform: rotate(-34deg); }
.leaf--one { left: 26px; bottom: 1px; background: #23d2a2; }
.leaf--two { left: 43px; bottom: 1px; width: 21px; height: 41px; background: #47ddb0; transform: rotate(20deg); }
.pencil-badge { position: absolute; z-index: 4; top: 124px; left: 165px; display: grid; width: 39px; height: 39px; place-items: center; border: 2px solid #fff; border-radius: 50%; background: #3482ff; color: #fff; box-shadow: 0 5px 14px #071a3d45; }
.pencil-badge svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.intro-footer { position: relative; z-index: 2; display: flex; align-items: center; gap: 10px; min-height: 28px; color: #eaf3ff; font-size: 12px; }
.footer-dots { display: flex; gap: 4px; margin-left: auto; }
.footer-dots i { width: 4px; height: 4px; border-radius: 50%; background: #ffffffa8; }

.form-panel { position: relative; display: grid; min-width: 0; place-items: center; padding: 72px clamp(30px, 5vw, 74px) 42px; background: radial-gradient(ellipse at 50% 42%, #fff 0%, #f8fbff 68%, #eef5ff 100%); }
.auth-page--dark .form-panel { background: radial-gradient(ellipse at 50% 42%, #23334b 0%, #172438 70%, #111a29 100%); }
.theme-toggle { position: absolute; top: 18px; right: 18px; display: flex; align-items: center; gap: 3px; padding: 4px; border: 1px solid #e3eaf3; border-radius: 18px; background: #eaf0f8; color: #5a6c84; cursor: pointer; }
.auth-page--dark .theme-toggle { border-color: #35465d; background: #24334a; color: #c2d1e7; }
.theme-toggle span { display: grid; width: 24px; height: 24px; place-items: center; border-radius: 50%; font-size: 15px; }
.theme-toggle .theme-toggle__active { background: #fff; color: #e6a526; box-shadow: 0 1px 4px #162c4c20; }
.auth-page--dark .theme-toggle .theme-toggle__active { background: #334865; color: #ffd16a; }
.register-card { width: min(100%, 445px); padding: 28px 28px 25px; border: 1px solid #edf1f7; border-radius: 17px; background: var(--card-bg); box-shadow: 0 14px 38px #43618a1c; }
.auth-page--dark .register-card { border-color: #2d3b50; box-shadow: 0 14px 38px #0003; }
.card-brand { display: flex; justify-content: center; }
.card-brand .brand__mark { width: 43px; height: 43px; border-radius: 12px; }
.form-heading { margin: 15px 0 24px; text-align: center; }
.form-heading h2 { margin: 0; color: var(--ink); font-size: 27px; font-weight: 760; letter-spacing: -.8px; }
.form-heading p { margin: 8px 0 0; color: var(--muted); font-size: 13px; }
.form-heading p strong { color: #2864e8; font-weight: 650; }
.form-message { margin: 0 0 13px; padding: 9px 11px; border: 1px solid; border-radius: 8px; font-size: 10px; line-height: 1.5; }
.form-message--error { border-color: #f1c7ca; background: #fff4f4; color: #c43e48; }
.form-message--success { border-color: #bee8d0; background: #effbf4; color: #198550; }
.register-form { display: grid; gap: 16px; }
.form-field { display: grid; gap: 8px; }
.form-field label { color: var(--ink); font-size: 12px; font-weight: 700; }
.input-wrap { display: flex; align-items: center; gap: 11px; min-height: 44px; padding: 0 12px; border: 1px solid var(--line); border-radius: 9px; background: color-mix(in srgb, #f3f7fc 64%, var(--card-bg)); transition: border-color .18s ease, box-shadow .18s ease; }
.auth-page--dark .input-wrap { background: #172438; }
.input-wrap:focus-within { border-color: #75a2ff; box-shadow: 0 0 0 3px #3478f51b; }
.input-wrap > svg { width: 14px; height: 14px; flex: 0 0 auto; fill: none; stroke: #8393aa; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.input-wrap input { width: 100%; min-width: 0; padding: 10px 0; border: 0; outline: 0; background: transparent; color: var(--ink); font: inherit; font-size: 12px; }
.input-wrap input::placeholder { color: #a3afc0; }
.password-toggle { display: grid; width: 25px; height: 25px; flex: 0 0 auto; place-items: center; padding: 4px; border: 0; background: transparent; color: #7586a0; cursor: pointer; }
.password-toggle:hover { color: #2864e8; }
.password-toggle svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.submit-button { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 47px; margin-top: 1px; border: 0; border-radius: 9px; background: linear-gradient(100deg, #1760f5, #286bfa); color: #fff; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; box-shadow: 0 6px 14px #2864e82e; transition: transform .18s ease, box-shadow .18s ease; }
.submit-button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 9px 18px #2864e845; }
.submit-button:disabled { cursor: wait; opacity: .7; }
.submit-button svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.login-prompt { margin: 22px 0 0; color: var(--muted); font-size: 12px; text-align: center; }
.login-prompt button { margin-left: 3px; padding: 0; border: 0; background: transparent; color: #1760ec; cursor: pointer; font: inherit; font-weight: 700; }
.login-prompt button:hover { color: #0d49c3; text-decoration: underline; }
.copyright { margin: 22px 0 0; color: #9aa7b9; font-size: 10px; text-align: center; }
.auth-page :is(button, a):focus-visible { outline: 3px solid #4382ff9c; outline-offset: 3px; }
.auth-page .input-wrap input:focus-visible { outline: none; }

@media (max-width: 760px) {
  .auth-page { padding: 0; }
  .auth-shell { grid-template-columns: 1fr; min-height: 100vh; border-radius: 0; }
  .intro-panel { min-height: 470px; padding: 25px 30px 18px; }
  .intro-content { margin-top: 23px; }
  .intro-content h1 { font-size: clamp(33px, 7vw, 43px); }
  .intro-description { font-size: 13px; }
  .features { gap: 10px; margin-top: 16px; }
  .feature__icon { width: 36px; height: 36px; border-radius: 9px; }
  .feature__icon svg { width: 18px; height: 18px; }
  .feature strong { font-size: 11px; }
  .feature small { font-size: 9px; }
  .note-illustration { align-self: flex-end; width: 250px; height: 155px; margin: auto 0 -5px; transform: scale(.9); transform-origin: right bottom; }
  .front-note { top: 47px; }
  .back-note { top: 24px; }
  .pencil-badge { top: 108px; }
  .form-panel { min-height: 590px; padding: 55px 22px 35px; }
  .register-card { width: min(100%, 445px); padding: 26px 28px 22px; }
  .theme-toggle { top: 14px; right: 14px; }
}

@media (max-width: 430px) {
  .intro-panel { min-height: 430px; padding: 18px 21px 14px; }
  .intro-content { margin-top: 17px; }
  .intro-content h1 { font-size: 32px; }
  .intro-description { font-size: 11px; }
  .features { gap: 9px; margin-top: 14px; }
  .note-illustration { margin-top: auto; transform: scale(.75); }
  .form-panel { min-height: 570px; padding: 49px 16px 28px; }
  .register-card { padding: 24px 22px 20px; }
}

@media (max-width: 350px) {
  .intro-panel { min-height: 410px; padding-right: 17px; padding-left: 17px; }
  .intro-content h1 { font-size: 29px; }
  .features { gap: 8px; }
  .feature { gap: 5px; }
  .feature__icon { width: 25px; height: 25px; }
  .note-illustration { transform: scale(.64); }
  .register-card { padding-right: 17px; padding-left: 17px; }
}

@media (max-height: 720px) and (min-width: 761px) {
  .auth-page { padding: 0; }
  .auth-shell { min-height: 100vh; }
  .intro-content { margin-top: 15px; }
  .note-illustration { height: 165px; transform: scale(.76); transform-origin: bottom left; }
  .register-card { padding-top: 19px; padding-bottom: 17px; }
  .form-heading { margin: 9px 0 13px; }
  .register-form { gap: 9px; }
  .input-wrap { min-height: 34px; }
  .login-prompt { margin-top: 11px; }
  .copyright { margin-top: 10px; }
}
</style>
