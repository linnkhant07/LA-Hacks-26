# educ-ATE (working title)

AI-powered interactive educational storybook web app for kids with ADHD.

**Hackathon:** LA Hacks 2026 — April 24–26, UCLA Pauley Pavilion
**Team:** 3 developers + 1 designer

---

## What We're Building

A child picks a topic (science, history — demo: **tornadoes** and **pyramids**) and a narrator. The app generates a fully illustrated, narrated educational storybook. While reading, the child can:

1. **Circle objects** in the illustration → AI explains what they circled
2. **Make branching choices** (pre-generated, zero latency)
3. **Draw on a canvas** → gets incorporated into the next scene
4. **Talk to the narrator** live (conversational AI)

High interactivity is intentional and ADHD-specific. The agent also proactively re-engages the child every ~30 seconds of inactivity.

**Narrators:** 3 preset animal characters (fox, owl, bear) OR parent's cloned voice via ElevenLabs.

---

## Prizes to Target

| Prize | Track | How |
|---|---|---|
| **Primary** | Light the Way (Aramco) — education equity + accessibility | Core concept |
| ElevenLabs MLH (wireless earbuds) | Voice cloning + conversational AI | Dev 2 work |
| MongoDB Atlas MLH (IoT Kit) | Story storage | Dev 1 work |
| Cloudinary MLH ($500/member) | Image storage + delivery | Dev 1 work |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + Framer Motion |
| Backend | Next.js API routes (same repo) |
| Story generation | Gemini |
| Image generation | Gemini (Imagen 3) |
| Image storage | Cloudinary |
| Voice narration | ElevenLabs TTS Turbo v2.5 |
| Voice cloning | ElevenLabs Voice Cloning API |
| Conversational AI | ElevenLabs Conversational AI (WebSocket, full-duplex) |
| Circle/draw understanding | Gemini Vision API |
| Database | MongoDB Atlas |
| Canvas | HTML5 Canvas API (browser native) |
| Animations | Framer Motion parallax on still images |
| Deployment | Vercel |

> **DO NOT use video generation** (Sora/Veo/Runway) — too slow, too unreliable for demo. Use Framer Motion parallax on still images instead.

---

## Story JSON Schema

This is the contract — all devs use this exact shape.

```json
{
  "title": "string",
  "topic": "string",
  "narrator": {
    "type": "animal | custom",
    "character": "fox | owl | bear | custom",
    "voice_id": "string (ElevenLabs voice_id)"
  },
  "pages": [
    {
      "page_id": "string",
      "narration": "string",
      "image_prompt": "string",
      "image_url": "string (Cloudinary)",
      "audio_url": "string (ElevenLabs)",
      "hotspots": [
        {
          "object": "string",
          "bbox": [x1, y1, x2, y2]
        }
      ],
      "choice": null
        | {
          "question": "string",
          "option_a": {
            "label": "string",
            "pages": ["...page objects"]
          },
          "option_b": {
            "label": "string",
            "pages": ["...page objects"]
          }
        }
    }
  ],
  "cyu": [
    {
      "type": "voice | drag | draw",
      "question": "string"
    }
  ]
}
```

---

## Context Object

Pass this on every Gemini/AI call for coherent, ADHD-aware responses.

```json
{
  "topic": "string",
  "current_page": "string",
  "branch_taken": "string | null",
  "story_so_far": "string",
  "narrator_character": "string",
  "educational_facts_covered": ["string"],
  "adhd_mode": true
}
```

---

## API Routes

| Route | Method | Input | Output |
|---|---|---|---|
| `/api/generate` | POST | `topic`, `narrator` | Full story JSON (all branches pre-generated, all image prompts, all narration text) |
| `/api/circle` | POST | Cropped image + page context | Explanation text + audio URL |
| `/api/talk` | POST | Transcript + story context | Response text + audio URL |
| `/api/draw` | POST | Canvas PNG + story context | New page JSON + image URL + audio URL |
| `/api/clone-voice` | POST | Audio recording | `voice_id` |
| `/api/story/:id` | GET | — | Saved story from MongoDB |

---

## Team Split

| Person | Owns |
|---|---|
| **Dev 1** | Story pipeline (`/api/generate`), Imagen 3, Cloudinary, MongoDB |
| **Dev 2** | ElevenLabs everything — TTS, voice cloning, conversational AI WebSocket, proactive agent |
| **Dev 3** | Frontend — Next.js pages, storybook viewer, Canvas overlay, choice modal, API wiring |
| **Designer** | Figma prototype → assets → works with Dev 3 on UI → demo script → Devpost page |

> **KEY RULE:** Dev 3 is never blocked. Use hardcoded fake JSON until Dev 1 is ready. Use browser `speechSynthesis` until Dev 2 is ready.

---

## Build Phases

### Phase 1 — Tonight (target: done by ~4am)

1. LLM generates full story JSON with all branches
2. Imagen 3 generates ALL page images in parallel (including all branches)
3. ElevenLabs TTS generates ALL narration audio in parallel
4. Everything saved to MongoDB
5. Frontend: onboarding form + storybook viewer renders page 1 with real data
6. Choose path works instantly (pre-loaded, zero latency)

**Milestone:** One complete tornado story plays end to end.

### Phase 2 — Tomorrow (full day)

1. Circle/click: Canvas overlay → crop region → Gemini Vision → ElevenLabs speaks explanation
2. Talk to agent: mic button → ElevenLabs STT → Gemini (+ context) → ElevenLabs TTS responds
3. Proactive agent: fires every ~30s of inactivity, re-engages child with a relevant question
4. Draw feature: Canvas → PNG → Gemini Vision → Imagen 3 → new page influenced by drawing
5. Polish all animations
6. Demo prep

---

## Demo Strategy

- **Pre-generate 2 complete stories** before demo: tornadoes + pyramids
- Demo runs on cached stories — zero generation wait, zero failure risk
- Live generation shown as bonus at the end
- A broken live generation with perfect cached demo **still wins**
- A failed live demo **loses**

---

## What NOT to Build

These are future features — mention on Devpost only, do not implement:

- Video generation
- User accounts / login / auth
- Mobile responsive design
- Hand gesture detection
- Perfect cross-session memory
- Parent dashboard
