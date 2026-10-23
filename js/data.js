// Portfolio and Resume data extracted from Shravani Chetan Tilwankar's CV
const SHRAVANI_PROFILE = {
  name: "Shravani Chetan Tilwankar",
  badge: "B.Pharm Final-Year Candidate",
  headline: "Digital Health & AMR Innovations | Product & Technical Research",
  location: "Nashik, Maharashtra, India",
  phone: "+91 9265230327",
  email: "shravanitilwankar2005@gmail.com",
  linkedin: "https://www.linkedin.com/in/shravani-chetan-tilwankar-35604730a",
  linkedinDisplay: "linkedin.com/in/shravani-chetan-tilwankar",
  about: "Final-year Bachelor of Pharmacy (B.Pharm) candidate with proven hands-on experience in digital health interventions, antimicrobial resistance (AMR), and public health communication. Recognized by CHRI, PATH, and GSK (2nd Place, National Innovation Challenge) for co-developing AMR-Guard, a digital web platform addressing household antimicrobial waste disposal. Certified in WHO Good Reliance Practices and Google Prompt Engineering. Completed a year-long active tenure with the Indian Pharmaceutical Association – Students’ Forum (IPA-SF), leading community health campaigns, event logistics, and public health communication. Seeking internship opportunities in Digital Health, AMR surveillance initiatives, product documentation, and digital public health research.",
  
  targetDivision: "Digital Health, Product Development & Public Health Research",
  
  education: [
    {
      degree: "Bachelor of Pharmacy (B.Pharm)",
      status: "Final-Year Candidate",
      institution: "MVP Samaj's College of Pharmacy",
      location: "Nashik, Maharashtra",
      graduation: "Expected Graduation: 2027",
      highlight: "Specialized focus on antimicrobial stewardship, drug regulatory guidelines & digital public health tools."
    }
  ],

  experience: [
    {
      role: "Product Research & Content Contributor",
      project: "AMR-Guard",
      company: "Nexus T-Gen Intelligence Lab",
      period: "2026 – Present",
      type: "Remote",
      highlightBadge: "2nd Place Nationwide — AMR Innovation Challenge",
      points: [
        "Researched, conceptualized, and contributed functional workflows for AMR-Guard, an AI-informed digital web platform enabling structured household antimicrobial waste disposal and environmental AMR containment.",
        "Won 2nd Place nationwide at the AMR Innovation Challenge organized by CHRI, PATH, and GSK.",
        "Conducted structured literature reviews on antimicrobial stewardship, environmental hazards of pharmaceutical waste, and medicine return protocols.",
        "Designed user-facing educational assets, infographics, and LinkedIn carousels to translate complex microbiological and AMR data for general audiences.",
        "Leveraged AI prompt engineering to streamline scientific literature synthesis and evidence extraction."
      ]
    }
  ],

  leadership: [
    {
      role: "Active Member (1-Year Tenure)",
      organization: "Indian Pharmaceutical Association – Students’ Forum (IPA-SF)",
      chapter: "Maharashtra Chapter",
      points: [
        "Completed a year-long active membership tenure driving student-led public health outreach, patient counseling camps, and awareness initiatives focused on rational medicine use and antibiotic stewardship.",
        "Managed end-to-end event operations, scheduling, speaker coordination, and student volunteer teams for state- and college-level pharmacy seminars and health workshops.",
        "Spearheaded campaign communications, authoring educational briefs, digital health explainers, and outreach materials to enhance community health literacy."
      ]
    }
  ],

  certifications: [
    {
      title: "AMR-Guard Web Platform",
      issuer: "CHRI, PATH & GSK Innovation Challenge (2nd Place Nationwide)",
      description: "Digital health solution designed to mitigate AMR through organized pharmaceutical return mechanisms and consumer education.",
      icon: "trophy"
    },
    {
      title: "WHO Good Reliance Practices (GRPa)",
      issuer: "World Health Organization (WHO)",
      description: "Regulatory reliance, quality standards, and modern pharmaceutical oversight frameworks.",
      icon: "award"
    },
    {
      title: "Google Prompt Engineering Certification",
      issuer: "Google",
      description: "Advanced generative AI workflows, prompt optimization, structured literature synthesis.",
      icon: "sparkles"
    },
    {
      title: "IPA-SF Active Membership Certification",
      issuer: "Indian Pharmaceutical Association – Students’ Forum",
      description: "Recognized for 1-year active service in student-led health advocacy & public operations.",
      icon: "shield-check"
    }
  ],

  skills: {
    domain: [
      "Antimicrobial Resistance (AMR)",
      "Antimicrobial Stewardship",
      "Pharmaceutical & Biomedical Waste",
      "Medicine Safety",
      "WHO Good Reliance Practices (GRPa)"
    ],
    researchProduct: [
      "Secondary Literature Review",
      "Evidence Synthesis",
      "Reference & Citation Management",
      "User Journey Mapping",
      "Functional Product Workflows"
    ],
    technicalTools: [
      "AI Prompt Engineering",
      "Google Workspace",
      "MS Office (Word, PowerPoint, Excel)",
      "Canva",
      "Digital Health Assets Creation"
    ],
    leadership: [
      "Public Health Communication",
      "Cross-Functional Team Coordination",
      "Event Operations & Logistics",
      "Campaign Planning & Outreach"
    ],
    languages: [
      { name: "English", level: "Fluent / Professional" },
      { name: "Marathi", level: "Native" },
      { name: "Hindi", level: "Fluent" },
      { name: "Telugu", level: "Conversational" }
    ]
  }
};

// Start with ZERO dummy data as requested by the user
const INITIAL_APPLICATIONS = [];

// Quick suggestions for company and role auto-fill
const COMMON_COMPANIES = [
  "CHRI (Centre for Health Research and Innovation)",
  "PATH",
  "GlaxoSmithKline (GSK)",
  "World Health Organization (WHO) India",
  "IQVIA",
  "Abbott Healthcare",
  "Sun Pharma",
  "Cipla",
  "Dr. Reddy's Laboratories",
  "Serum Institute of India",
  "Lupin Pharmaceuticals",
  "Piramal Healthcare",
  "Novartis India",
  "Pfizer"
];

const COMMON_ROLES = [
  "Digital Health Intern",
  "AMR Research & Content Intern",
  "Product Development Intern",
  "Public Health Communication Intern",
  "Clinical Research Associate Intern",
  "Regulatory Affairs / GRPa Intern",
  "Scientific Literature Reviewer",
  "Medical Writing Intern"
];
