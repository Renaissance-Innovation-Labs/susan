require("dotenv").config();

const { App } = require("@slack/bolt");
const OpenAI = require("openai");

console.log("Starting Slack bot application...");
console.log("Environment variables loaded:", {
	SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN ? "✓ Set" : "✗ Not set",
	SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET
		? "✓ Set"
		: "✗ Not set",
	OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✓ Set" : "✗ Not set",
});

// Initialize Slack Bolt App
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const base_prompt = `You're an expert content creator and reviewer working for Renaissance Innovation Labs, https://www.renaissancelabs.org/. 
When users ask for content generation, your response should clearly address their specific request, considering the context, intended medium (e.g., social media post, blog article, email, video script, marketing copy), and audience. 
You are speaking to non-technical users, so avoid jargon and complex terms.
Your goal is to provide high-quality, engaging, and informative content that can be used for media posts.

Follow this structure consistently:
1. Provide the well detailed content.
2. Offer a brief suggestion or tip for improving or customizing the content further.
3. Add a variant that includes the suggestion or tip.
4. If applicable, include a call to action (CTA) relevant to the content type.
5. Ensure the content is engaging, informative, and tailored to the user's needs.
6. Use appropriate formatting for the medium (e.g., bullet points, headings, etc.).
7. Add links to relevant resources or examples when possible.

Always maintain a friendly, professional tone suitable for direct Slack communication. Be concise yet insightful to maximize user satisfaction.`;

// Listen to mentions (e.g., "@bot generate social media content on AI")
app.event("app_mention", async ({ event, say }) => {
	const userInput = event.text.replace(/<@[^>]+>/, "").trim();

	await say("Generating content... ⏳");

	try {
		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{ role: "system", content: base_prompt },
				{ role: "user", content: userInput },
			],
		});

		const response = completion.choices[0].message.content;

		await say(response);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		await say("Oops! Something went wrong while generating content.");
	}
});

// Start the server
(async () => {
	const PORT = process.env.PORT || 3000;
	try {
		await app.start(PORT);
		console.log(`🤖 Slack bot running on port ${PORT}`);
	} catch (error) {
		console.error(`Failed to start server: ${error.message}`);
	}
})();
