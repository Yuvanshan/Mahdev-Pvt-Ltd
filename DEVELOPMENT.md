# Development & Maintenance Guide

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build           # Build for production
npm start               # Run production build locally
npm run lint            # TypeScript type checking
npm run clean           # Clean build artifacts

# Project Structure
tree -L 2              # View folder structure
```

### Development Server

```bash
# Full dev stack with hot reload
npm run dev

# Access the app
open http://localhost:5173

# Admin portal
open http://localhost:5173?admin

# For testing on different ports
npm run dev -- --port 3000
npm run dev -- --host 0.0.0.0
```

---

## Project Structure Overview

```
Mahdev-Pvt-Ltd-/
├── src/
│   ├── architecture/              ← Clean Architecture layers
│   │   ├── presentation/          ← React components & hooks
│   │   ├── domain/                ← Business logic & entities
│   │   ├── data/                  ← Data access layer
│   │   ├── core/                  ← Shared utilities
│   │   └── README.md              ← Architecture guide
│   │
│   ├── components/                ← Current UI components
│   │   ├── Navbar.tsx             ← Fixed mobile menu ✨
│   │   ├── HomeView.tsx           ← Carousel hero section ✨
│   │   ├── AdminView.tsx
│   │   ├── admin/                 ← Admin modules
│   │   └── ...
│   │
│   ├── utils/                     ← Helper utilities
│   │   ├── animations.ts          ← Animation configs ✨
│   │   ├── mediaOptimizer.ts      ← Image optimization
│   │   ├── storage.ts             ← Data persistence
│   │   └── emailHelper.ts
│   │
│   ├── types.ts                   ← TypeScript definitions
│   ├── data.ts                    ← Static data
│   ├── App.tsx                    ← Root component
│   ├── main.tsx                   ← Entry point
│   └── index.css                  ← Global styles
│
├── public/                         ← Static assets
├── src/assets/
│   └── images/                    ← Optimized images
│
├── dist/                          ← Build output
├── node_modules/                  ← Dependencies
│
├── .gitignore                     ← Git exclusions ✨
├── vercel.json                    ← Deployment config ✨
├── vite.config.mjs                ← Vite configuration
├── tsconfig.json                  ← TypeScript config
├── package.json                   ← Dependencies & scripts
├── DEPLOYMENT.md                  ← Deployment guide ✨
├── IMPROVEMENTS_SUMMARY.md        ← What's new ✨
└── README.md                      ← Project info
```

**✨ = Recently improved or created**

---

## Common Tasks

### Add a New Feature

#### Using Clean Architecture:

1. **Create Domain Entity** (if needed)
```typescript
// src/architecture/domain/entities/YourEntity.ts
export interface YourEntityData {
  id: string;
  name: string;
  // ... properties
}

export const createYourEntity = (data: Partial<YourEntityData>): YourEntityData => {
  return {
    id: data.id || '',
    name: data.name || '',
    // ... defaults
  };
};
```

2. **Create Use Case** (business logic)
```typescript
// src/architecture/domain/use-cases/YourUseCase.ts
export class YourUseCase {
  constructor(private repository: IYourRepository) {}
  
  async execute(input: Input): Promise<Output> {
    // Business logic here
  }
}
```

3. **Create Repository Implementation**
```typescript
// src/architecture/data/repositories/YourRepository.ts
export class YourRepository implements IYourRepository {
  async create(item: YourEntity): Promise<string> {
    // Firebase/Storage implementation
  }
  // ... other methods
}
```

4. **Create React Hook**
```typescript
// src/architecture/presentation/hooks/useYourFeature.ts
export const useYourFeature = (repository: IYourRepository) => {
  // React state and effects
  // Call use cases here
  return { /* exported data and functions */ };
};
```

5. **Use in Component**
```typescript
// src/components/YourComponent.tsx
export default function YourComponent() {
  const feature = useYourFeature(getYourRepository());
  return (
    // JSX using feature
  );
}
```

---

### Fix a Bug

1. **Identify the layer** where bug occurs:
   - UI issue → Look in `components/` or `presentation/`
   - Business logic → Check `domain/use-cases/`
   - Data access → Check `data/repositories/`

2. **Write a test** (if applicable)
```typescript
describe('YourComponent', () => {
  it('should handle X scenario', () => {
    // test code
  });
});
```

3. **Fix the code**
4. **Verify in dev**: `npm run dev`
5. **Commit**: `git commit -m "Fix: Specific bug description"`

---

### Optimize Performance

1. **Check bundle size**:
```bash
npm run build
# Check dist/ folder size
```

2. **Check Lighthouse scores**:
   - Open Chrome DevTools → Lighthouse tab
   - Target: >90 all metrics

3. **Optimize images**:
   - Use WebP format (auto-done by mediaOptimizer.ts)
   - Compress before upload
   - Use `loading="lazy"` on images

4. **Reduce re-renders**:
   - Use `React.memo()` for pure components
   - Use `useMemo()` and `useCallback()`
   - Keep state local when possible

---

### Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Install latest versions (safe)
npm update

# Install specific package version
npm install package-name@latest

# Check for security issues
npm audit

# Fix security issues
npm audit fix

# After updating, test locally
npm run dev
npm run build
npm run lint
```

---

## Testing Strategies

### Manual Testing

**Mobile Menu**:
- Open DevTools → Device toolbar
- Test at: 320px, 640px, 768px widths
- Verify all menu items visible
- Test submenu expansion
- Check touch targets (44px+)

**Hero Carousel**:
- Desktop: All 4 cards visible
- Tablet: 2-3 cards visible
- Mobile: 1 card, navigation works
- Buttons responsive and clickable

