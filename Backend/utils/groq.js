import "dotenv/config";

const getGroqAPIResponse = async (message) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: message }]
        })
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", options);
    const data = await response.json();

    if (!response.ok || data.error) {
        const errMsg = data.error?.message || "Unknown Groq API error";
        throw new Error(`Groq API error (${response.status}): ${errMsg}`);
    }

    return data.choices[0].message.content;
};

export default getGroqAPIResponse;
