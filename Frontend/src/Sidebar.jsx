import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
    const {
        allThreads, setAllThreads,
        currThreadId, setCurrThreadId,
        setNewChat, setPrompt, setReply, setPrevChats,
        token, user, logout
    } = useContext(MyContext);

    const authHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    const getAllThreads = async () => {
        try {
            const response = await fetch("/api/thread", { headers: authHeaders });
            if (response.status === 401) { logout(); return; }
            const res = await response.json();
            const filteredData = res.map(t => ({ threadId: t.threadId, title: t.title }));
            setAllThreads(filteredData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (token) getAllThreads();
    }, [currThreadId, token]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try {
            const response = await fetch(`/api/thread/${newThreadId}`, { headers: authHeaders });
            if (response.status === 401) { logout(); return; }
            const res = await response.json();
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            await fetch(`/api/thread/${threadId}`, {
                method: "DELETE",
                headers: authHeaders
            });
            setAllThreads(prev => prev.filter(t => t.threadId !== threadId));
            if (threadId === currThreadId) createNewChat();
        } catch (err) {
            console.log(err);
        }
    };

    const getInitials = (title) => {
        if (!title) return "?";
        const words = title.trim().split(" ");
        if (words.length === 1) return words[0][0].toUpperCase();
        return (words[0][0] + words[1][0]).toUpperCase();
    };

    return (
        <section className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <span className="sidebar-title">Brainexa</span>
                <button className="new-chat-btn" onClick={createNewChat} title="New chat">
                    <i className="fa-solid fa-pen-to-square"></i>
                </button>
            </div>

            {/* Logged-in user info */}
            {user && (
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">{user.name}</span>
                        <span className="sidebar-user-email">{user.email}</span>
                    </div>
                </div>
            )}

            {/* Thread list */}
            <p className="threads-label">Conversations</p>
            <ul className="history">
                {allThreads?.map((thread, idx) => (
                    <li
                        key={idx}
                        className={`thread-item ${thread.threadId === currThreadId ? "highlighted" : ""}`}
                        onClick={() => changeThread(thread.threadId)}
                    >
                        <div className="thread-avatar">{getInitials(thread.title)}</div>
                        <div className="thread-info">
                            <div className="thread-name">{thread.title}</div>
                            <div className="thread-preview">AI conversation</div>
                        </div>
                        <i
                            className="fa-solid fa-trash thread-delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteThread(thread.threadId);
                            }}
                        ></i>
                    </li>
                ))}
            </ul>

            {/* Logout */}
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={logout}>
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    Sign Out
                </button>
            </div>
        </section>
    );
}

export default Sidebar;
