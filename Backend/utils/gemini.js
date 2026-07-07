import "dotenv/config";

const getGeminiAPIResponse = async (message) => {
    const apiKey = process.env.GEMINI_API_KEY;

    // Auth keys (AQ. prefix) use Bearer header; standard keys (AIza prefix) use query param
    const isAuthKey = apiKey.startsWith("AQ.");
    const url = isAuthKey
        ? "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const headers = {
        "Content-Type": "application/json",
        ...(isAuthKey && { "Authorization": `Bearer ${apiKey}` }),
        ...(!isAuthKey && { "x-goog-api-key": apiKey })
    };

    const options = {
        method: "POST",
        headers,
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: message }]
                }
            ]
        })
    };

    const response = await fetch(url, options);
    const data = await response.json();

    // Surface Gemini API errors clearly
    if (!response.ok || data.error) {
        const errMsg = data.error?.message || "Unknown Gemini API error";
        throw new Error(`Gemini API error (${response.status}): ${errMsg}`);
    }

    if (!data.candidates || !data.candidates[0]) {
        throw new Error("Gemini returned no candidates. Check your API key and quota.");
    }

    return data.candidates[0].content.parts[0].text;
};

export default getGeminiAPIResponse;
