import Vitra, { theme, drawer, destroyAll } from 'vitra-css';
import type { ThemeOptions } from 'vitra-css';

const opts: ThemeOptions = { default: 'dark', persist: false };
theme.init(opts);
theme.set('dark');
drawer.open('#x');
Vitra.toast.show('x', { type: 'warning' });
Vitra.theme.toggle();
destroyAll();

// @ts-expect-error unknown module must not type-check
Vitra.nope;
