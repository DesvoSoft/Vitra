/**
 * Vitra CSS Framework - TypeScript Definitions
 */

declare namespace Vitra {
  interface ThemeOptions {
    defaultTheme?: string;
    persist?: boolean;
  }

  interface ThemeModule {
    get(): string;
    set(themeName: string): boolean;
    toggle(): string;
    init(options?: ThemeOptions): string;
    getEffective(): string;
    clear(): void;
    getValidThemes(): string[];
  }

  interface ParticleOptions {
    color?: string;
    size?: number;
    emoji?: string | null;
    container?: string;
  }

  interface ParticleLimits {
    max: number;
    active: number;
    available: number;
  }

  interface ParticlesModule {
    spawn(count: number, options?: ParticleOptions): number;
    destroy(count?: number | null): number;
    limits(): ParticleLimits;
    init(): void;
  }

  interface RevealOptions {
    selector?: string;
    threshold?: number;
    stagger?: number;
  }

  interface RevealModule {
    init(options?: RevealOptions): void;
    count(): number;
    reset(): void;
  }

  interface ModalOptions {
    closeOnOverlay?: boolean;
    closeOnEsc?: boolean;
  }

  interface ModalModule {
    open(target: string | HTMLElement, options?: ModalOptions): boolean;
    close(): void;
  }

  interface TooltipOptions {
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
  }

  interface TooltipModule {
    show(target: string | HTMLElement, text: string, options?: TooltipOptions): boolean;
    hide(target?: string | HTMLElement | null): void;
    init(): void;
  }

  interface ToastOptions {
    type?: 'success' | 'error' | 'info' | 'default';
    duration?: number;
  }

  interface ToastModule {
    show(message: string, options?: ToastOptions): HTMLElement;
  }

  interface DropdownModule {
    init(): void;
  }

  interface SpotlightModule {
    init(): void;
  }

  interface VitraInstance {
    theme: ThemeModule;
    particles: ParticlesModule;
    reveal: RevealModule;
    modal: ModalModule;
    tooltip: TooltipModule;
    toast: ToastModule;
    dropdown: DropdownModule;
    spotlight: SpotlightModule;
  }
}

declare const Vitra: Vitra.VitraInstance;

export = Vitra;
export as namespace Vitra;