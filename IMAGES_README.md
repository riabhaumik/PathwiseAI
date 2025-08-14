# PathwiseAI Header & Footer Images

This directory contains the HTML files for PathwiseAI's header and footer images that can be converted to actual image files for use in your application.

## 📁 Files Included

- **`header-image.html`** - Header image showcasing PathwiseAI's value proposition
- **`footer-image.html`** - Footer image with branding and social links
- **`IMAGES_README.md`** - This documentation file

## 🎨 Design Features

### Header Image (`header-image.html`)
- **Dimensions**: 1200x200 pixels
- **Design**: Bold gradient background with floating elements
- **Content**: 
  - PathwiseAI logo with brain icon 🧠
  - Tagline: "Your AI-Powered STEM Career Navigator"
  - Value propositions: Smart Guidance, Practice Ready, Fast Track
  - Call-to-action button: "Start Learning"
- **Colors**: Blue to purple gradient with white text
- **Animations**: Pulsing logo, floating background elements

### Footer Image (`footer-image.html`)
- **Dimensions**: 1200x150 pixels
- **Design**: Dark theme with accent line and floating dots
- **Content**:
  - PathwiseAI branding
  - Feature categories: Features, Resources, Support
  - Social media links
  - Statistics: 10K+ Users, 500+ Problems, 95% Success Rate
  - Call-to-action: "Get Started"
- **Colors**: Dark gradient with cyan accents
- **Animations**: Shimmering accent line, floating dots

## 🖼️ Converting to Images

### Method 1: Browser Screenshot (Recommended)
1. Open the HTML file in a web browser
2. Use browser developer tools to ensure proper rendering
3. Take a screenshot or use browser's "Save as image" feature
4. Crop to exact dimensions if needed

### Method 2: Using Puppeteer (Automated)
```bash
# Install Puppeteer
npm install -g puppeteer

# Create a conversion script
node convert-html-to-image.js
```

### Method 3: Online HTML to Image Converters
- [HTML2Canvas](https://html2canvas.hertzen.com/)
- [Puppeteer Online](https://puppeteer-browserless.com/)
- [BrowserStack](https://www.browserstack.com/)

## 🎯 Usage Recommendations

### Header Image
- **Website Header**: Use as the main header banner
- **Social Media**: Perfect for LinkedIn, Twitter, and Facebook posts
- **Presentations**: Include in pitch decks and presentations
- **Email Marketing**: Use in email headers and newsletters

### Footer Image
- **Website Footer**: Use as footer banner
- **Documentation**: Include in PDFs and documentation
- **Business Cards**: Use as background for contact information
- **Print Materials**: Include in brochures and flyers

## 🎨 Customization

### Colors
- **Primary**: `#00d4ff` (Cyan)
- **Secondary**: `#ff6b6b` (Coral)
- **Accent**: `#feca57` (Yellow)
- **Success**: `#10b981` (Green)

### Typography
- **Font Family**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Header**: 48px, 900 weight
- **Subtitle**: 18px, 500 weight
- **Body**: 14px, 400-700 weight

### Dimensions
- **Header**: 1200x200px (6:1 ratio)
- **Footer**: 1200x150px (8:1 ratio)
- **Mobile**: Consider responsive versions for smaller screens

## 🚀 Integration

### Frontend Integration
```jsx
// React/Next.js example
import headerImage from './images/header-image.png';
import footerImage from './images/footer-image.png';

function App() {
  return (
    <div>
      <img src={headerImage} alt="PathwiseAI Header" className="w-full" />
      {/* Your content */}
      <img src={footerImage} alt="PathwiseAI Footer" className="w-full" />
    </div>
  );
}
```

### CSS Integration
```css
.header-banner {
  background-image: url('./images/header-image.png');
  background-size: cover;
  background-position: center;
  height: 200px;
}

.footer-banner {
  background-image: url('./images/footer-image.png');
  background-size: cover;
  background-position: center;
  height: 150px;
}
```

## 📱 Responsive Considerations

- **Desktop**: Full 1200px width
- **Tablet**: Scale down proportionally
- **Mobile**: Consider creating mobile-specific versions
- **High DPI**: Create 2x versions for retina displays

## 🔧 Technical Notes

- **File Size**: Optimize images for web use (under 500KB each)
- **Format**: PNG for transparency, JPG for smaller file sizes
- **Compression**: Use tools like TinyPNG or ImageOptim
- **Accessibility**: Ensure sufficient contrast ratios
- **Performance**: Lazy load if not immediately visible

## 📞 Support

If you need help with:
- Converting HTML to images
- Customizing colors or content
- Integration into your application
- Creating additional variations

Please refer to the main project documentation or create an issue in the repository.

---

**Note**: These HTML files are designed to be converted to static images. The animations and interactive elements will not work in image format, but the visual design will be preserved.
