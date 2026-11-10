// Shown by the server when a page cannot be rendered at all: same look as the in-app error screen, no scripts needed
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>دلّني | حاول مجدداً</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/logo.png" type="image/png" />
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #F7F5F0; color: #0B1B2B; font: 15px/1.6 "Cairo", "Segoe UI", Tahoma, sans-serif; overflow: hidden; }
      .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 48px 16px; }
      .blob { position: fixed; border-radius: 50%; pointer-events: none; }
      .blob.a { width: 480px; height: 480px; top: -160px; right: -130px; background: radial-gradient(circle, rgba(0,115,111,.14), transparent 65%); }
      .blob.b { width: 520px; height: 520px; bottom: -190px; left: -130px; background: radial-gradient(circle, rgba(217,107,39,.12), transparent 65%); }
      .wrap { position: relative; width: 100%; max-width: 380px; text-align: center; }
      .logo { height: 112px; display: block; margin: 0 auto; }
      .card { margin-top: 0; background: #fff; border-radius: 28px; padding: 32px 32px 40px; box-shadow: 0 0 0 1px rgba(0,0,0,.05), 0 24px 60px -28px rgba(11,27,43,.25); }
      .icon { width: 64px; height: 64px; margin: 0 auto; border-radius: 16px; background: #FFF2E8; color: #D2621F; display: grid; place-items: center; }
      .eyebrow { margin: 20px 0 0; font-size: 12px; font-weight: 700; color: #00736F; }
      h1 { margin: 16px 0 0; font-size: 22px; line-height: 1.35; font-weight: 800; }
      p.body { margin: 12px auto 0; max-width: 340px; color: #5B6B70; }
      .actions { margin-top: 28px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
      .quiet { font-size: 13.5px; font-weight: 600; color: #5B6B70; text-decoration: none; }
      .quiet:hover { color: #00736F; }
      .btn { height: 48px; min-width: 220px; padding: 0 28px; border-radius: 999px; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center; text-decoration: none; border: 0; transition: background-color .15s, transform .1s; }
      .btn:active { transform: scale(.97); }
      .primary { background: #00736F; color: #fff; }
      .primary:hover { background: #0B4F57; }
      .secondary { background: #fff; color: #0B1B2B; box-shadow: 0 0 0 1px rgba(0,0,0,.1); }
      .secondary:hover { background: #F7F5F0; }
      .foot { margin-top: 24px; font-size: 12.5px; color: #8A9599; }
    </style>
  </head>
  <body>
    <div class="blob a"></div><div class="blob b"></div>
    <div class="page"><div class="wrap">
      <div class="card">
        <img class="logo" src="/logo.png" alt="دلّني" />
        <h1>حدث خطأ، حاول مجدداً</h1>
        <div class="actions">
          <button class="btn primary" onclick="location.reload()">إعادة تحميل الصفحة</button>
          <a class="quiet" href="/">العودة إلى الرئيسية</a>
        </div>
      </div>
    </div></div>
  </body>
</html>`;
}
