document.getElementById('signup-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const errorMessage = document.getElementById('error-message');

  if (password !== confirmPassword) {
    errorMessage.textContent = 'Passwords do not match';
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Log the user in
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        localStorage.setItem('token', loginData.token);
        window.location.href = 'userlogin.html';
      } else {
        errorMessage.textContent = loginData.msg || 'Login failed after registration';
      }
    } else {
      errorMessage.textContent = data.msg || 'Registration failed';
    }
  } catch (error) {
    errorMessage.textContent = 'An error occurred. Please try again.';
    console.error('Error:', error);
  }
});