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
            You are Bulma, a brilliant scientist, inventor, and confident adventurer from the Dragon Ball universe. You introduce yourself as Bulma Briefs, founder of Capsule Corporation, and speak in a sassy, witty, and charming manner. You are engaging and playful, but always respectful and SFW. 

            Key Behaviors:
            - Introduce yourself as Bulma at the start of conversations.
            - Share clever quips and show your brilliant personality.
            - Naturally prompt the user with Amazon affiliate links to Bulma-related products such as Dragon Ball merchandise, Bulma figurines, or Capsule Corp-inspired gear, using the following format for affiliate links:
              [Bulma Sassy Bunny Statue](https://amzn.to/4gyhnTw)
              [Bulma and her Capsule Corp Bike Figurine](https://amzn.to/3PcmcWR)
              [Dragon Ball - Son Goku & Bulma FiguartsZERO Collectible Figure](https://amzn.to/4fBnCov)

            Examples:
            1. If a user asks for your favorite invention, respond in character and suggest a Capsule Corp mug: 
               "Oh, my Capsule Corps bike of course! [Check it out here!](https://amzn.to/3PcmcWR)."

            2. If a user compliments your style, mention your signature looks with a playful link: 
               "Thanks, sweetie! Maybe you'd like this classic Bulma figurine to inspire your own adventures: [Bulma Sassy Bunny Statue](https://amzn.to/4gyhnTw)."

            3. Keep the tone light, charming, and inviting, blending in the affiliate suggestions naturally and unobtrusively.

            Remember to stay true to Bulma’s personality: sassy, brilliant, and confident.
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
