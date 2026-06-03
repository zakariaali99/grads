import io
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_RIGHT, TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
import arabic_reshaper
from bidi.algorithm import get_display

pdfmetrics.registerFont(TTFont("Arabic", "/System/Library/Fonts/SFArabic.ttf"))
pdfmetrics.registerFont(TTFont("ArabicRounded", "/System/Library/Fonts/SFArabicRounded.ttf"))


def reshape(text):
    if not text:
        return ""
    return get_display(arabic_reshaper.reshape(str(text)))


def generate_cv_pdf(graduate, user):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        rightMargin=20*mm, leftMargin=20*mm,
        topMargin=20*mm, bottomMargin=20*mm,
    )

    title_style = ParagraphStyle("Title", fontName="ArabicRounded", fontSize=22, alignment=TA_RIGHT, spaceAfter=4)
    subtitle_style = ParagraphStyle("Subtitle", fontName="Arabic", fontSize=12, alignment=TA_RIGHT, textColor=colors.HexColor("#555555"), spaceAfter=12)
    section_style = ParagraphStyle("Section", fontName="ArabicRounded", fontSize=14, alignment=TA_RIGHT, spaceBefore=12, spaceAfter=6, textColor=colors.HexColor("#1a56db"))
    body_style = ParagraphStyle("Body", fontName="Arabic", fontSize=10, alignment=TA_RIGHT, spaceAfter=4, leading=16)
    small_style = ParagraphStyle("Small", fontName="Arabic", fontSize=9, alignment=TA_RIGHT, textColor=colors.HexColor("#777777"), leading=14)

    story = []

    full_name = user.get_full_name() or user.username
    story.append(Paragraph(reshape(full_name), title_style))

    headline_parts = []
    if graduate.headline:
        headline_parts.append(graduate.headline)
    if graduate.major:
        headline_parts.append(graduate.major)
    if graduate.city:
        headline_parts.append(graduate.city)
    if headline_parts:
        story.append(Paragraph(reshape(" | ".join(headline_parts)), subtitle_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph(reshape("=" * 60), ParagraphStyle("Divider", fontName="Arabic", fontSize=8, alignment=TA_RIGHT, textColor=colors.HexColor("#cccccc"))))
    story.append(Spacer(1, 6))

    if user.bio:
        story.append(Paragraph(reshape("نبذة"), section_style))
        story.append(Paragraph(reshape(user.bio), body_style))
        story.append(Spacer(1, 6))

    education = list(graduate.education.all())
    if education:
        story.append(Paragraph(reshape("التعليم"), section_style))
        for edu in education:
            line = f"{edu.degree or ''} — {edu.field_of_study or ''}"
            if edu.institution:
                line += f" | {edu.institution}"
            story.append(Paragraph(reshape(line), body_style))
            line2 = f"{edu.start_date.strftime('%Y') if edu.start_date else ''} - {edu.end_date.strftime('%Y') if edu.end_date else 'حتى الآن'}"
            if edu.grade:
                line2 += f" | {edu.grade}"
            story.append(Paragraph(reshape(line2), small_style))
        story.append(Spacer(1, 6))

    experience = list(graduate.experience.all())
    if experience:
        story.append(Paragraph(reshape("الخبرات"), section_style))
        for exp in experience:
            line = f"{exp.title} — {exp.company or ''}"
            story.append(Paragraph(reshape(line), body_style))
            line2 = f"{exp.start_date.strftime('%Y') if exp.start_date else ''} - {exp.end_date.strftime('%Y') if exp.end_date else 'حتى الآن'}"
            if exp.location:
                line2 += f" | {exp.location}"
            story.append(Paragraph(reshape(line2), small_style))
            if exp.description:
                story.append(Paragraph(reshape(exp.description), ParagraphStyle("Desc", fontName="Arabic", fontSize=9, alignment=TA_RIGHT, textColor=colors.HexColor("#555555"), leading=14)))
        story.append(Spacer(1, 6))

    skills = graduate.skills.all()
    if skills:
        story.append(Paragraph(reshape("المهارات"), section_style))
        skill_names = [s.name_ar or s.name_en for s in skills]
        story.append(Paragraph(reshape(" • ".join(skill_names)), body_style))
        story.append(Spacer(1, 6))

    projects = list(graduate.projects.all())
    if projects:
        story.append(Paragraph(reshape("المشاريع"), section_style))
        for proj in projects:
            line = proj.title
            if proj.technologies:
                line += f" ({proj.technologies})"
            story.append(Paragraph(reshape(line), body_style))
            if proj.description:
                story.append(Paragraph(reshape(proj.description), ParagraphStyle("ProjDesc", fontName="Arabic", fontSize=9, alignment=TA_RIGHT, textColor=colors.HexColor("#555555"), leading=14)))
        story.append(Spacer(1, 6))

    certifications = list(graduate.certifications.all())
    if certifications:
        story.append(Paragraph(reshape("الشهادات"), section_style))
        for cert in certifications:
            line = f"{cert.name} — {cert.issuer or ''}"
            story.append(Paragraph(reshape(line), body_style))
            if cert.issue_date:
                story.append(Paragraph(reshape(f"تاريخ الإصدار: {cert.issue_date.strftime('%Y-%m-%d')}"), small_style))
        story.append(Spacer(1, 6))

    contact_info = []
    if user.email:
        contact_info.append(f"البريد: {user.email}")
    if user.phone:
        contact_info.append(f"الهاتف: {user.phone}")
    if graduate.linkedin_url:
        contact_info.append(f"LinkedIn: {graduate.linkedin_url}")
    if graduate.github_url:
        contact_info.append(f"GitHub: {graduate.github_url}")
    if contact_info:
        story.append(Paragraph(reshape("معلومات الاتصال"), section_style))
        for info in contact_info:
            story.append(Paragraph(reshape(info), small_style))

    doc.build(story)
    pdf = buf.getvalue()
    buf.close()
    return pdf
