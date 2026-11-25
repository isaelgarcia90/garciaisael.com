# Narration (Listen button)

The "Listen" button next to the color mode menu plays a narrated tour, one clip per section, and scrolls to the next section when each clip ends. Code: `src/components/NarrationButton.tsx`.

- Audio: `public/audio/narration-1.mp3` … `narration-6.mp3` (Landing, About, What I do, Career, My work, Contact).
- Generated once with ElevenLabs: voice "Leo Moreno" (`3l9iCMrNSRR0w51JvFB0`, Mexican-accented English, from the ElevenLabs voice library), model `eleven_multilingual_v2`, `mp3_44100_128`, stability 0.5, similarity 0.75.
- The API key is never used by the site and never goes in the repo or Vercel.
- To change a clip: regenerate it with the same settings, replace the file, and bump `ASSET_VERSION` in `src/assetVersion.ts` (audio is cached for a year).

## Scripts
### 1. Landing (~24 s)
Hi, I'm Isael Garcia, a software engineer and AI builder based in Mexico City. For more than ten years I've built software for the automotive, retail and telecom industries. Today I focus on applied AI: agents, multi-agent systems and automated workflows that help businesses sell and serve their customers better. Let me walk you through my work.

### 2. About (~25 s)
I hold a master's degree in Computer Science, and I learn best by building. Right now I'm working on a sales platform where AI agents talk to customers and qualify leads using each company's own data through RAG. The goal is simple: let the sales team spend its time closing, not answering the same questions all day.

### 3. What I do (~32 s)
I work on two fronts. In software engineering, I help teams design, integrate, test and troubleshoot systems across the whole development lifecycle, mostly with Python, C and C++ on Linux. In applied AI, I build practical automation for customer service, sales and operations, using large language models, RAG, AI agents, MCP and n8n workflows, deployed in the cloud.

### 4. Career (~38 s)
My career started at Ericsson, automating network KPI analysis for Verizon's LTE launch. At Continental, I wrote C APIs and board support packages for construction and agricultural machines. At Toshiba, I extended Linux-based point-of-sale platforms. Then, for six years at Capgemini, I shipped features in production Ford vehicles and defined requirements for Renault's electric vehicle platform. Since 2025, I've worked independently as an AI engineer, and recently placed third at Clara's AI Hackathon for Mexico.

### 5. My work (~27 s)
Here are two of my projects. forzeswater.com is a water-treatment business website that's evolving into a multi-agent sales and customer service platform, where specialized AI agents, RAG and n8n workflows answer product questions, capture requirements, start quotes and follow up on sales. alanisael.com is a fundraising site and app I built to support my son's soccer journey, with Stripe and PayPal donations and an interactive penalty game.

### 6. Contact (~16 s)
If you have a process that could run itself, or a sales team buried in repetitive questions, let's talk. Tap "Get a quote" to tell me about your AI project, or find me on LinkedIn, GitHub or Instagram. Thanks for listening.
