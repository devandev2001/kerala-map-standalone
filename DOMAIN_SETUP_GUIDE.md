# Custom Domain Setup Guide for Kerala Map

## Option 1: Vercel Custom Domain (Recommended)

### Step 1: Purchase a Domain
1. Go to a domain registrar (Namecheap, GoDaddy, Google Domains)
2. Search for available domains like:
   - `keralamap.in`
   - `keralamapapp.com`
   - `bjpmapkerala.com`
   - `keralapoliticalmap.com`
3. Purchase the domain

### Step 2: Add Domain to Vercel
1. Go to your Vercel dashboard
2. Select your Kerala Map project
3. Go to Settings → Domains
4. Click "Add Domain"
5. Enter your domain name
6. Follow Vercel's DNS configuration instructions

### Step 3: Configure DNS
Add these DNS records to your domain provider:

**For Root Domain (e.g., keralamap.com):**
```
Type: A
Name: @
Value: 76.76.19.61
```

**For WWW Subdomain (e.g., www.keralamap.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 4: SSL Certificate
Vercel automatically provides SSL certificates for custom domains.

## Option 2: Netlify with Custom Domain

### Step 1: Deploy to Netlify
1. Go to netlify.com
2. Connect your GitHub repository
3. Deploy your project

### Step 2: Add Custom Domain
1. Go to Site Settings → Domain Management
2. Add your custom domain
3. Configure DNS as instructed by Netlify

## Option 3: GitHub Pages with Custom Domain

### Step 1: Enable GitHub Pages
1. Go to your repository settings
2. Scroll to Pages section
3. Select source as GitHub Actions
4. Create a workflow file

### Step 2: Add Custom Domain
1. Add your domain to GitHub Pages settings
2. Create a CNAME file in your repository
3. Configure DNS with your domain provider

## DNS Configuration Examples

### Namecheap DNS Settings:
```
A Record: @ → 76.76.19.61 (Vercel IP)
CNAME: www → cname.vercel-dns.com
```

### GoDaddy DNS Settings:
```
A Record: @ → 76.76.19.61
CNAME: www → cname.vercel-dns.com
```

## Cost Breakdown:
- Domain: $10-15/year
- Vercel: Free (for personal projects)
- SSL: Free (included with Vercel)
- Total: ~$10-15/year

## Recommended Domain Names:
1. `keralamap.in` - Perfect for Indian audience
2. `keralamapapp.com` - Clear and descriptive
3. `bjpmapkerala.com` - Branded for BJP mission
4. `keralapoliticalmap.com` - SEO friendly
