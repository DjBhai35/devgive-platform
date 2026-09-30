// End-to-end automated verification script
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('Starting End-to-End System Tests on ' + BASE_URL);
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Check Public Stats
    console.log('\n--- 1. Testing Live Public Statistics ---');
    const statsRes = await fetch(`${BASE_URL}/api/stats`);
    const statsData = await statsRes.json();
    assert(statsRes.status === 200, 'Public stats endpoint returned 200 OK');
    assert(statsData.stats.projects >= 6, `Stats show ${statsData.stats.projects} real published projects`);

    // 2. Fetch Categories & Projects
    console.log('\n--- 2. Testing Marketplace Projects & Categories ---');
    const projectsRes = await fetch(`${BASE_URL}/api/projects?limit=10`);
    const projectsData = await projectsRes.json();
    assert(projectsData.projects.length >= 6, `Marketplace loaded ${projectsData.projects.length} projects`);
    const freeProject = projectsData.projects.find((p) => !p.isPremium);
    const premiumProject = projectsData.projects.find((p) => p.isPremium);
    assert(!!freeProject, `Identified free project: "${freeProject?.title}"`);
    assert(!!premiumProject, `Identified premium project: "${premiumProject?.title}"`);

    // 3. Register a New User
    console.log('\n--- 3. Testing User Registration ---');
    const testEmail = `user_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dilshad Developer',
        username: `user_${Date.now()}`,
        email: testEmail,
        password: 'Password123!',
      }),
    });
    const regData = await regRes.json();
    const userCookie = regRes.headers.get('set-cookie');
    assert(regRes.status === 200, `Registered user account: ${testEmail}`);
    assert(!!userCookie, 'Received secure session authentication cookie');

    // 4. Test Authenticated User /api/auth/me
    console.log('\n--- 4. Testing Authenticated Session ---');
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { cookie: userCookie },
    });
    const meData = await meRes.json();
    assert(meData.user?.email === testEmail, `Verified session belongs to ${meData.user?.name}`);

    // 5. Test Wishlist Functionality
    console.log('\n--- 5. Testing Wishlist Add & Fetch ---');
    const wishAddRes = await fetch(`${BASE_URL}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: userCookie },
      body: JSON.stringify({ projectId: premiumProject.id }),
    });
    const wishAddData = await wishAddRes.json();
    assert(wishAddData.wishlisted === true, 'Successfully added premium project to wishlist');

    const wishListRes = await fetch(`${BASE_URL}/api/wishlist`, {
      headers: { cookie: userCookie },
    });
    const wishListData = await wishListRes.json();
    assert(wishListData.wishlist?.length === 1, 'Wishlist contains exactly 1 real item');

    // 6. Test Free Claim Verification Flow
    console.log('\n--- 6. Testing Free Claim & YouTube Watch Duration ---');
    // Try claiming without watching enough
    const failClaimRes = await fetch(`${BASE_URL}/api/claims/verify-youtube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: userCookie },
      body: JSON.stringify({
        projectId: freeProject.id,
        watchedSeconds: 2, // only 2 seconds (needs project duration)
      }),
    });
    assert(failClaimRes.status === 400, 'Server blocked claim with insufficient watch time (anti-cheat works)');

    // Now claim with verified full duration
    const successClaimRes = await fetch(`${BASE_URL}/api/claims/verify-youtube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: userCookie },
      body: JSON.stringify({
        projectId: freeProject.id,
        watchedSeconds: freeProject.youtubeRequiredDuration || 60,
      }),
    });
    const successClaimData = await successClaimRes.json();
    assert(successClaimRes.status === 200 && successClaimData.verified === true, 'Free claim successfully verified and saved to database');

    // 7. Test Protected Download of Free Project
    console.log('\n--- 7. Testing Protected Source Code Download (Free Project) ---');
    const dlFreeRes = await fetch(`${BASE_URL}/api/downloads/${freeProject.id}`, {
      headers: { cookie: userCookie },
    });
    const dlBuffer = await dlFreeRes.arrayBuffer();
    assert(dlFreeRes.status === 200, 'Unlocked free source code archive downloaded successfully');
    assert(dlBuffer.byteLength > 100, `Downloaded ${dlBuffer.byteLength} bytes of valid zip package`);
    assert(dlFreeRes.headers.get('content-type') === 'application/zip', 'Content-Type is application/zip');

    // 8. Test Gated Security on Premium Project (before purchase)
    console.log('\n--- 8. Testing Protected Download Security (Premium Project Before Purchase) ---');
    const dlUnauthRes = await fetch(`${BASE_URL}/api/downloads/${premiumProject.id}`, {
      headers: { cookie: userCookie },
    });
    assert(dlUnauthRes.status === 403, 'Access strictly denied for unpurchased premium project (Security gate verified)');

    // 9. Submit Purchase / Donation Order
    console.log('\n--- 9. Testing Purchase & Donation Submission ---');
    const orderRes = await fetch(`${BASE_URL}/api/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: userCookie },
      body: JSON.stringify({
        projectId: premiumProject.id,
        amount: premiumProject.price,
        paymentMethod: 'USDT (TRC20)',
        transactionReference: `TXN-CRYPTO-${Date.now()}`,
        notes: 'Testing premium buy flow',
      }),
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 201, `Order submitted with status: ${orderData.purchase?.status}`);
    const orderId = orderData.purchase?.id;

    // 10. Admin Authentication & Order Approval
    console.log('\n--- 10. Testing Admin Login & Order Approval ---');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@devgive.com',
        password: 'AdminPassword123!',
      }),
    });
    const adminCookie = adminLoginRes.headers.get('set-cookie');
    assert(adminLoginRes.status === 200, 'Admin signed in successfully');

    // Admin approves the purchase
    const approveRes = await fetch(`${BASE_URL}/api/admin/transactions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({
        transactionId: orderId,
        status: 'APPROVED',
      }),
    });
    assert(approveRes.status === 200, 'Admin approved user transaction');

    // 11. User Downloads Premium Project After Approval
    console.log('\n--- 11. Testing Protected Download After Order Approval ---');
    const dlPremiumRes = await fetch(`${BASE_URL}/api/downloads/${premiumProject.id}`, {
      headers: { cookie: userCookie },
    });
    const premiumBuffer = await dlPremiumRes.arrayBuffer();
    assert(dlPremiumRes.status === 200, `Premium download unlocked! Downloaded ${premiumBuffer.byteLength} bytes`);

    // 12. Admin Project CRUD & Live Reflection
    console.log('\n--- 12. Testing Admin Project Creation & Public Reflection ---');
    const newProjRes = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({
        title: 'Enterprise CRM Engine 2026',
        slug: `enterprise-crm-${Date.now()}`,
        categoryId: freeProject.categoryId,
        shortDescription: 'Enterprise CRM built with Next.js and Prisma.',
        description: 'Complete CRM script with analytics, pipelines, and notifications.',
        techStack: ['Next.js', 'Prisma', 'PostgreSQL'],
        isPremium: true,
        price: 79.0,
        published: true,
      }),
    });
    const newProjData = await newProjRes.json();
    assert(newProjRes.status === 201, `Admin created project: "${newProjData.project?.title}"`);

    // Verify it appears in public marketplace
    const verifyPubRes = await fetch(`${BASE_URL}/api/projects?q=Enterprise%20CRM`);
    const verifyPubData = await verifyPubRes.json();
    assert(verifyPubData.projects.length >= 1, 'Newly created project appears immediately in public search');

    // Unpublish project
    const unpubRes = await fetch(`${BASE_URL}/api/projects/${newProjData.project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ published: false }),
    });
    assert(unpubRes.status === 200, 'Admin successfully unpublished the project');

    // Verify removal from public listings
    const verifyUnpubRes = await fetch(`${BASE_URL}/api/projects?q=Enterprise%20CRM`);
    const verifyUnpubData = await verifyUnpubRes.json();
    assert(verifyUnpubData.projects.length === 0, 'Unpublished project is instantly hidden from public users');

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
