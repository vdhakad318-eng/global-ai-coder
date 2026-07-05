// =====================================
// Global AI Coder
// app.js - Part 1
// =====================================

const messages = document.getElementById("messages");
const prompt = document.getElementById("prompt");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");

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

    bubble.innerHTML = marked.parse(text);

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    messages.appendChild(wrapper);

    hljs.highlightAll();

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
