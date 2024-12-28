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

        // Check for an email in the user's message
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const emailMatch = userMessage.match(emailRegex);

        if (emailMatch) {
            const email = emailMatch[0];
            botDiv.textContent += `\nAdding ${email} to the newsletter...`;
            chatBox.scrollTop = chatBox.scrollHeight;

            const result = await saveEmailToServer(email);
            botDiv.textContent += `\n${result.message}`;
        }

        // Scroll to the latest message
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
    }

    // Clear the input field
    userInput.value = '';
};

// Function to call serverless function for saving email
const saveEmailToServer = async (email) => {
    try {
        const response = await fetch('/.netlify/functions/addSubscriber', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error);
        }

        return { message: 'Successfully subscribed to the newsletter!' };
    } catch (error) {
        console.error('Error saving email to server:', error);
        return { message: 'Failed to subscribe. Please try again later.' };
    }
};

// Add click event listener to the send button
sendBtn.addEventListener('click', sendMessage);

// Add keypress event listener to the input field
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
