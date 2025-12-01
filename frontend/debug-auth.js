/**
 * Debug Script for Authentication Issues
 * User: PO001
 */

console.log('🔍 Authentication Debug Script');
console.log('=' .repeat(60));

// Check localStorage for auth data
const authData = localStorage.getItem('tms_auth');
if (authData) {
  try {
    const parsed = JSON.parse(authData);
    console.log('✅ Found auth data in localStorage:');
    console.log('   User ID:', parsed.user?.user_id);
    console.log('   User Type:', parsed.user?.user_type_id);  
    console.log('   Role:', parsed.role);
    console.log('   Is Authenticated:', parsed.isAuthenticated);
    console.log('   Full User:', parsed.user);
  } catch (e) {
    console.error('❌ Error parsing auth data:', e);
  }
} else {
  console.log('❌ No auth data found in localStorage');
}

// Check for JWT token in cookies
const cookies = document.cookie;
console.log('\n🍪 Cookies:', cookies);

// Check current URL
console.log('\n🧭 Current URL:', window.location.href);

// Instructions for debugging
console.log('\n🛠️ Debug Steps:');
console.log('1. Check if user PO001 is logged in');
console.log('2. Verify role is "product_owner"');  
console.log('3. Test protected route access');
console.log('4. Check console logs during navigation');

console.log('=' .repeat(60));