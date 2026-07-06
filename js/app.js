// =====================================
// Global AI Coder
// app.js - Part 1
// =====================================

const messages = document.getElementById("messages");
const prompt = document.getElementById("prompt");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");

if (!messages || !prompt || !sendBtn || !typingIndicator) {
    console.error("Required HTML elements not found.");
    throw new Error("HTML IDs mismatch.");
}

// Chat History
let chatHistory = [];

// ----------------------------
// Create Message
// ----------------------------
function createMessage(text, type) {

    const wrapper = document.createElement("div");
    wrapper.className = `message ${type}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerHTML = type === "user" ? "👤" : "🤖";

    const bubble = document.createElement("div");
    bubble.className = "bubble";

bubble.innerHTML = window.marked ? marked.parse(text) : text;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    messages.appendChild(wrapper);

bubble.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
});

    messages.scrollTop = messages.scrollHeight;
}

// ----------------------------
// Typing Animation
// ----------------------------
function showTyping(){

    typingIndicator.style.display="flex";

    messages.scrollTop=messages.scrollHeight;

}

function hideTyping(){

    typingIndicator.style.display="none";

}

// ----------------------------
// Send Message
// ----------------------------
async function sendMessage(){

    const text = prompt.value.trim();

    if(text==="") return;

    createMessage(text,"user");

    chatHistory.push({
    role:"user",
    content:text
});

saveChat();

prompt.value="";

showTyping();

    try{

        const response = await fetch("/api/chat",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                message:text

            })

        });

        const data = await response.json();

        hideTyping();

        if(data.success){

            createMessage(data.reply,"ai");

            chatHistory.push({

    role:"assistant",

    content:data.reply

});

saveChat();

        }else{

            createMessage(
                "❌ "+(data.error || "Unknown Error"),
                "ai"
            );

        }

    }catch(err){

        hideTyping();

        createMessage(

            "❌ Server Error\n\n"+err.message,

            "ai"

        );

    }

}

// =====================================
// Event Listeners
// =====================================

// Send Button
sendBtn.addEventListener("click", sendMessage);

// Enter Key
prompt.addEventListener("keydown", function(e){

    if(e.key==="Enter" && !e.shiftKey){

        e.preventDefault();

        sendMessage();

    }

});

// =====================================
// Save Chat
// =====================================

function saveChat(){

    localStorage.setItem(

        "global_ai_chat",

        JSON.stringify(chatHistory)

    );

}

// =====================================
// Load Chat
// =====================================

function loadChat(){

    const data=localStorage.getItem(

        "global_ai_chat"

    );

    if(!data) return;

try {
    chatHistory = JSON.parse(data);
} catch {
    chatHistory = [];
}

    messages.innerHTML="";

    chatHistory.forEach(msg=>{

        createMessage(

            msg.content,

            msg.role==="user"

            ?"user"

            :"ai"

        );

    });

}

// =====================================
// New Chat
// =====================================

document

.getElementById("newChatBtn")

.addEventListener("click",()=>{

messages.innerHTML="";

chatHistory=[];

localStorage.removeItem(

"global_ai_chat"

);

});

// =====================================
// Clear Chat
// =====================================

document

.getElementById("clearChat")

.addEventListener("click",()=>{

messages.innerHTML="";

chatHistory=[];

localStorage.removeItem(

"global_ai_chat"

);

});

// =====================================
// Export Chat
// =====================================

document

.getElementById("downloadChat")

.addEventListener("click",()=>{

let text="";

chatHistory.forEach(msg=>{

text+=

msg.role.toUpperCase()

+":\n"

+msg.content

+"\n\n";

});

const blob=new Blob(

[text],

{

type:"text/plain"

}

);

const a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="chat.txt";

a.click();

});

// =====================================
// Auto Save
// =====================================

setInterval(saveChat,3000);

// =====================================
// Load on Start
// =====================================

loadChat();
