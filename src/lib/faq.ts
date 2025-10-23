import { useMemo } from 'react'

export interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
  category: 'general' | 'candidates' | 'employers' | 'technical';
}

export const faqs: FAQ[] = [
  {
    question: "Who can join TalentVault?",
    answer: "TalentVault is open to candidates with education or experience in microelectronics, semiconductor manufacturing, and related fields. For employers, we welcome semiconductor companies, research institutions, and organizations in the microelectronics industry.",
    keywords: ['join', 'signup', 'register', 'eligibility', 'requirements', 'who', 'candidate', 'employer', 'microelectronics', 'semiconductor'],
    category: 'general'
  },
  {
    question: "Is this only for Arizona State University students?",
    answer: "Right now we have opened Talent Vault to all students from Arizona, New Mexico, Utah and Colorado. This is open to community college, and university students within the region",
    keywords: ['join','signup', 'register', 'eligibility', 'requirements', 'who', 'states', 'community college'],
    category: 'general'
  },
  {
    question: "How does the matching process work?",
    answer: "Our platform uses advanced filtering and search capabilities to help employers find candidates based on specific criteria like technical skills, education level, work authorization, and experience. Candidates can showcase their expertise through detailed profiles and verified credentials.",
    keywords: ['matching', 'search', 'filter', 'find', 'skills', 'education', 'experience', 'profile', 'criteria'],
    category: 'employers'
  },
  {
    question: "Is TalentVault free to use?",
    answer: "TalentVault is free for candidates and employers to use. Candidates must create and maintain their profiles. Employers need to request access to view candidate profiles and use the platform's advanced features.",
    keywords: ['free', 'cost', 'price', 'payment', 'access', 'fees', 'pricing'],
    category: 'general'
  },
  {
    question: "How do I get started?",
    answer: "Candidates can begin by requesting access. Once granted access, can begin by creating a profile and uploading their resume. Employers can request access through our contact form, and our team will assist with the onboarding process.",
    keywords: ['start', 'begin', 'create', 'profile', 'resume', 'upload', 'onboarding', 'setup'],
    category: 'general'
  },
  {
    question: "What kind of skills are employers looking for?",
    answer: "Employers in the semiconductor industry typically look for technical skills related to process technologies, equipment operation, software tools, quality control, and manufacturing systems. Soft skills like communication, problem-solving, and teamwork are also highly valued.",
    keywords: ['skills', 'technical', 'soft skills', 'requirements', 'qualifications', 'process', 'equipment', 'software', 'manufacturing'],
    category: 'candidates'
  },
  {
    question: "How can I improve my profile visibility?",
    answer: "Complete all sections of your profile, add relevant technical skills, upload a professional photo, include detailed project descriptions, and keep your information up-to-date. Adding micro-credentials and certifications can also significantly boost your visibility.",
    keywords: ['visibility', 'profile', 'improve', 'optimize', 'photo', 'skills', 'projects', 'credentials', 'certifications'],
    category: 'candidates'
  },
  {
    question: "Can I control who sees my profile?",
    answer: "Yes, you can adjust your profile visibility settings to control who can view your information. Options include public visibility or completely hidden when you're not actively seeking opportunities.",
    keywords: ['privacy', 'visibility', 'settings', 'control', 'hidden', 'public', 'private'],
    category: 'candidates'
  },
  {
    question: "How are candidates verified?",
    answer: "We verify candidate information through a combination of email verification, credential validation, and academic recommendation from faculty. This ensures employers can trust the information presented in candidate profiles.",
    keywords: ['verify', 'verification', 'validation', 'trust', 'background', 'check', 'credentials', 'education'],
    category: 'employers'
  }
];

export function useSearchFaqs(searchQuery: string) {
  return useMemo(() => {
    if (!searchQuery.trim()) return faqs;

    const query = searchQuery.toLowerCase();
    const terms = query.split(' ').filter(term => term.length > 0);

    return faqs.filter(faq => {
      // Search in question and answer
      const content = `${faq.question} ${faq.answer}`.toLowerCase();
      
      // Check if any search term matches content or keywords
      return terms.some(term => 
        content.includes(term) || 
        faq.keywords.some(keyword => keyword.toLowerCase().includes(term))
      );
    });
  }, [searchQuery]);
}

export function useCategoryFaqs(category?: 'general' | 'candidates' | 'employers' | 'technical') {
  return useMemo(() => {
    if (!category) return faqs;
    return faqs.filter(faq => faq.category === category);
  }, [category]);
}