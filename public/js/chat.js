document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    const currentUserSpan = document.getElementById('currentUser');
    const messageForm = document.getElementById('messageForm');
    const messageContent = document.getElementById('messageContent');
    const messageResponseDiv = document.getElementById('messageResponse');
    const logoutButton = document.getElementById('logoutButton');
    const chatHistoryDiv = document.getElementById('chatHistory');

    // --- Funciones ---

    // Función para obtener y mostrar mensajes
    function fetchMessages() {
        // Apuntar al nuevo servidor local
        fetch('http://localhost:3000/messages')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('No se pudieron cargar los mensajes desde el servidor local.');
        })
        .then(messages => {
            renderMessages(messages);
        })
        .catch(error => {
            chatHistoryDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
            console.error('Error fetching messages:', error);
        });
    }

    // Función para renderizar los mensajes en el HTML
    function renderMessages(messages) {
        chatHistoryDiv.innerHTML = ''; // Limpiar historial anterior
        messages.forEach(msg => {
            const messageWrapper = document.createElement('div');
            messageWrapper.classList.add('message-bubble');

            if (msg.Login_Emisor === username) {
                messageWrapper.classList.add('user');
                messageWrapper.textContent = msg.Contenido;
            } else {
                messageWrapper.classList.add('other');
                const sender = document.createElement('div');
                sender.classList.add('message-sender');
                sender.textContent = msg.Login_Emisor;

                const content = document.createElement('div');
                content.textContent = msg.Contenido;
                
                messageWrapper.appendChild(sender);
                messageWrapper.appendChild(content);
            }
            
            chatHistoryDiv.appendChild(messageWrapper);
        });
        // Hacer scroll hasta el final
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
    }


    // --- Lógica Principal ---

    // 1. Verificar autenticación
    if (!token || !username) {
        window.location.href = '/';
        return;
    }

    // 2. Mostrar usuario y cargar mensajes iniciales
    currentUserSpan.textContent = username;
    fetchMessages();

    // 3. Enviar mensaje
    messageForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const message = messageContent.value;
        if (!message.trim()) return; // No enviar mensajes vacíos

        const data = {
            Cod_Sala: 0,
            Login_Emisor: username,
            Contenido: message
        };

        fetch('https://backcvbgtmdesa.azurewebsites.net/api/Mensajes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error('Error al enviar el mensaje. ' + text); });
            }
            return response.json();
        })
        .then(() => {
            messageResponseDiv.innerHTML = '<div class="alert alert-success">Mensaje enviado.</div>';
            messageContent.value = ''; // Limpiar el textarea
            fetchMessages(); // Actualizar el historial de chat
            
            // Limpiar el mensaje de éxito después de 2 segundos
            setTimeout(() => { messageResponseDiv.innerHTML = ''; }, 2000);
        })
        .catch(error => {
            messageResponseDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
            console.error('Error sending message:', error);
        });
    });

    // 4. Cerrar sesión
    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        window.location.href = '/';
    });
});
