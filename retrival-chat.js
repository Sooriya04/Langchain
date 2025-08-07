require("dotenv").config();
(async () => {
  try {
    const fs = await import("fs/promises");
    const pdfParse = (await import("pdf-parse")).default;
    const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
    const { RecursiveCharacterTextSplitter } = await import(
      "langchain/text_splitter"
    );
    const { Document } = await import("langchain/document");
    const { MemoryVectorStore } = await import("langchain/vectorstores/memory");
    const { FakeEmbeddings } = await import("langchain/embeddings/fake");
    const { ChatPromptTemplate } = await import("@langchain/core/prompts");
    const { StructuredOutputParser } = await import("langchain/output_parsers");
    const { createStuffDocumentsChain } = await import(
      "langchain/chains/combine_documents"
    );

    // Load PDF
    const fileBuffer = await fs.readFile("test/data/05-versions-space.pdf");

    const pdfData = await pdfParse(fileBuffer);

    // Create LangChain Document
    const docs = [
      new Document({
        pageContent: pdfData.text,
        metadata: { source: "berserk.pdf" },
      }),
    ];

    // Split the document
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // Create vector store with fake embeddings
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      new FakeEmbeddings()
    );

    // Create retriever
    const retriever = vectorStore.asRetriever();

    // Question to ask
    const question = "Tell me about hero of the berserk";

    // Retrieve relevant docs
    const retrievedDocs = await retriever.getRelevantDocuments(question);

    // Initialize Gemini model
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0.7,
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Define parser and prompt
    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      answer: "Answer to the user's question",
      summary: "Short summary of the topic",
    });

    const formatInstructions = parser.getFormatInstructions();

    const prompt = ChatPromptTemplate.fromTemplate(`
        You are a helpful AI. Use the context below to answer the question.

        Context:{context}
        Question: {input}
        {format_instructions}
    `);

    // Create chain
    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt: prompt,
    });

    // Run the chain
    const rawResponse = await chain.invoke({
      input: question,
      context: retrievedDocs,
      format_instructions: formatInstructions,
    });

    // Parse response
    const result = await parser.parse(rawResponse.toString());

    // Output
    console.log("\nQuestion:", question);
    console.log("\nAnswer:\n", result.answer);
    console.log("\nSummary:\n", result.summary);
  } catch (err) {
    console.error(" Error:", err.message);
  }
})();
