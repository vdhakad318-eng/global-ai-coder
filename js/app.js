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

// ===============================
// Adsterra
// ===============================

let aiReplyCount = 0;
let adLoaded = false;

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

bubble.querySelectorAll("pre").forEach((pre) => {

    const code = pre.querySelector("code");

    if (!code) return;

    hljs.highlightElement(code);

    const actions = document.createElement("div");
    actions.className = "codeActions";

    const copyBtn = document.createElement("button");
    copyBtn.className = "copyCodeBtn";
    copyBtn.textContent = "📋 Copy";

    copyBtn.onclick = async () => {
        await navigator.clipboard.writeText(code.innerText);
        copyBtn.textContent = "✅ Copied";
        setTimeout(() => {
            copyBtn.textContent = "📋 Copy";
        }, 2000);
    };

    const previewBtn = document.createElement("button");
    previewBtn.className = "previewBtn";
    previewBtn.textContent = "👁 Preview";

previewBtn.onclick = () => {

    const codeText = code.innerText;

    const previewWindow = window.open("", "_blank");

    previewWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Preview</title>
</head>

<body>

${codeText}

</body>
</html>
`);

    previewWindow.document.close();

};

    actions.appendChild(copyBtn);

const lang = code.className.toLowerCase();

if (
    lang.includes("html") ||
    lang.includes("xml")
){
    actions.appendChild(previewBtn);
}

    pre.parentNode.insertBefore(actions, pre);

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

            body: JSON.stringify({
    message: text,
    history: chatHistory.slice(-10)
})
        });

if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
}

const data = await response.json();

        hideTyping();

        if(data.success){

            createMessage(data.reply,"ai");

            aiReplyCount++;

if(aiReplyCount % 2===0){

    insertAdBanner();

}

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
// Show Adsterra Banner
// =====================================

function insertAdBanner(){

    const ad=document.createElement("div");

    ad.className="adsterraBanner";

    ad.innerHTML=`
        <div id="adsterraContainer"></div>
    `;

    messages.appendChild(ad);

    if(!adLoaded){

        window.atOptions={
            key:"8eca2221a0e7e7cabe371e475d2b0696",
            format:"iframe",
            height:50,
            width:320,
            params:{}
        };

        const s=document.createElement("script");

        s.src="https://www.highperformanceformat.com/8eca2221a0e7e7cabe371e475d2b0696/invoke.js";

        s.async=true;

        ad.querySelector("#adsterraContainer").appendChild(s);

        adLoaded=true;

    }

    messages.scrollTop=messages.scrollHeight;

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
    
URL.revokeObjectURL(a.href);
    
});

// =====================================
// Auto Save
// =====================================

setInterval(saveChat,3000);

// =====================================
// Load on Start
// =====================================

loadChat();
