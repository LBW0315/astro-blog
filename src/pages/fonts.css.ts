// /fonts.css として、Web フォントの定義を配信する（src/lib/font-css.ts を参照）
import { fontCss } from '../lib/font-css';

export function GET() {
	return new Response(fontCss, { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
}
