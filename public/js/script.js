document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    const data = {
        Username: username,
        Password: password
    };

    fetch('https://backcvbgtmdesa.azurewebsites.net/api/login/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error en la autenticación. Verifique su usuario y contraseña.');
        }
    })
    .then(data => {
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('username', username); // Guardar el usuario
            messageDiv.innerHTML = '<div class="alert alert-success">Autenticación exitosa. Redirigiendo...</div>';
            
            // Redirigir a la página del chat después de un breve retraso
            setTimeout(() => {
                window.location.href = '/chat.html';
            }, 2000);

        } else {
            throw new Error('No se recibió un token.');
        }
    })
    .catch(error => {
        messageDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        console.error('Error:', error);
    });
});
