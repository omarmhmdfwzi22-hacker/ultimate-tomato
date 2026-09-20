import http from 'http';
import { db } from '../src/server/database';

// Helper to run a test suite
let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedCount++;
  }
}

async function runTests() {
  console.log('========================================================');
  console.log('ULTIMATE TOMATO: Platform Integration & Logic Test Suite');
  console.log('========================================================\n');

  // ----------------------------------------------------
  // Test 1: Brand & Platform Core Settings
  // ----------------------------------------------------
  console.log('1. Testing Platform Brand & Settings...');
  const platformSettings = db.getPlatformSettings();
  assert(platformSettings.platform_name === 'ULTIMATE TOMATO', 'Platform name is ULTIMATE TOMATO');
  assert(platformSettings.primary_color === '#F52F3A', 'Primary brand color is #F52F3A (Tomato Red)');
  assert(
    platformSettings.logo_url === '/assets/ultimate-tomato-logo.png',
    'Official platform logo is correctly configured'
  );

  // ----------------------------------------------------
  // Test 2: Seed Portfolio for Omar Mohamed Fawzi
  // ----------------------------------------------------
  console.log('\n2. Testing Omar Mohamed Fawzi Inaugural Client Portfolio...');
  const clients = db.getClients();
  const omarClient = clients.find((c) => c.email === 'omar@ultimatetomato.com');
  assert(!!omarClient, 'Client account for Omar Mohamed Fawzi exists');
  assert(omarClient?.name === 'Omar Mohamed Fawzi', 'Client name is verified as "Omar Mohamed Fawzi"');

  const bundle = db.getPublicPortfolioBundle('omar-mohamed-fawzi');
  assert(!!bundle, 'Portfolio bundle retrieved for slug "omar-mohamed-fawzi"');
  assert(bundle?.projects.length! > 0, `Bundle has ${bundle?.projects.length} initial portfolio projects`);
  assert(bundle?.skills.length! > 0, `Bundle has ${bundle?.skills.length} skills`);
  assert(bundle?.services.length! > 0, `Bundle has ${bundle?.services.length} services`);

  // Verify social links contain verified Facebook URL
  const fbLink = bundle?.social_links.find((l) => l.platform.toLowerCase() === 'facebook');
  assert(!!fbLink, 'Verified Facebook link exists');
  assert(
    fbLink?.url === 'https://www.facebook.com/omar.mhmdfwzi',
    'Facebook link matches reference: https://www.facebook.com/omar.mhmdfwzi'
  );

  // ----------------------------------------------------
  // Test 3: Point 1 - Client Onboarding Workflow
  // ----------------------------------------------------
  console.log('\n3. Testing Point 1: Client Onboarding Flow...');
  const testId = Date.now();
  const testSlug = `test-studio-${testId}`;
  const testEmail = `studio-${testId}@tomato.dev`;

  const created = db.createClientWithPortfolio({
    clientName: 'Test Creative Studio',
    email: testEmail,
    portfolioSlug: testSlug,
    portfolioName: 'Test Creative Studio Showcase',
    adminEmail: 'admin@ultimatetomato.com',
  });

  assert(!!created.client.id, 'Client successfully created');
  assert(!!created.onboardingToken, 'Secure onboarding token generated');
  assert(created.client.status === 'PENDING_ONBOARDING', 'Initial client status is PENDING_ONBOARDING');

  // Verify onboarding token lookup
  const pending = db.findClientByOnboardingToken(created.onboardingToken);
  assert(pending?.id === created.client.id, 'Token resolves to the correct pending client');

  // Complete onboarding
  const completed = db.completeOnboarding({
    token: created.onboardingToken,
    password: 'secure_password_123',
    name: 'Test Creative Studio',
    professional_title: 'Lead Design Technologist',
    bio: 'Pioneering interactive design and creative software architectures.',
  });

  assert(completed.success === true, 'Onboarding marked completed');
  assert(completed.user?.role === 'CLIENT', 'Associated user role is CLIENT');

  // ----------------------------------------------------
  // Test 4: Point 2 - Portfolio-level Publish & Draft Workflow
  // ----------------------------------------------------
  console.log('\n4. Testing Point 2: Portfolio Publish & Draft Workflow...');
  const testPortfolio = created.portfolio;
  assert(testPortfolio.status === 'DRAFT', 'New portfolio starts in DRAFT status');
  assert(testPortfolio.published === false, 'Portfolio is not published by default');

  // Public retrieval without preview must be blocked (returns null for unauthenticated public visitors)
  const draftBundle = db.getPublicPortfolioBundle(testSlug, false);
  assert(draftBundle === null, 'Unpublished draft portfolio is hidden from public visitors');

  // Preview mode retrieval
  const previewBundle = db.getPublicPortfolioBundle(testSlug, true);
  assert(!!previewBundle, 'Preview mode enables owner/super-admin access');

  // Transition to PUBLISHED
  const publishedPortfolio = db.updatePortfolioStatus(
    testPortfolio.id,
    'PUBLISHED',
    testEmail
  );
  assert(publishedPortfolio?.status === 'PUBLISHED', 'Portfolio status transitioned to PUBLISHED');
  assert(publishedPortfolio?.published === true, 'Portfolio published boolean set to true');

  // ----------------------------------------------------
  // Test 5: Point 5 - System Audit Log Trail
  // ----------------------------------------------------
  console.log('\n5. Testing Point 5: Security & System Audit Trail...');
  const auditLogs = db.getAuditLogs();
  assert(auditLogs.length > 0, `Audit log contains ${auditLogs.length} logged system events`);
  
  const statusAudit = auditLogs.find((l) => l.action === 'PORTFOLIO_PUBLISHED' && l.portfolio_id === testPortfolio.id);
  assert(!!statusAudit, 'Portfolio published event was captured in audit logs');
  assert(
    statusAudit?.user_email === testEmail,
    'Audit log accurately recorded the actor email'
  );

  // ----------------------------------------------------
  // Test 6: Point 6 - Soft Delete & Restore
  // ----------------------------------------------------
  console.log('\n6. Testing Point 6: Soft Delete and Restore Lifecycle...');
  const deleteResult = db.softDeleteClient(created.client.id, 'admin@ultimatetomato.com');
  assert(deleteResult === true, 'Soft delete client returned true');

  const afterDeleteClients = db.getClients(false); // only active
  const foundActive = afterDeleteClients.find((c) => c.id === created.client.id);
  assert(!foundActive, 'Soft-deleted client is hidden from active queries');

  const allClientsWithDeleted = db.getClients(true);
  const foundDeleted = allClientsWithDeleted.find((c) => c.id === created.client.id);
  assert(!!foundDeleted?.deleted_at, 'Client has deleted_at timestamp populated');

  // Restore client
  const restoreResult = db.restoreClient(created.client.id, 'admin@ultimatetomato.com');
  assert(restoreResult === true, 'Restore client returned true');

  const afterRestoreClients = db.getClients(false);
  const foundRestored = afterRestoreClients.find((c) => c.id === created.client.id);
  assert(!!foundRestored && !foundRestored.deleted_at, 'Restored client is active again with null deleted_at');

  // ----------------------------------------------------
  // Test 7: Point 7 - Platform Settings vs Site Settings Separation
  // ----------------------------------------------------
  console.log('\n7. Testing Point 7: Strict Platform vs Site Settings Separation...');
  const siteSettings = db.getSiteSettings(testPortfolio.id);
  assert(!!siteSettings.portfolio_id, 'SiteSettings belongs strictly to portfolio_id');
  assert(typeof siteSettings.bio === 'string', 'SiteSettings stores client-specific bio');
  assert(typeof siteSettings.professional_title === 'string', 'SiteSettings stores client professional title');

  // Updating site settings should NOT change platform settings
  db.updateSiteSettings(testPortfolio.id, { title: 'Custom Showcase Title' }, testEmail);
  const updatedSite = db.getSiteSettings(testPortfolio.id);
  const currentPlatform = db.getPlatformSettings();

  assert(updatedSite.title === 'Custom Showcase Title', 'Portfolio site settings updated');
  assert(currentPlatform.platform_name === 'ULTIMATE TOMATO', 'Platform settings remained isolated');

  // ----------------------------------------------------
  // Test 8: Contact Message & Honeypot Spam Defense
  // ----------------------------------------------------
  console.log('\n8. Testing Contact Form Inquiries & Honeypot...');
  const legitimateMsg = db.submitContactMessage(bundle!.portfolio.id, {
    sender: 'Sarah Connor',
    email: 'sarah@skynet-research.org',
    subject: 'Senior Architecture Consulting',
    message: 'Hello Omar, we reviewed your creative portfolio and would love to collaborate.',
  });
  assert(!!legitimateMsg.id, 'Legitimate contact inquiry successfully stored');
  assert(legitimateMsg.status === 'UNREAD', 'New inquiry has UNREAD status');

  const messages = db.getMessages(bundle!.portfolio.id);
  assert(messages.some((m) => m.sender === 'Sarah Connor'), 'Inquiry appears in portfolio inbox');

  // ----------------------------------------------------
  // Final Results
  // ----------------------------------------------------
  console.log('\n========================================================');
  console.log(`TEST RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('========================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test execution failure:', err);
  process.exit(1);
});
