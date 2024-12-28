const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Function to send a message
const sendMessage = async () => {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Add user message to chat
    const userDiv = document.createElement('div');
    userDiv.classList.add('message', 'user');
    userDiv.textContent = userMessage;
    chatBox.appendChild(userDiv);

    // Scroll to the latest message
    chatBox.scrollTop = chatBox.scrollHeight;

    // Call the serverless function
    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();

        // Add bot response to chat
        const botDiv = document.createElement('div');
        botDiv.classList.add('message', 'bot');
        botDiv.textContent = data.response;
        chatBox.appendChild(botDiv);

        // Scroll to the latest message
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
    }

    // Clear the input field
    userInput.value = '';
};

// Add click event listener to the send button
sendBtn.addEventListener('click', sendMessage);

// Add keypress event listener to the input field
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
