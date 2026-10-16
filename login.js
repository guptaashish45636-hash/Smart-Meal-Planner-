// Login page logic is kept separate from the meal planner logic.
function readProfiles() {
	try {
		return JSON.parse(localStorage.getItem('smartMealPlannerProfiles')) || [];
	} catch (error) {
		return [];
	}
}

const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const email = document.querySelector('#email').value.trim();
	const password = document.querySelector('#password').value;
	const loginMessage = document.querySelector('#login-message');
	const profiles = readProfiles();
	const matchingProfile = profiles.find((profile) => profile.email === email && profile.password === password);

	if (!email || password.length < 4) {
		loginMessage.textContent = 'Please enter a valid email and a password with at least 4 characters.';
		return;
	}

	if (profiles.length > 0 && !matchingProfile) {
		loginMessage.textContent = 'Email or password is incorrect. Create a profile first if needed.';
		return;
	}

	localStorage.setItem('smartMealPlannerUser', JSON.stringify({ email }));
	loginMessage.style.color = '#2f6b4f';
	loginMessage.textContent = 'Login successful. Opening your meal planner...';
	setTimeout(() => { window.location.href = 'index.html'; }, 500);
});
