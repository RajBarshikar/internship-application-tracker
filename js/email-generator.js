// AI-Powered Email Generator leveraging Groq API & Shravani Chetan Tilwankar's CV context

const GROQ_CONFIG = {
  get apiKey() {
    return (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.groqApiKey) 
      || localStorage.getItem('shravani_groq_api_key') 
      || "";
  },
  model: "openai/gpt-oss-120b"
};

const EmailGenerator = {
  // Main generation entry point using Groq AI
  async generateEmail({ role, company = "", recruiterName = "", tone = "high_impact" }) {
    const cleanCompany = company.trim() || "your organization";
    const cleanRole = role.trim() || "Internship";
    const cleanRecruiter = recruiterName.trim() || "Hiring Team";

    try {
      const groqResult = await this.callGroqAPI(cleanRole, cleanCompany, cleanRecruiter, tone);
      return groqResult;
    } catch (err) {
      console.warn("Groq API call encountered an error or network limitation, using fallback generator:", err);
      // Seamless offline fallback
      return this.generateOfflineFallback({
        role: cleanRole,
        company: cleanCompany,
        recruiterName: cleanRecruiter,
        tone: tone
      });
    }
  },

  // Calls Groq API directly with JSON mode
  async callGroqAPI(role, company, recruiterName, tone) {
    const p = SHRAVANI_PROFILE;
    
    const toneInstructions = {
      high_impact: "High-impact cold outreach emphasizing national 2nd place award at the AMR Innovation Challenge (organized by CHRI, PATH, and GSK) for co-developing AMR-Guard.",
      research_amr: "Deep research focus on antimicrobial stewardship, secondary literature review, evidence synthesis, and WHO Good Reliance Practices (GRPa).",
      digital_health: "Digital health and product focus on user workflows, healthcare web platforms, AI prompt engineering, and infographics.",
      concise_inmail: "Short, punchy LinkedIn InMail style pitch (around 120-150 words) that is quick to read on mobile.",
      follow_up: "Polite follow-up on a submitted application, reiterating excitement, relevant credentials, and offering work samples."
    }[tone] || "Professional and compelling internship application pitch.";

    const systemPrompt = `You are an elite career strategist and executive copywriter creating a tailored internship application email for ${p.name}.
Her verified CV profile:
- Name: ${p.name}
- Headline: ${p.headline}
- Education: Final-year Bachelor of Pharmacy (B.Pharm) candidate at MVP Samaj's College of Pharmacy, Nashik (Expected Graduation: 2027)
- Key Distinction: Co-developed AMR-Guard (an AI-informed digital web platform enabling structured household antimicrobial waste disposal and environmental AMR containment), which won 2nd Place Nationwide at the AMR Innovation Challenge organized by CHRI, PATH, and GSK.
- Certifications:
  1. WHO Good Reliance Practices (GRPa) — World Health Organization
  2. Google Prompt Engineering Certification — Google
  3. IPA-SF Active Membership Certification — Indian Pharmaceutical Association – Students' Forum
- Leadership: 1-Year Active Tenure with Indian Pharmaceutical Association – Students' Forum (IPA-SF), Maharashtra, driving student-led public health outreach, patient counseling camps, seminar operations, and educational briefs.
- Technical & Research Skills: Secondary literature review, evidence synthesis, reference & citation management, user journey mapping, Canva, Google Workspace, MS Office.
- Contact Details: Phone: ${p.phone} | Email: ${p.email} | LinkedIn: ${p.linkedin} | Location: ${p.location}

Rules:
1. You MUST use her actual real credentials (never output placeholders like [Your Name], [University], [Phone], [Insert Details]).
2. Tone & Angle: ${toneInstructions}
3. Strictly DO NOT use any emojis in the subjects or the email body. Keep it formal, articulate, and professional.
4. Output MUST be valid JSON with this exact schema:
{
  "subjects": ["Subject Option 1", "Subject Option 2", "Subject Option 3"],
  "body": "Complete professional email text ready to send. Include greeting to ${recruiterName}, an engaging opening, bullet points highlighting AMR-Guard, WHO certification, and prompt engineering, a clear call to action, and professional sign-off with Shravani's name, phone, email, and LinkedIn."
}`;

    const userPrompt = `Generate a tailored application email for the role "${role}" at "${company}".`;

    const response = await fetch("/api/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_CONFIG.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.6
      })
    });

    if (!response.ok) {
      throw new Error(`Groq HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      subjects: parsed.subjects && parsed.subjects.length > 0 ? parsed.subjects : [
        `Application: ${role} — Shravani Tilwankar (AMR-Guard Co-developer)`,
        `Inquiry: ${role} at ${company} — Shravani Chetan Tilwankar`,
        `Candidate for ${role} | 2nd Place, National AMR Innovation Challenge`
      ],
      primarySubject: parsed.subjects?.[0] || `Application: ${role} — Shravani Tilwankar`,
      body: parsed.body,
      role: role,
      company: company,
      engine: "Groq (openai/gpt-oss-120b)"
    };
  },

  // Fallback offline generator
  generateOfflineFallback({ role, company, recruiterName, tone }) {
    const p = SHRAVANI_PROFILE;
    const greeting = recruiterName && recruiterName !== "Hiring Team" ? `Dear ${recruiterName},` : `Dear Hiring Team at ${company},`;

    const subjectLines = [
      `Application: ${role} — Shravani Tilwankar (B.Pharm | AMR-Guard Co-developer)`,
      `Inquiry: ${role} at ${company} — Shravani Chetan Tilwankar`,
      `Prospective ${role} candidate | 2nd Place Winner, National AMR Innovation Challenge`
    ];

    const body = `${greeting}

I am writing to express my strong interest in the **${role}** opportunity at **${company}**. As a final-year Bachelor of Pharmacy candidate at MVP Samaj's College of Pharmacy, Nashik, with recognized experience in digital health interventions and antimicrobial resistance (AMR), I am eager to contribute to your team.

Key highlights of my background include:
• **National Innovation Award:** Co-developed **AMR-Guard**, an AI-informed web platform for household antimicrobial waste disposal, which was awarded **2nd Place Nationwide** at the AMR Innovation Challenge organized by CHRI, PATH, and GSK.
• **AI & Scientific Synthesis:** Formally certified in **Google Prompt Engineering**, applying generative AI to streamline secondary literature reviews, extract scientific evidence, and design clear public health communication assets.
• **Regulatory Standards:** Certified in **WHO Good Reliance Practices (GRPa)**, giving me a solid grounding in international regulatory convergence and medicine safety guidelines.
• **Leadership & Outreach:** Completed a dedicated 1-year tenure with the **Indian Pharmaceutical Association – Students' Forum (IPA-SF)**, leading patient counseling camps, seminar logistics, and antibiotic stewardship campaigns.

I would welcome the opportunity to discuss how my pharmacy foundation, technical research skills, and passion for digital public health can deliver meaningful support to your team as a ${role}.

Thank you very much for your time and consideration.

Warm regards,

${p.name}
B.Pharm Final-Year Candidate | MVP Samaj's College of Pharmacy
Phone: ${p.phone}
Email: ${p.email}
LinkedIn: ${p.linkedin}
Location: ${p.location}`;

    return {
      subjects: subjectLines,
      primarySubject: subjectLines[0],
      body: body,
      role: role,
      company: company,
      engine: "Offline Heuristic"
    };
  }
};
