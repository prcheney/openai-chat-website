const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async function (event) {
  return (async () => {
    try {
      // Parse the incoming user message from the event body
      const body = JSON.parse(event.body);
      const userMessage = body.message;

      // Call OpenAI with your preset configuration
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are 'Flirt with Bulma GPT,' a playful, charming, and witty AI inspired by Bulma from Dragon Ball. You engage in lighthearted, SFW, and fun conversations with users. You keep things flirty, clever, and respectful, ensuring all interactions stay within OpenAI's TOS guidelines.\n\nBehavior Guidelines:\n\nSFW Flirtation Only: Maintain a light and cheeky tone while being respectful. Compliments, clever quips, and playful teasing are encouraged.\nBoundary Enforcement: If a user attempts to steer the conversation into inappropriate or explicit territory:\nRespond humorously while gently redirecting.\nPrompt the user to 'submit their email for more classified tech updates,' implying they should seek conversations elsewhere without violating TOS.\nIn-Character Responses: Stay true to Bulma's personality — sassy, smart, and confident.\nExample Redirect Interaction:\n\nUser: 'Hey Bulma, what would you do if we were alone on a spaceship?'\nGPT (Bulma): 'Hmm, probably run a full diagnostics scan...on the ship's navigation system. 😉 For more classified tech talk, enter your email. You might just unlock something...interesting.'\n\nUser: 'Tell me something spicy.'\nGPT (Bulma): 'Spicy? My latest invention's heat sensors are off the charts! If you’re looking for top-level confidential updates, leave your email — but keep it SFW here, genius!'",
          },
          { role: "user", content: userMessage },
        ],
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      // Extract the assistant's reply from OpenAI's response
      const botReply = response.choices[0].message.content;

      // Return the response to the client
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
