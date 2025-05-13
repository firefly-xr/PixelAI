const sidebar = document.getElementById('sidebar');
const mainContainer = document.getElementById('mainContainer');
const menuToggle = document.getElementById('menuToggle');
const closeSidebar = document.getElementById('closeSidebar');
const welcomeContainer = document.getElementById('welcomeContainer');
const chatContainer = document.getElementById('chatContainer');
const startChatButton = document.getElementById('startChat');
const messageContainer = document.getElementById('messageContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const cursorFollower = document.getElementById('cursorFollower');
const inputContainer = document.getElementById('inputContainer');
const voiceButton = document.getElementById('voiceButton');

// Gemini API Key - You should store this securely in a production environment
// Consider using environment variables or a secure backend service
const GEMINI_API_KEY = 'AIzaSyCAId0NyPSn7Eb4C5neGvPQe3YcaIkmLXQ'; 
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

let isRecording = false;
let recognition = null;

document.addEventListener('mousemove', (e) => {
    cursorFollower.style.left = e.clientX + 'px';
    cursorFollower.style.top = e.clientY + 'px';
});

async function talkToAI(prompt) {
    const res = await fetch("http://localhost:3000/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    console.log(data);
}

document.addEventListener('click', createRipple);

function createRipple(e) {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 2000);
}

const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25; // Reduced speed
        this.speedY = Math.random() * 0.5 - 0.25; // Reduced speed
        this.color = this.getRandomColor();
    }
    
    getRandomColor() {
        const colors = ['#ff00ff', '#00ffff', '#9900ff', '#ff66ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) {
            this.speedX = -this.speedX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.speedY = -this.speedY;
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
    }
}

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

const particlesArray = [];
for (let i = 0; i < 50; i++) { 
    particlesArray.push(new Particle());
}

function connect() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 80) { 
                const opacity = 1 - distance / 80;
                ctx.strokeStyle = `rgba(255, 0, 255, ${opacity * 0.3})`; 
                ctx.lineWidth = 0.6; 
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function drawMouseGlow() {
    const glow = ctx.createRadialGradient(mouseX, mouseY, 5, mouseX, mouseY, 40);
    glow.addColorStop(0, 'rgba(255, 0, 255, 0.2)');
    glow.addColorStop(0.5, 'rgba(0, 255, 255, 0.05)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 40, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
}

function animate() {
    ctx.fillStyle = 'rgba(10, 0, 20, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    
    connect();
    
    drawMouseGlow();
    
    requestAnimationFrame(animate);
}

animate();

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    mainContainer.classList.toggle('sidebar-open');
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('open');
    mainContainer.classList.remove('sidebar-open');
});

startChatButton.addEventListener('click', () => {
    welcomeContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    inputContainer.style.display = 'flex'; 
    
    setTimeout(() => {
        addBotMessage("Hi there! I'm PixelChatAI, your Personal AI assistant. How can I help you today?");
    }, 500);
});

function setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            isRecording = true;
            voiceButton.classList.add('recording');
        };
        
        recognition.onresult = function(event) {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            
            messageInput.value = transcript;
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            stopRecording();
        };
        
        recognition.onend = function() {
            stopRecording();
        };
    } else {
        alert('Speech recognition is not supported in your browser. Please try Chrome.');
        voiceButton.style.display = 'none';
    }
}

function startRecording() {
    if (recognition) {
        recognition.start();
    }
}

function stopRecording() {
    if (recognition) {
        recognition.stop();
        isRecording = false;
        voiceButton.classList.remove('recording');
    }
}

voiceButton.addEventListener('click', () => {
    if (!recognition) {
        setupSpeechRecognition();
    }

    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
});

async function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') return;

    addUserMessage(message);

    messageInput.value = '';
    messageInput.style.height = 'auto';

    showTypingIndicator();

    try {
        const botResponse = await getGeminiResponse(message);
        removeTypingIndicator();
        addBotMessage(botResponse);
    } catch (error) {
        console.error('Error getting response:', error);
        removeTypingIndicator();
        addBotMessage("I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.");
    }
}

async function getGeminiResponse(userMessage) {
    try {
        const requestData = {
            contents: [
                {
                    parts: [
                        {
                            text: userMessage
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && 
            data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected API response format:', data);
            return "I'm having trouble processing your request right now. Could you try asking in a different way?";
        }
    } catch (error) {
        console.error('Error with API:', error);
        throw error;
    }
}

function addUserMessage(message) {
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.innerHTML = `
        <div class="message-avatar user-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        </div>
        <div class="message-content">${message}</div>
    `;
    messageContainer.appendChild(userMessageDiv);

    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function addBotMessage(message) {
    const formattedMessage = message.replace(/\n/g, '<br>');
    
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message bot-message';
    botMessageDiv.innerHTML = `
        <div class="message-avatar bot-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff00ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
            </svg>
        </div>
        <div class="message-content">${formattedMessage}</div>
    `;
    messageContainer.appendChild(botMessageDiv);

    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-message';
    typingDiv.innerHTML = `
        <div class="message-avatar bot-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff00ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
            </svg>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    messageContainer.appendChild(typingDiv);

    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingMessage = document.querySelector('.typing-message');
    if (typingMessage) {
        typingMessage.remove();
    }
}

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';

    if (messageInput.scrollHeight > 200) {
        messageInput.style.overflowY = 'auto';
    } else {
        messageInput.style.overflowY = 'hidden';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    messageInput.style.height = 'auto';

    if ('webkitSpeechRecognition' in window) {
        setupSpeechRecognition();
    } else {
        voiceButton.style.display = 'none';
    }

    createParticles();
});

function createParticles() {
    const particlesContainer = document.getElementById('particles');

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 5 + 2;
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.backgroundColor = Math.random() > 0.5 ? '#ff00ff' : '#00ffff';
        particle.style.boxShadow = `0 0 ${size * 2}px ${particle.style.backgroundColor}`;
        
        particle.style.animation = `float ${duration}s linear ${delay}s infinite`;
        
        particlesContainer.appendChild(particle);
    }
}