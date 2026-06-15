import { render, useState } from "hono/jsx/dom";

type ChatMessage = {
  role: 'ai' | 'user';
  text: string;
}

function Chat() {
  const [ chatMessages, setChatMessages ] = useState<ChatMessage[]>([]);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);
    const prompt = data.get('prompt') as string;

    setChatMessages(prevMessages => prevMessages.concat({ role: 'user', text: prompt }));

    form.reset();

    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const { text } = await response.json();
    
    setChatMessages(prevMessages => prevMessages.concat({ role: 'ai', text }));
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label for="prompt">Your Prompt</label>
        <textarea id="prompt" rows={3} name="prompt" />
        <button>Submit</button>
      </form>
      <div>
        {chatMessages.map(msg => 
          <article>
            { msg.text }
          </article>
        )}
      </div>
    </>
  )
}

const root = document.getElementById('chat');

if(!root) {
  throw new Error('Root element not found');
}

render(<Chat />, root);