**Animations**:
- Check for jank (60 FPS target)
- Smooth hover effects
- Page transitions smooth
- No animation lag on slow devices

### Automated Testing (Future)

```bash
# Setup testing framework (optional)
npm install -D vitest @testing-library/react

# Run tests
npm run test

# Coverage report
npm run test:coverage
```

---

## Debugging Tips

### Browser DevTools

1. **React DevTools** (Chrome extension):
   - Inspect component props
   - Trace re-renders
   - Profile performance

2. **Network Tab**:
   - Monitor API calls
   - Check image sizes
   - Verify cache headers

3. **Console**:
   - Watch for errors
   - Use `console.log()` for debugging
   - Check Firebase messages

### VS Code Debugging

```javascript
// Add breakpoint: click line number in VS Code
// Or add debugger statement:
debugger;

// Launch debugger
// F5 → Select Node.js
```

### Environment Variables

```bash
# Create .env.development.local for dev
VITE_DEBUG=true
VITE_LOG_LEVEL=debug

# Add to code
if (import.meta.env.VITE_DEBUG) {
  console.log('Debug info');
}
```

---

## Code Style & Best Practices

### TypeScript Conventions

```typescript
// ✅ Good
interface UserEntity {
  id: string;
  email: string;
}

const user: UserEntity = { id: '1', email: 'test@example.com' };

// ❌ Avoid
const user: any = { id: '1', email: 'test@example.com' };
```

### React Best Practices

```typescript
// ✅ Good: Memoized component
const MyComponent = React.memo(({ data }: Props) => {
  return <div>{data}</div>;
});

// ✅ Good: useCallback for handlers
const handleClick = useCallback(() => {
  // handler code
}, [dependencies]);

// ❌ Avoid: Function defined in render
const MyComponent = () => {
  const handleClick = () => {}; // Recreated every render
  return <button onClick={handleClick}>Click</button>;
};
```

### Tailwind CSS Guidelines

```jsx
// ✅ Good: Readable class groups
<div className="flex items-center gap-4 p-6 rounded-lg border border-gray-200">
  {/* content */}
</div>

// ❌ Avoid: Unclear long strings
<div className="flex item-center gap-4 p-6 rounded-lg border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow">

// Better: Use @apply for complex patterns
<style>{`
  .card {
    @apply p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition-shadow;
  }
`}</style>
```

---

## Common Errors & Solutions

### Build Errors

| Error | Solution |
|-------|----------|
| `Module not found` | Run `npm install`, check import paths |
| `Tailwind not loading` | Restart dev server (`Ctrl+C`, `npm run dev`) |
| `Firebase undefined` | Check `.env` variables, restart dev server |
| `Port already in use` | `npm run dev -- --port 3001` |

### Runtime Errors

| Error | Solution |
|-------|----------|
| `Cannot read property of undefined` | Add null checks with `?.` operator |
| `Memory leak warning` | Clean up useEffect: return cleanup function |
| `Infinite render loop` | Check dependencies in useEffect array |
| `White screen` | Check console for errors, verify React mounting |

---

## Performance Checklist

Before each deployment:

- [ ] Bundle size < 500KB (gzipped)
- [ ] Lighthouse score > 90 (all metrics)
- [ ] Images in WebP format
- [ ] No console errors/warnings
- [ ] Mobile responsive verified
- [ ] Animations at 60 FPS
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Accessibility score > 90

---

## Git Workflow

### Making Changes

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: Add new feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Wait for review and merge
```

### Commit Message Format

```
Type: Brief description

Optional detailed description:
- What changed
- Why it changed
- How it impacts the app

Types: feat, fix, improve, docs, style, refactor, perf, test, chore
```

### Example Commits

```bash
git commit -m "feat: Add mobile menu responsive spacing improvements"
git commit -m "fix: Correct hero carousel scrolling on tablet devices"
git commit -m "perf: Optimize image compression to WebP format"
git commit -m "docs: Add deployment guide and architecture documentation"
git commit -m "refactor: Implement clean architecture for customer module"
```

---

## Deployment Workflow

### Development Environment
```bash
npm run dev
# Test at http://localhost:5173
```

### Staging Deployment
```bash
git checkout staging
npm run build
vercel --env ENVIRONMENT=staging
```

### Production Deployment
```bash
git checkout main
npm run build
# Vercel auto-deploys on push to main
# Or manual: vercel --prod
```

### Rollback if Issues
```bash
# View previous deployments
vercel ls

# Rollback to previous version
vercel rollback
```

---

## Monitoring & Maintenance

### Daily Tasks
- [ ] Check error logs in Vercel
- [ ] Verify all pages load correctly
- [ ] Test critical flows (login, upload, etc.)

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check Firebase database usage
- [ ] Monitor error rates

### Monthly Tasks
- [ ] Update dependencies: `npm update`
- [ ] Security audit: `npm audit fix`
- [ ] Review and optimize slow queries
- [ ] Backup database (Firebase)

---

## Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [GitHub Desktop](https://desktop.github.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)

### Extensions (Recommended for VS Code)
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- REST Client
- GitLens
- Thunder Client (API testing)

---

## Contact & Support

- **Issues**: Check GitHub Issues or ask in team chat
- **Feature Requests**: Create GitHub Issue with details
- **Bug Reports**: Include steps to reproduce, expected vs actual
- **Questions**: Ask in team Slack/chat

---

**Last Updated**: July 10, 2026  
**Version**: 2.0.0-Enhanced  
**Maintained By**: Mahdev Development Team
