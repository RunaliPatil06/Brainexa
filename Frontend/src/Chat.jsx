import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const getTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const SUGGESTIONS = [
    { icon: "fa-lightbulb",   label: "Explain a concept", text: "Explain how the internet works in simple terms" },
    { icon: "fa-code",        label: "Write code",         text: "Write a JavaScript function to debounce API calls" },
    { icon: "fa-pen-nib",     label: "Help me write",      text: "Write a professional email asking for a project update" },
    { icon: "fa-magnifying-glass", label: "Summarize",     text: "Summarize the key differences between SQL and NoSQL databases" },
];

function Chat({ onSuggestedPrompt }) {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [typingText, setTypingText] = useState(null);
    const bottomRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats, typingText]);

    // Typing animation on latest reply
    useEffect(() => {
        if (reply === null) {
            setTypingText(null);
            return;
        }

        const words = reply.split(" ");
        let idx = 0;
        setTypingText("");

        const interval = setInterval(() => {
            setTypingText(words.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= words.length) {
                clearInterval(interval);
                setTypingText(null);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [reply]);

    if (newChat) {
        return (
            <div className="welcome-screen">
                <div className="welcome-icon">
                    <i className="fa-solid fa-robot"></i>
                </div>
                <div className="welcome-title">Brainexa</div>
                <div className="welcome-sub">Your AI assistant. Ask me anything.</div>

                {/* Suggestion cards */}
                <div className="suggestions-grid">
                    {SUGGESTIONS.map((s, idx) => (
                        <div
                            key={idx}
                            className="suggestion-card"
                            onClick={() => onSuggestedPrompt?.(s.text)}
                        >
                            <i className={`fa-solid ${s.icon} suggestion-icon`}></i>
                            <span className="suggestion-label">{s.label}</span>
                            <span className="suggestion-text">{s.text}</span>
                        </div>
                    ))}
                </div>

                <p className="welcome-hint">
                    <i className="fa-solid fa-keyboard"></i>&nbsp;
                    Press <kbd>Ctrl+K</kbd> anytime to start a new chat
                </p>
            </div>
        );
    }

    const displayChats = typingText !== null ? prevChats.slice(0, -1) : prevChats;

    return (
        <div className="chats">
            {displayChats.map((chat, idx) => (
                <MessageRow key={idx} chat={chat} />
            ))}

            {typingText !== null && (
                <div className="gptDiv">
                    <div className="msg-avatar bot-avatar-msg">
                        <i className="fa-solid fa-robot"></i>
                    </div>
                    <div>
                        <div className="bot-bubble">
                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{typingText}</ReactMarkdown>
                        </div>
                        <p className="msg-time">{getTime()}</p>
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}

function MessageRow({ chat }) {
    if (chat.role === "user") {
        return (
            <div className="userDiv">
                <div>
                    <p className="userMessage">{chat.content}</p>
                    <p className="msg-time">{getTime()}</p>
                </div>
                <div className="msg-avatar user-avatar-msg">
                    <i className="fa-solid fa-user"></i>
                </div>
            </div>
        );
    }

    return (
        <div className="gptDiv">
            <div className="msg-avatar bot-avatar-msg">
                <i className="fa-solid fa-robot"></i>
            </div>
            <div>
                <div className="bot-bubble">
                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
                </div>
                <p className="msg-time">{getTime()}</p>
            </div>
        </div>
    );
}

export default Chat;
