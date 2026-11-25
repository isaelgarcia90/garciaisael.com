# Narration (Listen button)

The "Listen" button next to the color mode menu plays a narrated tour, one clip per section, and scrolls to the next section when each clip ends. Code: `src/components/NarrationButton.tsx`.

- Audio: `public/audio/narration-1.mp3` … `narration-6.mp3` (Landing, About, What I do, Career, My work, Contact).
- Generated once with ElevenLabs: voice "Luis Guillermo" (`gwk2CKlAQ1B4a2RPxJoF`, native Mexican Spanish voice from the ElevenLabs library, reading English), model `eleven_v3`, `mp3_44100_128`, stability 0.5 ("Natural"). Each script is sent with the audio tag `[strong Mexican Spanish accent] ` in front, so the English sounds clearly Mexican and not native. The scripts are written in simple B2-level English.
- The API key is never used by the site and never goes in the repo or Vercel.
- To change a clip: regenerate it with the same settings, replace the file, and bump `AUDIO_VERSION` in `src/components/NarrationButton.tsx` (audio is cached for a year).

## Scripts
### 1. Landing (~22 s)
Hi, I'm Isael Garcia. I'm a software engineer and AI builder from Mexico City. I have more than ten years of experience making software for cars, retail stores and telecom companies. Now I work with AI: agents, multi-agent systems and automated workflows. They help businesses sell more and give better service to their customers. Let me show you my work.

### 2. About (~21 s)
I have a master's degree in Computer Science, and I like to learn by building things. Right now, I'm building a sales platform. In this platform, AI agents talk with customers and find the good leads, using the company's own information with RAG. The idea is simple: the sales team can spend their time closing deals, not answering the same questions all day.

### 3. What I do (~26 s)
I work in two areas. First, software engineering: I help teams design, integrate, test and fix software, from start to end. I use mostly Python, C and C++ on Linux. Second, applied AI: I build automation for customer service, sales and operations. I use language models, RAG, AI agents, MCP and n8n workflows, running in the cloud.

### 4. Career (~29 s)
I started my career at Ericsson. There, I automated network reports for the LTE launch of Verizon. At Continental, I made software in C for construction and agriculture machines. At Toshiba, I worked on point-of-sale systems with Linux. Then, for six years at Capgemini, I worked on features for Ford cars and requirements for the Renault electric car. Since 2025, I work independently as an AI engineer. And recently, I won third place in Clara's AI Hackathon in Mexico.

### 5. My work (~29 s)
Here are two of my projects. The first one is forzeswater.com, a website for a water treatment business. Now it's growing into a sales and customer service platform with many AI agents. They answer questions about the products, take the customer needs, start quotes and follow up the sales. The second one is alanisael.com, a fundraising website and app for my son's soccer dream, with donations by Stripe and PayPal, and a penalty game.

### 6. Contact (~14 s)
Do you have a process that can work by itself? Or a sales team with too many repeated questions? Let's talk. Click "Get a quote" and tell me about your AI project, or find me on LinkedIn, GitHub or Instagram. Thank you for listening.
