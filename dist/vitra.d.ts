/**
 * Vitra CSS Framework - TypeScript Definitions
 */

export interface ThemeOptions {
  defaultTheme?: string;
  /** Alias of defaultTheme (the key data-config uses). */
  default?: string;
  persist?: boolean;
  transition?: boolean;
}

export interface ThemeSetOptions {
  transition?: boolean;
  origin?: MouseEvent | Element | { x: number; y: number };
}

export interface ThemeModule {
  get(): string;
  set(themeName: string, options?: ThemeSetOptions): boolean;
  toggle(options?: ThemeSetOptions): string;
  init(options?: ThemeOptions): string;
  getEffective(): string;
  clear(): void;
  getValidThemes(): string[];
}

export interface ParticleOptions {
  color?: string;
  size?: number;
  emoji?: string | null;
  container?: string | Element;
  direction?: string | number | null;
}

export interface ParticleLimits {
  max: number;
  active: number;
  available: number;
}

export interface ParticlesModule {
  spawn(count: number, options?: ParticleOptions): number;
  destroy(count?: number | null): number;
  limits(): ParticleLimits;
  init(): void;
}

export interface RevealOptions {
  selector?: string;
  threshold?: number;
  stagger?: number;
  rootMargin?: string;
  scrollReveal?: boolean;
}

export interface RevealModule {
  init(options?: RevealOptions): void;
  count(): number;
  reset(): void;
  destroy(): void;
}

export interface ModalOptions {
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
}

export interface ModalModule {
  open(target: string | HTMLElement, options?: ModalOptions): boolean;
  close(): void;
  destroy(): void;
}

export interface DrawerModule {
  open(target: string | HTMLElement): boolean;
  close(target?: string | HTMLElement): void;
  toggle(target: string | HTMLElement): boolean;
  init(): void;
  destroy(): void;
}

export interface TooltipOptions {
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export interface TooltipModule {
  show(target: string | HTMLElement, text: string, options?: TooltipOptions): boolean;
  hide(target?: string | HTMLElement | null): void;
  init(): void;
  destroy(): void;
}

export interface ToastOptions {
  type?: 'success' | 'error' | 'info' | 'warning' | 'default';
  duration?: number;
  /** Show a close button. Always shown when duration is 0. */
  closable?: boolean;
}

export interface ToastModule {
  init(): void;
  show(message: string, options?: ToastOptions): HTMLElement;
  destroy(): void;
}

export interface RippleModule {
  init(): void;
  destroy(): void;
}

export interface DropdownModule {
  init(): void;
  destroy(): void;
}

export interface SpotlightModule {
  init(): void;
  destroy(): void;
}

export interface SceneryOptions {
  inline?: boolean;
  moon?: 'full' | 'crescent';
}

export interface SceneryModule {
  init(): number;
  mount(target: string | HTMLElement, options?: SceneryOptions): HTMLElement | null;
  destroy(): void;
}

export interface MotionGuardModule {
  init(): void;
  observe(el: Element): void;
  destroy(): void;
}

export interface VitraInstance {
  theme: ThemeModule;
  particles: ParticlesModule;
  reveal: RevealModule;
  ripple: RippleModule;
  modal: ModalModule;
  drawer: DrawerModule;
  tooltip: TooltipModule;
  toast: ToastModule;
  dropdown: DropdownModule;
  spotlight: SpotlightModule;
  scenery: SceneryModule;
  motionGuard: MotionGuardModule;
  destroyAll(): void;
}

export const theme: ThemeModule;
export const particles: ParticlesModule;
export const reveal: RevealModule;
export const ripple: RippleModule;
export const modal: ModalModule;
export const drawer: DrawerModule;
export const tooltip: TooltipModule;
export const toast: ToastModule;
export const dropdown: DropdownModule;
export const spotlight: SpotlightModule;
export const scenery: SceneryModule;
export const motionGuard: MotionGuardModule;
export function destroyAll(): void;

declare const Vitra: VitraInstance;
export default Vitra;

export as namespace Vitra;
