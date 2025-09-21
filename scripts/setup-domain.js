#!/usr/bin/env node

/**
 * Domain Setup Helper Script for Kerala Map
 * This script helps you set up a custom domain for your Kerala Map application
 */

import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🌐 Kerala Map - Custom Domain Setup Helper\n');

const questions = [
  {
    question: 'What domain name would you like to use? (e.g., keralamap.in): ',
    key: 'domain'
  },
  {
    question: 'Which domain registrar are you using? (namecheap/godaddy/google/other): ',
    key: 'registrar'
  },
  {
    question: 'Are you using Vercel for hosting? (yes/no): ',
    key: 'vercel'
  }
];

const answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    generateInstructions();
    return;
  }

  const q = questions[index];
  rl.question(q.question, (answer) => {
    answers[q.key] = answer.toLowerCase().trim();
    askQuestion(index + 1);
  });
}

function generateInstructions() {
  console.log('\n📋 Custom Domain Setup Instructions:\n');
  
  const domain = answers.domain;
  const registrar = answers.registrar;
  const usingVercel = answers.vercel === 'yes';
  
  console.log(`🎯 Domain: ${domain}`);
  console.log(`🏪 Registrar: ${registrar}`);
  console.log(`☁️ Hosting: ${usingVercel ? 'Vercel' : 'Other'}\n`);
  
  if (usingVercel) {
    console.log('📝 Vercel Setup Steps:');
    console.log('1. Go to your Vercel dashboard');
    console.log('2. Select your Kerala Map project');
    console.log('3. Go to Settings → Domains');
    console.log('4. Click "Add Domain"');
    console.log('5. Enter your domain:', domain);
    console.log('6. Follow Vercel\'s DNS configuration instructions\n');
  }
  
  console.log('🔧 DNS Configuration:');
  console.log('Add these DNS records to your domain provider:\n');
  
  console.log('For Root Domain (@):');
  console.log('Type: A');
  console.log('Name: @');
  console.log('Value: 76.76.19.61 (Vercel IP)\n');
  
  console.log('For WWW Subdomain:');
  console.log('Type: CNAME');
  console.log('Name: www');
  console.log('Value: cname.vercel-dns.com\n');
  
  console.log('⏱️ DNS Propagation:');
  console.log('- DNS changes can take 24-48 hours to propagate');
  console.log('- You can check propagation at: https://dnschecker.org/');
  console.log('- Vercel will automatically provide SSL certificates\n');
  
  console.log('✅ After Setup:');
  console.log(`- Your app will be available at: https://${domain}`);
  console.log(`- WWW version: https://www.${domain}`);
  console.log('- SSL certificate will be automatically configured\n');
  
  console.log('🆘 Need Help?');
  console.log('- Vercel Docs: https://vercel.com/docs/concepts/projects/domains');
  console.log('- Check DOMAIN_SETUP_GUIDE.md for detailed instructions\n');
  
  rl.close();
}

// Start the questionnaire
askQuestion(0);
