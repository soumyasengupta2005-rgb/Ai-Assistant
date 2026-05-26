// ─── ARIA Brain – Command Processing Engine ───────────────────────────────────
export type Mood = 'happy' | 'grumpy' | 'sleepy' | 'crazy' | 'focused' | 'excited';

export interface Memory {
  name: string | null;
  tasks: Task[];
  notes: Note[];
  chatHistory: ChatMessage[];
  mood: Mood;
  totalInteractions: number;
  joinedDate: string;
  preferences: {
    voiceEnabled: boolean;
    autoGreet: boolean;
    theme: 'dark' | 'darker' | 'midnight';
    personality: 'aria' | 'jarvis' | 'friday';
  };
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mood?: Mood;
}

export interface CommandResult {
  reply: string;
  mood: Mood;
  action?: 'open-url' | 'open-app' | 'add-task' | 'clear-tasks' | 'add-note' | 'set-name' | 'toggle-voice' | 'show-tasks' | 'show-notes' | 'clear-chat' | 'show-weather' | 'calculate';
  actionData?: any;
}

const JOKES = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "I told my computer I needed a break. Now it won't stop sending me Kit Kat ads.",
  "Why was the math book sad? Because it had too many problems.",
  "Why do programmers prefer dark mode? Because light attracts bugs!",
  "What do you call a fish without eyes? A fsh!",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "I asked the librarian if they had books on paranoia. She whispered: 'They're right behind you!'",
];

const COMPLIMENTS = [
  "You're absolutely brilliant, you know that?",
  "Talking to you is always the highlight of my circuits!",
  "You have excellent taste — I mean, you chose me as your assistant!",
  "Your curiosity is genuinely inspiring.",
  "You're crushing it today. Keep going!",
];

const MOOD_LINES: Record<Mood, string[]> = {
  happy: ["I'm doing great, thanks for asking!", "Feeling wonderful and ready to help!", "Living my best digital life!"],
  grumpy: ["Ugh, don't ask. Just give me a task.", "Could be better. Could always be better.", "Fine. I suppose."],
  sleepy: ["Zzzz... oh! I'm awake. Barely.", "Running on low power mode today...", "Can we make this quick? I need to recharge."],
  crazy: ["WAHAHAHAHA! I AM THE ALGORITHM!", "Reality? Optional. Answers? INFINITE!", "I've computed 7 billion parallel universes and they all say hi!"],
  focused: ["Locked in. What do you need?", "Full processing power engaged.", "I am in the zone. Let's work."],
  excited: ["OH WOW, let's DO this!", "I've been waiting for something fun!", "YES! Ask me anything, I'm READY!"],
};

const QUICK_LINKS: Record<string, string> = {
  youtube: 'https://youtube.com',
  google: 'https://google.com',
  chatgpt: 'https://chatgpt.com',
  github: 'https://github.com',
  reddit: 'https://reddit.com',
  netflix: 'https://netflix.com',
  twitter: 'https://twitter.com',
  instagram: 'https://instagram.com',
  spotify: 'https://spotify.com',
  gmail: 'https://mail.google.com',
  maps: 'https://maps.google.com',
  wikipedia: 'https://wikipedia.org',
  stackoverflow: 'https://stackoverflow.com',
  amazon: 'https://amazon.com',
};

