document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById('registerForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, confirmPassword })
        });

        if (response.ok) {
            const result = await response.json();
            alert('Registration successful!');
            console.log(result);
        } else {
            const error = await response.text();
            alert('Error: ' + error);
        }
    });
});
