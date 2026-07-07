import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useCallback } from "react";
import { v1 as uuidv1 } from "uuid";

function ChatWindow() {
    const {
        prompt, setPrompt,
        reply, setReply,
        currThreadId, setCurrThreadId,
        setPrevChats, setNewChat, newChat,
        allThreads, token, logout,
        sidebarOpen, toggleSidebar
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const currentThread = allThreads?.find(t => t.threadId === currThreadId);
    const headerName = newChat ? "New Conversation" : (currentThread?.title || "Conversation");

    // Start a fresh chat
    const createNewChat = useCallback(() => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setIsOpen(false);
    }, [setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats]);

    // Ctrl+K shortcut to start new chat
    useEffect(() => {
        const handleKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                createNewChat();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [createNewChat]);

    // When reply arrives, append assistant message to chat
    useEffect(() => {
        if (reply === null) return;
        setPrevChats(prev => [...prev, { role: "assistant", content: reply }]);
    }, [reply]);

    const sendMessage = async (messageText) => {
        const text = messageText || prompt;
        if (!text.trim() || loading) return;
        setLoading(true);
        setNewChat(false);
        setReply(null);

        setPrevChats(prev => [...prev, { role: "user", content: text }]);
        setPrompt("");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: text, threadId: currThreadId })
            });

            if (response.status === 401) { logout(); return; }

            const res = await response.json();
            setReply(!response.ok ? `Error: ${res.error}` : res.reply);
        } catch (err) {
            console.log(err);
            setReply("Error: Could not reach the server.");
        }

        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chatWindow">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-left">
                    {/* Sidebar toggle button */}
                    <button
                        className="sidebar-toggle-btn"
                        onClick={toggleSidebar}
                        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    >
                        <i className={`fa-solid ${sidebarOpen ? "fa-bars-staggered" : "fa-bars"}`}></i>
                    </button>
                    <div className="chat-header-avatar">
                        <i className="fa-solid fa-robot"></i>
                    </div>
                    <div>
                        <div className="chat-header-name">{headerName}</div>
                        <div className="chat-header-status">Online</div>
                    </div>
                </div>

                <div className="chat-header-actions">
                    {/* New Chat button — always visible in header */}
                    <button className="new-chat-header-btn" onClick={createNewChat} title="New chat (Ctrl+K)">
                        <i className="fa-solid fa-plus"></i>
                        <span>New Chat</span>
                    </button>

                    <div className="chat-header-right">
                        <div className="user-avatar-btn" onClick={() => setIsOpen(!isOpen)}>
                            <i className="fa-solid fa-user"></i>
                        </div>
                        {isOpen && (
                            <div className="dropDown">
                                <div className="dropDownItem" onClick={createNewChat}>
                                    <i className="fa-solid fa-plus"></i> New Chat
                                </div>
                                <div className="dropDownItem">
                                    <i className="fa-solid fa-gear"></i> Settings
                                </div>
                                <div className="dropDownItem" onClick={logout}>
                                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-body">
                <Chat onSuggestedPrompt={sendMessage} />

                {/* Typing indicator */}
                {loading && (
                    <div className="typing-indicator">
                        <div className="msg-avatar bot-avatar-msg" style={{
                            width: 30, height: 30, minWidth: 30,
                            borderRadius: "50%", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontSize: 12, backgroundColor: "var(--card)",
                            color: "var(--accent)", border: "1px solid rgba(250,204,21,0.3)"
                        }}>
                            <i className="fa-solid fa-robot"></i>
                        </div>
                        <div className="typing-bubble">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input bar */}
            <div className="chat-input-area">
                <div className="input-row">
                    <input
                        placeholder="Type a message...  (Ctrl+K for new chat)"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <div className="send-btn" onClick={() => sendMessage()}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>
                <p className="input-hint">Brainexa can make mistakes. Verify important info.</p>
            </div>
        </div>
    );
}

export default ChatWindow;
