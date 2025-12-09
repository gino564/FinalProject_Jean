#!/bin/bash

# Create image directories
mkdir -p public/images
mkdir -p public/images/tattoos
mkdir -p public/images/artists

# Create simple SVG placeholders
cat > public/images/hero-bg.jpg <<'EOF'
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#grad)"/>
  <text x="960" y="540" font-family="Arial" font-size="80" fill="#d4af37" text-anchor="middle">J'INK TATTOO STUDIO</text>
</svg>
EOF

cat > public/images/form-bg.jpg <<'EOF'
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2a2a2a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#grad2)"/>
</svg>
EOF

cat > public/images/placeholder.jpg <<'EOF'
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#1a1a1a"/>
  <text x="200" y="200" font-family="Arial" font-size="24" fill="#d4af37" text-anchor="middle">Image Placeholder</text>
</svg>
EOF

echo "✓ Image placeholders created successfully!"
echo ""
echo "Note: Replace these placeholder images with actual images:"
echo "  - public/images/hero-bg.jpg (Hero background)"
echo "  - public/images/form-bg.jpg (Login/Register background)"
echo "  - public/images/placeholder.jpg (Default placeholder)"
echo ""
echo "You can also add tattoo and artist images to:"
echo "  - public/images/tattoos/"
echo "  - public/images/artists/"
