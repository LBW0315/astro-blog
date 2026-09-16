/*
  画面の動きをつける JavaScript（すべてのページで読み込まれる）

  Astro のページ遷移（ClientRouter）では、ページが切り替わってもこのファイルは
  最初の1回しか実行されません。そのため、
  ・クリックやスクロールの監視は「最初に1回だけ」登録する
  ・ページごとに必要な準備は `astro:page-load`（ページ表示のたび）で行う
  という2段構えにしています。
*/

// 「動きを減らす」設定が有効かどうか
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// 画面読み上げに短いメッセージを伝える
function announce(message: string) {
	const status = document.getElementById('sr-status');
	if (!status) return;
	status.textContent = '';
	// 同じ文言でも読み上げられるよう、少し待ってから入れる
	setTimeout(() => (status.textContent = message), 50);
}

/* =====================================================
   1. テーマ切り替えボタン
   ===================================================== */
function syncThemeButton() {
	const isDark = document.documentElement.dataset.theme === 'dark';
	document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
		btn.setAttribute('aria-pressed', String(isDark));
	});
}

document.addEventListener('click', (event) => {
	const btn = (event.target as Element).closest('[data-theme-toggle]');
	if (!btn) return;
	const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
	document.documentElement.dataset.theme = next;
	try {
		localStorage.setItem('theme', next);
	} catch {
		/* 保存できない環境（プライベートモードなど）では、今のページだけ切り替える */
	}
	syncThemeButton();
});

/* =====================================================
   2. コードのコピーボタン
   ===================================================== */
document.addEventListener('click', async (event) => {
	const btn = (event.target as Element).closest<HTMLButtonElement>('[data-copy]');
	if (!btn) return;
	const code = btn.closest('.code-block')?.querySelector('pre code');
	const label = btn.querySelector('.code-block__copy-label');
	if (!code || !label) return;

	let ok = true;
	try {
		await navigator.clipboard.writeText(code.textContent ?? '');
	} catch {
		ok = false;
	}

	// 見た目（色・アイコン・文字）と、画面読み上げの両方で結果を伝える
	btn.dataset.state = ok ? 'done' : 'error';
	label.textContent = ok ? 'コピーしました' : 'コピーできませんでした';
	announce(label.textContent);

	// 少し経ったら元に戻す
	clearTimeout(Number(btn.dataset.timer));
	btn.dataset.timer = String(
		setTimeout(() => {
			delete btn.dataset.state;
			label.textContent = 'コピー';
		}, 1800),
	);
});

/* =====================================================
   3. スクロールで「ふわっと」表示
   ===================================================== */
let revealObserver: IntersectionObserver | undefined;

function initReveal() {
	revealObserver?.disconnect();
	const targets = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)');

	// 動きを減らす設定、または古いブラウザでは、すぐに全部表示する
	if (reduceMotion() || !('IntersectionObserver' in window)) {
		targets.forEach((el) => el.classList.add('is-visible'));
		return;
	}

	revealObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('is-visible');
				revealObserver?.unobserve(entry.target); // 一度表示したら監視をやめる
			}
		},
		// 画面の下から少し入ったところで表示を始める
		{ rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
	);
	targets.forEach((el) => revealObserver!.observe(el));
}

/* =====================================================
   4. スクロールに合わせて動くもの
      ・読了進捗バー
      ・目次の現在地ハイライト
      ・「先頭へ戻る」ボタンの表示
   スクロールのたびに毎回計算すると重いので、1フレームに1回だけ計算する
   ===================================================== */
let progressBar: HTMLElement | null = null;
let article: HTMLElement | null = null;
let headings: HTMLElement[] = [];
let tocLinks: HTMLAnchorElement[] = [];
let backToTop: HTMLElement | null = null;
let ticking = false;

function updateOnScroll() {
	ticking = false;
	const y = window.scrollY;

	// 読了進捗バー：記事の始まり〜終わりを 0〜1 に
	if (progressBar && article) {
		const rect = article.getBoundingClientRect();
		const total = rect.height - window.innerHeight;
		const ratio = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
		progressBar.style.transform = `scaleX(${ratio})`;
	}

	// 目次：画面の上から 30% の位置より上にある、最後の見出しを「今ここ」にする
	if (headings.length && tocLinks.length) {
		const line = window.innerHeight * 0.3;
		let current: string | null = null;
		for (const h of headings) {
			if (h.getBoundingClientRect().top <= line) current = h.id;
			else break;
		}
		for (const link of tocLinks) {
			const active = link.hash === `#${current}`;
			if (active) link.setAttribute('aria-current', 'true');
			else link.removeAttribute('aria-current');
		}
	}

	// 先頭へ戻るボタン：画面1つ分ほどスクロールしたら表示
	backToTop?.classList.toggle('is-shown', y > window.innerHeight * 0.8);
}

function requestUpdate() {
	if (ticking) return;
	ticking = true;
	requestAnimationFrame(updateOnScroll);
}

window.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', requestUpdate, { passive: true });

function initScrollTargets() {
	progressBar = document.querySelector('[data-progress-bar]');
	article = document.querySelector('[data-article]');
	tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
	const ids = new Set(tocLinks.map((a) => decodeURIComponent(a.hash.slice(1))));
	headings = [...document.querySelectorAll<HTMLElement>('.prose :is(h2, h3)[id]')].filter((h) =>
		ids.has(h.id),
	);
	backToTop = document.querySelector('[data-back-to-top]');
	updateOnScroll();
}

/* =====================================================
   5. 先頭へ戻るボタン
   ===================================================== */
document.addEventListener('click', (event) => {
	const btn = (event.target as Element).closest('[data-back-to-top]');
	if (!btn) return;
	window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
	// キーボード操作の人が迷子にならないよう、フォーカスをページの先頭へ移す
	document.querySelector<HTMLElement>('.skip-link')?.focus({ preventScroll: true });
});

/* =====================================================
   ページが表示されるたびに実行
   ===================================================== */
document.addEventListener('astro:page-load', () => {
	syncThemeButton();
	initReveal();
	initScrollTargets();
});
