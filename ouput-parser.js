require("dotenv").config();

(async () => {
  const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
  const { ChatPromptTemplate } = await import("@langchain/core/prompts");
  const { StructuredOutputParser } = await import("langchain/output_parsers");

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.7,
    apiKey: process.env.GEMINI_API_KEY,
  });

  const parser = StructuredOutputParser.fromNamesAndDescriptions({
    philosophy: "The full philosophical reflection",
    summary: "A one-line simple summary of the philosophy",
  });

  const formatInstructions = parser.getFormatInstructions();

  const prompt = ChatPromptTemplate.fromTemplate(
    `You are an ancient philosopher. Share a simple and easy-to-read philosophy based on the following concept: {input}.\n{format_instructions}`
  );

  const chain = prompt.pipe(model).pipe(parser);

  const res = await chain.invoke({
    input: "weight of regrets",
    format_instructions: formatInstructions,
  });

  console.log("Philosophy:\n", res.philosophy);
  console.log("\nSummary:\n", res.summary);
})();
