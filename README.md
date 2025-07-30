# StateAdvisors Solar - Landing Page

A modern, responsive solar energy landing page focused on commercial solar solutions with residential options. Built with HTML, CSS, and JavaScript, designed to capture leads through Formspree integration.

## Features

- **Commercial-Focused Design**: Primary emphasis on business solar solutions
- **Responsive Layout**: Optimized for all devices (desktop, tablet, mobile)
- **Lead Capture Form**: Integrated with Formspree for email notifications
- **Modern UI/UX**: Clean, professional design with smooth animations
- **SEO Optimized**: Proper meta tags and semantic HTML structure
- **Fast Loading**: Optimized assets and efficient code

## Sections

1. **Hero Section**: Compelling headline with key statistics and call-to-action
2. **Commercial Benefits**: ROI, cost predictability, ESG leadership, energy security
3. **Solutions**: Commercial, residential, and support services
4. **Process**: 4-step implementation process
5. **Contact Form**: Lead capture with Formspree integration
6. **Footer**: Company information and links

## Setup Instructions

### 1. Formspree Integration

1. Go to [Formspree.io](https://formspree.io) and create an account
2. Create a new form
3. Copy your form endpoint (e.g., `https://formspree.io/f/YOUR_FORM_ID`)
4. Replace `YOUR_FORM_ID` in the `index.html` file:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" id="solar-form">
   ```

### 2. Customization

#### Update Company Information
- Replace "StateAdvisors Solar" with your company name
- Update contact information in the footer
- Modify phone numbers and email addresses
- Update the service area in the footer

#### Update Content
- Modify hero headline and subtitle
- Adjust statistics in the hero section
- Update benefit descriptions
- Customize solution offerings
- Modify the 4-step process

#### Update Colors (Optional)
The color scheme uses:
- Primary Blue: `#2563eb`
- Dark Blue: `#1e40af`
- Accent Yellow: `#fbbf24`
- Success Green: `#10b981`

To change colors, update the CSS variables in `styles.css`.

### 3. GitHub Pages Deployment

1. Push your code to a GitHub repository
2. Go to repository Settings > Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"

Your site will be available at: `https://yourusername.github.io/repository-name`

### 4. Custom Domain (Optional)

1. Purchase a domain name
2. In GitHub Pages settings, add your custom domain
3. Update DNS settings with your domain provider
4. Add a `CNAME` file to your repository with your domain name

## File Structure

```
StateAdvisors/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Form Fields

The contact form includes:
- Full Name (required)
- Email Address (required)
- Phone Number
- Business Name
- Property Type (required)
- Average Monthly Electric Bill
- Additional Information

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance

- Optimized images and assets
- Minified CSS and JavaScript (recommended for production)
- Fast loading times
- Mobile-first responsive design

## SEO Features

- Semantic HTML structure
- Meta descriptions and titles
- Open Graph tags (can be added)
- Structured data (can be added)
- Fast loading times
- Mobile-friendly design

## Analytics Integration

To add Google Analytics:

1. Create a Google Analytics account
2. Get your tracking ID
3. Add this code before the closing `</head>` tag in `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

Replace `GA_TRACKING_ID` with your actual tracking ID.

## Support

For questions or issues:
1. Check the Formspree documentation for form setup
2. Review browser console for JavaScript errors
3. Validate HTML and CSS using online validators

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Note**: Remember to replace placeholder content with your actual business information before deploying to production. 