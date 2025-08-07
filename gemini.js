require("dotenv").config();
(async () => {
  const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    maxOutputTokens: 2048,
    apiKey: process.env.GEMINI_API_KEY,
  });

  await model
    .invoke("write a poem about HER")
    .then((res) => {
      console.log(res.text);
    })
    .catch((err) => {
      console.error(err.message);
    });
})();