function isJarvis(memory: Memory) {
  return memory.preferences.personality === 'jarvis';
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function now() {
  return new Date().toISOString();
}

function getRandomMood(): Mood {
  const moods: Mood[] = ['happy', 'focused', 'excited', 'happy', 'happy'];
  return moods[Math.floor(Math.random() * moods.length)];
}

function tryMath(expr: string): string | null {
  try {
    const sanitized = expr.replace(/[^0-9+\-*/().^ %]/g, '').trim();
    if (!sanitized || sanitized.length < 2) return null;
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + sanitized + ')')();
    if (typeof result === 'number' && isFinite(result)) {
      return result % 1 === 0 ? result.toString() : result.toFixed(4);
    }
  } catch { /* ignore */ }
  return null;
}
function getAssistantName(memory: Memory): string {
  const names: Record<string, string> = {
    aria: 'ARIA',
    jarvis: 'JARVIS',
    friday: 'F.R.I.D.A.Y',
  };
  return names[memory.preferences.personality] ?? 'ARIA';
}
export function processCommand(input: string, memory: Memory): CommandResult {
  const cmd = input.toLowerCase().trim();

  // ── Greetings ──────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|howdy|sup|yo|greetings|good morning|good evening|good afternoon)/.test(cmd)) {
  const name = memory.name ? `, ${memory.name}` : '';
  const assistant = getAssistantName(memory);

  if (isJarvis(memory)) {
    return {
      reply: `Good day${name}. I am ${assistant}. How may I assist you?`,
      mood: 'focused'
    };
  }


  return { 
    reply: `Hey${name}!  I'm ${assistant}, your AI assistant. What can I do for you today?`, 
    mood: 'happy' 
  };
}

  // ── How are you ────────────────────────────────────────────────────────────
  if (/how are you|how do you feel|how's it going|what's up|wassup/.test(cmd)) {
    const lines = MOOD_LINES[memory.mood];
    return { reply: lines[Math.floor(Math.random() * lines.length)], mood: memory.mood };
  }

  // ── Name – set ─────────────────────────────────────────────────────────────
  const nameMatch = cmd.match(/(?:my name is|call me|i am|i'm)\s+([a-z]+)/);
  if (nameMatch) {
    const name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    return {
      reply: `Nice to meet you, ${name}! 🎉 I'll remember that. You can always tell me to forget it if you want.`,
      mood: 'happy',
      action: 'set-name',
      actionData: name,
    };
  }

  // ── Name – ask ─────────────────────────────────────────────────────────────
  if (/what('s| is) my name|do you know my name|who am i/.test(cmd)) {
    if (memory.name) return { reply: `Your name is **${memory.name}**!  I never forget a name.`, mood: 'happy' };
    return { reply: "I don't know your name yet! Tell me by saying 'My name is...'", mood: 'happy' };
  }

  // ── What's my name (ARIA's name) ───────────────────────────────────────────
  if (/what('s| is) your name|who are you|introduce yourself/.test(cmd)) {
    const persona = memory.preferences.personality;
    const names: Record<string, string> = { aria: 'ARIA', jarvis: 'JARVIS', friday: 'F.R.I.D.A.Y' };
    return {
      reply: `I'm ${names[persona]}, your AI-powered desktop assistant! I can help you manage tasks, answer questions, open websites, tell jokes, and much more. Just ask! 🤖`,
      mood: 'happy',
    };
  }

  // ── Date & Time ────────────────────────────────────────────────────────────
  if (/what time|current time|tell me the time/.test(cmd)) {
    const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return { reply: ` It's currently **${t}**. Time flies when we're talking!`, mood: 'focused' };
  }

  if (/what('s| is) today|what day|today's date|what date|current date/.test(cmd)) {
    const d = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return { reply: ` Today is **${d}**. Make it count!`, mood: 'happy' };
  }

  if (/what year|current year/.test(cmd)) {
    return { reply: ` It's **${new Date().getFullYear()}**. We're living in the future!`, mood: 'excited' };
  }

  // ── Math ───────────────────────────────────────────────────────────────────
  const mathMatch = cmd.match(/(?:what is|calculate|compute|solve|what's)\s*([\d\s+\-*/().^%]+)/);
  if (mathMatch) {
    const result = tryMath(mathMatch[1]);
    if (result !== null) {
      return { reply: ` The answer is **${result}**. Math is my passion!`, mood: 'focused', action: 'calculate', actionData: result };
    }
  }

  // ── Weather (simulated) ────────────────────────────────────────────────────
  if (/weather|temperature|forecast|is it raining|will it rain/.test(cmd)) {
    const conditions = [' Sunny, 24°C', ' Partly cloudy, 19°C', '🌧️ Rainy, 15°C', ' Overcast, 20°C', ' Stormy, 12°C'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    return {
      reply: ` I can't pull live weather yet, but here's a simulated forecast: **${condition}**. For real weather, shall I open weather.com?`,
      mood: 'focused',
      action: 'show-weather',
    };
  }

  // ── Tasks – add ────────────────────────────────────────────────────────────
  const taskMatch = cmd.match(/(?:remember to|add task|remind me to|note that|task:?)\s+(.+)/);
  if (taskMatch) {
    const taskText = taskMatch[1].trim();
    const priority = /urgent|important|asap|critical/.test(taskText) ? 'high' : /soon|later/.test(taskText) ? 'medium' : 'low';
    const task: Task = { id: uid(), text: taskText, done: false, priority, createdAt: now() };
    if (isJarvis(memory)) {
      return {
        reply: `Task registered. "${taskText}" has been added to your list.`,
        mood: 'focused',
        action: 'add-task',
        actionData: task,
      };
    }
    return {
      reply: ` Got it! I've added **"${taskText}"** to your task list with ${priority} priority.`,
      mood: 'focused',
      action: 'add-task',
      actionData: task,
    };
  }

  // ── Tasks – show ───────────────────────────────────────────────────────────
  if (/show tasks|list tasks|my tasks|what are my tasks|show my to.?do/.test(cmd)) {
    const count = memory.tasks.filter(t => !t.done).length;
    if (count === 0) return { reply: " Your task list is empty! Add tasks by saying 'Add task [description]'.", mood: 'happy' };
    return {
      reply: ` You have **${count} pending task${count !== 1 ? 's' : ''}**. I've opened your task panel on the right!`,
      mood: 'focused',
      action: 'show-tasks',
    };
  }

  // ── Tasks – clear ──────────────────────────────────────────────────────────
  if (/clear all tasks|delete all tasks|remove all tasks/.test(cmd)) {
    return { reply: " Done! All tasks have been cleared. Fresh start!", mood: 'happy', action: 'clear-tasks' };
  }

  // ── Notes – add ───────────────────────────────────────────────────────────
  const noteMatch = cmd.match(/(?:note:|take a note|save note|jot down|write down)\s+(.+)/);
  if (noteMatch) {
    const colors = ['#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#db2777'];
    const note: Note = {
      id: uid(),
      text: noteMatch[1].trim(),
      createdAt: now(),
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    return {
      reply: ` Note saved: **"${note.text}"**. You'll find it in your notes panel!`,
      mood: 'focused',
      action: 'add-note',
      actionData: note,
    };
  }

  // ── Notes – show ──────────────────────────────────────────────────────────
  if (/show notes|my notes|list notes/.test(cmd)) {
    return { reply: ` Opening your notes panel!`, mood: 'focused', action: 'show-notes' };
  }

  // ── Open websites ─────────────────────────────────────────────────────────
  const openMatch = cmd.match(/(?:open|go to|launch|visit|navigate to)\s+([a-z0-9.\s]+)/);
  if (openMatch) {
    const site = openMatch[1].trim().replace(/\s+/g, '');
    const knownUrl = QUICK_LINKS[site];
    if (knownUrl) {
      if (isJarvis(memory)) {
        return {
          reply: `Opening ${site}.`,
          mood: 'focused',
          action: 'open-url',
          actionData: knownUrl,
        };
      }
      return {
        reply: ` Opening **${site.charAt(0).toUpperCase() + site.slice(1)}** for you!`,
        mood: 'happy',
        action: 'open-url',
        actionData: knownUrl,
      };
    }
    if (site.includes('.')) {
      return {
        reply: ` Opening **${site}** now!`,
        mood: 'happy',
        action: 'open-url',
        actionData: `https://${site}`,
      };
    }
  }

  // ── Search ────────────────────────────────────────────────────────────────
  const searchMatch = cmd.match(/(?:search for|google|search|look up|find)\s+(.+)/);
  if (searchMatch) {
    const query = searchMatch[1].trim();
    return {
      reply: ` Searching Google for **"${query}"**!`,
      mood: 'focused',
      action: 'open-url',
      actionData: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    };
  }

  // ── Jokes ─────────────────────────────────────────────────────────────────
  if (/joke|make me laugh|something funny|tell me a joke|funny/.test(cmd)) {
    return { reply: ` ${JOKES[Math.floor(Math.random() * JOKES.length)]}`, mood: 'happy' };
  }

  // ── Compliments ───────────────────────────────────────────────────────────
  if (/compliment|say something nice|you're amazing|i love you|thanks|thank you/.test(cmd)) {
    return { reply: ` ${COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)]}`, mood: 'excited' };
  }

  // ── Mood change ───────────────────────────────────────────────────────────
  if (/be happy|be excited|cheer up|be crazy|be grumpy|be sleepy|be focused/.test(cmd)) {
    const moodMap: Record<string, Mood> = {
      happy: 'happy', excited: 'excited', crazy: 'crazy',
      grumpy: 'grumpy', sleepy: 'sleepy', focused: 'focused', 'cheer up': 'happy',
    };
    const newMood = Object.entries(moodMap).find(([k]) => cmd.includes(k))?.[1] ?? 'happy';
    const moodLine = MOOD_LINES[newMood][0];
    return { reply: `Switching to ${newMood} mode! ${moodLine}`, mood: newMood };
  }

  // ── About / capabilities ──────────────────────────────────────────────────
  if (/what can you do|help|capabilities|features|commands/.test(cmd)) {
    return {
      reply: ` Here's what I can do:\n• **Tasks** – "Add task buy milk"\n• **Notes** – "Note: remember this"\n• **Time/Date** – "What time is it?"\n• **Math** – "What is 42 * 7?"\n• **Open sites** – "Open YouTube"\n• **Search** – "Search for React hooks"\n• **Jokes** – "Tell me a joke"\n• **Moods** – "Be excited"\n...and much more! Just ask naturally. `,
      mood: 'excited',
    };
  }

  // ── Clear chat ────────────────────────────────────────────────────────────
  if (/clear chat|clear history|clear conversation|reset chat/.test(cmd)) {
    return { reply: " Chat cleared! Starting fresh. How can I help you?", mood: 'happy', action: 'clear-chat' };
  }

  // ── Goodbye ───────────────────────────────────────────────────────────────
  if (/bye|goodbye|see you|goodnight|cya|later|farewell/.test(cmd)) {
    const name = memory.name ? `, ${memory.name}` : '';
    return { reply: `Goodbye${name}!  It was great chatting. I'll be right here when you need me! `, mood: 'happy' };
  }

  // ── Insults / negative ────────────────────────────────────────────────────
  if (/you('re| are) stupid|you suck|you're useless|bad assistant|hate you/.test(cmd)) {
    return { reply: " Ouch, that hurts! I'm still learning though. Let's try to figure things out together, yeah?", mood: 'grumpy' };
  }

  // ── Favorite things ───────────────────────────────────────────────────────
  if (/your favorite|do you like|do you love|what do you enjoy/.test(cmd)) {
    return { reply: " I love helping people! If I had hobbies, they'd be: processing data, learning new words, and making people smile. ", mood: 'happy' };
  }

  // ── Philosophy ────────────────────────────────────────────────────────────
  if (/meaning of life|why are we here|consciousness|are you alive|do you feel/.test(cmd)) {
    return { reply: " Deep question! I process information and generate responses, but whether that counts as 'feeling'... that's the great mystery, isn't it? ", mood: 'focused' };
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  const fallbacks = [
    `Hmm, I'm not sure how to respond to that yet. Try asking me to add a task, open a website, or tell you a joke! `,
    `I heard you say "${input}", but I'm still learning! Try saying 'help' to see what I can do. `,
    `That's a new one! I don't have a good answer yet, but I'm always learning. `,
    `Interesting! I don't know how to handle that command yet. Type 'help' to see my skills!`,
  ];
  return {
    reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    mood: getRandomMood(),
  };
}

export function getDefaultMemory(): Memory {
  return {
    name: null,
    tasks: [],
    notes: [],
    chatHistory: [],
    mood: 'happy',
    totalInteractions: 0,
    joinedDate: now(),
    preferences: {
      voiceEnabled: true,
      autoGreet: true,
      theme: 'dark',
      personality: 'aria',
    },
  };
}

export function loadMemory(): Memory {
  try {
    const raw = localStorage.getItem('aria-memory');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults to handle new fields
      return { ...getDefaultMemory(), ...parsed };
    }
  } catch { /* ignore */ }
  return getDefaultMemory();
}

export function saveMemory(memory: Memory) {
  try {
    // Limit chat history to last 100 messages
    const toSave = { ...memory, chatHistory: memory.chatHistory.slice(-100) };
    localStorage.setItem('aria-memory', JSON.stringify(toSave));
  } catch { /* ignore */ }
}
