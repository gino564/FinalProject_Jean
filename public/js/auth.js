// Authentication utility functions

// Check if user is authenticated
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      // Not authenticated, redirect to login
      window.location.href = '/login.html';
    }
    return await response.json();
  } catch (error) {
    window.location.href = '/login.html';
  }
}

// Check if user is admin
async function checkAdminAuth() {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      window.location.href = '/login.html';
      return;
    }

    const user = await response.json();
    if (user.role !== 'admin') {
      alert('Access denied. Admin only.');
      window.location.href = '/user-dashboard.html';
    }

    return user;
  } catch (error) {
    window.location.href = '/login.html';
  }
}

// Logout function
async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = '/login.html';
  }
}
