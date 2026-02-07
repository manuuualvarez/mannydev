import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock GSAP
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn(),
    from: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    registerPlugin: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
    })),
  },
  ScrollTrigger: {
    getAll: vi.fn(() => []),
    kill: vi.fn(),
  },
  default: {
    to: vi.fn(),
    from: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    registerPlugin: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
    })),
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    getAll: vi.fn(() => []),
    kill: vi.fn(),
  },
}));

// Mock framer-motion - use React.forwardRef for proper ref handling
vi.mock('framer-motion', () => {
  const createMotionComponent = (tag: string) => {
    const Component = React.forwardRef(function MotionComponent(
      props: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode },
      ref: React.Ref<HTMLElement>
    ) {
      const { children, ...rest } = props;
      // Filter out framer-motion specific props
      const filteredProps = Object.fromEntries(
        Object.entries(rest).filter(
          ([key]) =>
            !['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap', 'whileFocus', 'whileInView', 'onAnimationComplete'].includes(key)
        )
      );
      return React.createElement(tag, { ...filteredProps, ref }, children);
    });
    Component.displayName = `motion.${tag}`;
    return Component;
  };

  return {
    motion: {
      div: createMotionComponent('div'),
      header: createMotionComponent('header'),
      form: createMotionComponent('form'),
      nav: createMotionComponent('nav'),
      span: createMotionComponent('span'),
      p: createMotionComponent('p'),
      section: createMotionComponent('section'),
      button: createMotionComponent('button'),
      a: createMotionComponent('a'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useScroll: vi.fn(() => ({
      scrollY: {
        on: vi.fn(() => vi.fn()),
        onChange: vi.fn(() => vi.fn()),
      },
    })),
    useTransform: vi.fn(),
    useAnimation: vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
    })),
    useInView: vi.fn(() => true),
  };
});

// Mock next/link
vi.mock('next/link', () => ({
  default: React.forwardRef(function MockLink(
    { children, href, ...props }: { children: React.ReactNode; href: string },
    ref: React.Ref<HTMLAnchorElement>
  ) {
    return React.createElement('a', { href, ref, ...props }, children);
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: function MockImage(props: { src: string; alt: string; [key: string]: unknown }) {
    return React.createElement('img', props);
  },
}));

// Mock matchMedia for reduced motion tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock next-intl (global fallback for components using useTranslations)
vi.mock('next-intl', async () => {
  const actual = await vi.importActual('next-intl');
  return {
    ...actual,
    useTranslations: vi.fn((namespace?: string) => {
      // Load the English messages for tests
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const messages = require('./messages/en.json');
      const section = namespace ? messages[namespace] : messages;

      const t = (key: string) => {
        const parts = key.split('.');
        let value: unknown = section;
        for (const part of parts) {
          if (value && typeof value === 'object') {
            value = (value as Record<string, unknown>)[part];
          } else {
            return key;
          }
        }
        return typeof value === 'string' ? value : key;
      };

      t.raw = (key: string) => {
        const parts = key.split('.');
        let value: unknown = section;
        for (const part of parts) {
          if (value && typeof value === 'object') {
            value = (value as Record<string, unknown>)[part];
          } else {
            return key;
          }
        }
        return value;
      };

      t.rich = (key: string, values?: Record<string, unknown>) => {
        let text = t(key);
        if (values && typeof text === 'string') {
          // Handle XML-like tags: <tag>content</tag> -> callback(content)
          Object.entries(values).forEach(([k, v]) => {
            const tagRegex = new RegExp(`<${k}>([^<]*)</${k}>`, 'g');
            if (typeof v === 'function' && tagRegex.test(text as string)) {
              text = (text as string).replace(tagRegex, (_match, content) => String(v(content)));
            } else if (typeof v === 'function') {
              // Fallback: {key} placeholder style
              text = (text as string).replace(`{${k}}`, String(v(k)));
            } else {
              text = (text as string).replace(`{${k}}`, String(v));
            }
          });
        }
        return text;
      };

      return t;
    }),
    useLocale: vi.fn(() => 'en'),
  };
});

// Suppress console.error for expected errors in tests
const originalError = console.error;
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: An update to') ||
      args[0].includes('vi.fn() mock'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};
