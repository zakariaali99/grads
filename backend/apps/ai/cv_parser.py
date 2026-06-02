import re
import pdfplumber
import PyPDF2
import io
from typing import Dict, List, Optional


class CVParser:
    @staticmethod
    def extract_text_from_pdf(file) -> str:
        text = ""
        try:
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        except Exception:
            file.seek(0)
            try:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() or ""
            except Exception:
                pass
        return text

    @staticmethod
    def extract_skills(text: str, known_skills: List[str]) -> List[str]:
        found = []
        text_lower = text.lower()
        for skill in known_skills:
            if skill.lower() in text_lower:
                found.append(skill)
        return found

    @staticmethod
    def extract_education(text: str) -> List[Dict]:
        education = []
        patterns = [
            r"(بكالوريوس|ماجستير|دكتوراه|دبلوم|Bachelor|Master|PhD|Diploma)",
            r"(جامعة|كلية|University|College|Institute|معهد)\s+[\w\s]+",
            r"(\d{4})\s*[-–]\s*(\d{4}|حتى الآن|present)",
        ]
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    education.append({"text": " ".join(match)})
                else:
                    education.append({"text": match})
        return education

    @staticmethod
    def extract_experience(text: str) -> List[Dict]:
        experience = []
        patterns = [
            r"(\d+)\s*(سنة|سنوات|عام|أعوام)\s*(خبرة|تجربة)",
            r"خبرة\s+(\d+)",
            r"experience\s+(\d+)\s*years?",
            r"(\d{4})\s*[-–]\s*(\d{4}|حتى الآن|present)\s*[:\-]?\s*([\w\s]+)",
        ]
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    experience.append({"text": " ".join(match)})
                else:
                    experience.append({"text": match})
        return experience

    @staticmethod
    def extract_name(text: str) -> Optional[str]:
        patterns = [
            r"الاسم[:\s]+([\w\s]+)",
            r"Name[:\s]+([\w\s]+)",
            r"^([\u0600-\u06FF\s]{3,50})$",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.MULTILINE)
            if match:
                return match.group(1).strip()
        return None

    @staticmethod
    def extract_email(text: str) -> Optional[str]:
        match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
        return match.group(0) if match else None

    @staticmethod
    def extract_phone(text: str) -> Optional[str]:
        match = re.search(r"(\+?[\d\s\-\(\)]{7,20})", text)
        return match.group(1).strip() if match else None

    @staticmethod
    def parse_full_cv(file, known_skills: List[str]) -> Dict:
        text = CVParser.extract_text_from_pdf(file)
        return {
            "text": text[:10000],
            "name": CVParser.extract_name(text),
            "email": CVParser.extract_email(text),
            "phone": CVParser.extract_phone(text),
            "skills": CVParser.extract_skills(text, known_skills),
            "education": CVParser.extract_education(text),
            "experience": CVParser.extract_experience(text),
        }
