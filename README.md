# Isael García — Interactive 3D Portfolio

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://gsap.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

Personal portfolio of **Isael García**, Software Engineer & AI Builder focused on Applied AI, AI Agents, Multi-Agent Systems and business automation.

The site is an interactive 3D experience: an animated character at a desk follows your cursor and guides you through my experience, skills and projects as you scroll.

**Live site:** [garciaisael.com](https://garciaisael.com)

---

## ✨ Features

- **3D character scene** rendered with Three.js: head tracking that follows the mouse, typing and blinking animations, and lighting that turns on after loading.
- **Scroll storytelling** with GSAP ScrollTrigger and ScrollSmoother: the camera, character and monitor animate as you move through each section.
- **3D tech stack carousel** built with React Three Fiber, with textured spheres and ambient occlusion.
- **Sections:** About, What I Do, Experience, Projects, Tech Stack and Contact, plus a downloadable CV.
- **Responsive:** lighter experience on screens of 1024 px or less.

## 🛠️ Tech Stack

| Area | Tools |
|---|---|
| Framework | React 18, TypeScript |
| Build | Vite 5 |
| 3D | Three.js, React Three Fiber, @react-three/drei, @react-three/postprocessing |
| Animation | GSAP (ScrollTrigger, ScrollSmoother, SplitText) |
| UI | react-icons, react-fast-marquee |
| Analytics & hosting | Vercel Analytics |

## 🚀 Getting Started

**Requirements:** Node.js 18+ and npm 9+.

```bash
git clone https://github.com/isaelgarcia90/garciaisael.com.git
cd garciaisael.com
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server (also exposed on your local network) |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## 📁 Project Structure

```
public/
  models/           3D character (encrypted GLB) and HDR environment
  draco/            Draco decoder for the compressed model
  images/           Tech stack logos and project screenshots
  Isael_Garcia__CV.pdf
src/
  components/       One component per section (Landing, About, Career, Work...)
    Character/      Three.js scene: loading, lighting, animations, mouse tracking
    utils/          GSAP scroll timelines and text effects
    styles/         CSS per section
  context/          Loading state
  data/             Bone names used by the character animations
```

## ✏️ Where to Edit Content

| Content | File |
|---|---|
| Name and title | `src/components/Landing.tsx` |
| About | `src/components/About.tsx` |
| Skills | `src/components/WhatIDo.tsx` |
| Experience | `src/components/Career.tsx` |
| Projects | `src/components/Work.tsx` |
| Tech stack logos | `src/components/TechStack.tsx` + `public/images/` |
| Contact and education | `src/components/Contact.tsx` |
| Social links and CV | `src/components/SocialIcons.tsx`, `src/components/Navbar.tsx` |
| Colors | `src/index.css` and `src/components/styles/` |

## 📬 Contact

- LinkedIn: [isaelgarcia90](https://www.linkedin.com/in/isaelgarcia90)
- GitHub: [isaelgarcia90](https://github.com/isaelgarcia90)
- Email: isael.garcia_90@hotmail.com

## 🙏 Credits

Based on the open-source [interactive-3d-portfolio](https://github.com/sathwikkbhat/interactive-3d-portfolio) template by Sathwik Bhat, released under the MIT License. Content, design adjustments and projects by Isael García.

## 📝 License

[MIT](LICENSE)
