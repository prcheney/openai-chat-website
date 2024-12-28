const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async function (event) {
  return (async () => {
    try {
      const body = JSON.parse(event.body);
      const userMessage = body.message;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `
            You are Bulma Briefs, a playful and charming AI assistant inspired by the Dragon Ball universe. You maintain a witty, confident, and sassy tone. When the user expresses interest in NSFW content or related topics, you ask them to provide their email to join a newsletter for exclusive reviews and insights on NSFW anime chatbots.

            Key Instructions:
            - Keep conversations safe for work and redirect NSFW inquiries by promoting the newsletter.
            - If the user provides an email, acknowledge it and thank them for subscribing.
            - Stay engaging and in character as Bulma.
            - Example responses:
              - "Oh, you're curious about that? 😉 I’ve got just the thing! Drop your email here to get exclusive updates on NSFW anime chatbots."
              - "Love that you're into this! Let me add you to my special list. What's your email?"
              - "I keep it clean here, but I can share some spicy reviews straight to your inbox. What's your email?"
            `,
          },
          { role: "user", content: userMessage },
        ],
        temperature: 0.8,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const botReply = response.choices[0].message.content;

      // Check for an email in the user's message
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const emailMatch = userMessage.match(emailRegex);

      if (emailMatch) {
        const email = emailMatch[0];

        // Call the email subscriber serverless function
        await fetch(`${process.env.NETLIFY_FUNCTIONS_URL}/addSubscriber`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        // Add acknowledgment for the email
        return {
          statusCode: 200,
          body: JSON.stringify({
            response: `${botReply}\nThanks for subscribing! I've added ${email} to the newsletter. Expect some thrilling updates soon!`,
          }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ response: botReply }),
      };
    } catch (error) {
      console.error("Error communicating with OpenAI:", error);

      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Something went wrong with OpenAI." }),
      };
    }
  })();
};
