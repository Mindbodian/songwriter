# How to Add Your Custom Logo

To add your custom PNG logo to the header:

1. Add your PNG file to this directory (src/assets/)
2. Open `src/components/Header.tsx`
3. Replace the import line:
   ```tsx
   import { Logo } from '../assets/logo-placeholder';
   ```
   with:
   ```tsx
   import logoImage from '../assets/your-logo-filename.png';
   ```
4. Replace the Logo component in the JSX:
   ```tsx
   <Logo className="h-10 w-auto" />
   ```
   with:
   ```tsx
   <img src={logoImage} alt="Logo" className="h-10 w-auto" />
   ```

## Logo Size Recommendations

For the best appearance in the header:
- Recommended height: 40px
- PNG with transparency works best
- Keep the file size under 50KB for optimal performance 