from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.graduates.models import SkillCategory, Skill, College, GraduateProfile, GraduateSkill, Education, Certification, Experience, Project
from apps.employers.models import Industry, CompanyProfile
from apps.jobs.models import JobCategory, JobPost, JobApplication, Interview, SavedJob
from apps.notifications.models import Notification
from apps.chat.models import Conversation, Message
from apps.ads.models import Advertisement
from datetime import date, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = "Fills the database with realistic dummy data"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")

        # ── Admin ──
        admin, _ = User.objects.get_or_create(
            username="admin", defaults=dict(
                email="admin@jreejoon.ly", user_type="admin",
                is_verified=True, is_active=True, is_superuser=True, is_staff=True,
            )
        )
        admin.set_password("admin123")
        admin.save()
        admin.profile_completion = 100
        admin.save(update_fields=["profile_completion"])
        self.stdout.write("  ✓ Admin user created (admin / admin123)")

        # ── Skill Categories & Skills ──
        cat_data = {
            "تطوير البرمجيات": ["Python", "JavaScript", "TypeScript", "Java", "C#", "PHP", "Ruby", "Go", "Rust", "Kotlin", "Swift", "Dart"],
            "تطوير الويب": ["React", "Vue.js", "Angular", "Next.js", "Node.js", "Django", "Laravel", "ASP.NET", "Flask", "FastAPI", "Spring Boot", "Express.js"],
            "تطوير التطبيقات": ["Flutter", "React Native", "Android SDK", "iOS SDK", "Xamarin"],
            "قواعد البيانات": ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis", "Elasticsearch", "MariaDB", "Oracle"],
            " DevOps والبنية التحتية": ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "Ansible", "Jenkins", "GitLab CI", "GitHub Actions"],
            "الشبكات والأمن": ["CCNA", "CCNP", "Kali Linux", "Wireshark", "Nmap", "Metasploit", "OWASP", "Burp Suite"],
            "الذكاء الاصطناعي": ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy"],
            "التصميم": ["Figma", "Adobe XD", "Photoshop", "Illustrator", "UI/UX", "After Effects", "Premiere Pro"],
            "إدارة المشاريع": ["PMI", "PMP", "Agile", "Scrum", "JIRA", "Trello", "Asana", "Microsoft Project"],
            "المهارات الإدارية": ["Microsoft Office", "Excel Advanced", "Power BI", "Tableau", "SAP", "Oracle ERP", "HR Management"],
        }
        self.stdout.write("  Creating skill categories and skills...")
        for cat_name, skill_names in cat_data.items():
            cat, _ = SkillCategory.objects.get_or_create(name_ar=cat_name)
            for sname in skill_names:
                Skill.objects.get_or_create(name_ar=sname, category=cat)

        # ── Colleges ──
        colleges_data = [
            ("كلية الهندسة", "ENG"),
            ("كلية تقنية المعلومات", "IT"),
            ("كلية العلوم", "SCI"),
            ("كلية الطب", "MED"),
            ("كلية الاقتصاد", "ECO"),
            ("كلية الآداب", "ART"),
            ("كلية القانون", "LAW"),
            ("كلية التربية", "EDU"),
            ("كلية الهندسة الكهربائية", "EE"),
            ("كلية علوم الحاسوب", "CS"),
        ]
        self.stdout.write("  Creating colleges...")
        for name, code in colleges_data:
            College.objects.get_or_create(name_ar=name, code=code, city="طرابلس")

        # ── Industries ──
        industries = [
            "تقنية المعلومات", "الاتصالات", "المالية والمصرفية", "التعليم",
            "الصحة", "النفط والغاز", "البناء والتشييد", "النقل والخدمات اللوجستية",
            "السياحة والضيافة", "الإعلام", "الطاقة المتجددة", "الزراعة",
        ]
        self.stdout.write("  Creating industries...")
        for ind in industries:
            Industry.objects.get_or_create(name_ar=ind)

        # ── Job Categories ──
        job_cats = [
            "تطوير البرمجيات", "هندسة الشبكات", "أمن المعلومات", "تحليل البيانات",
            "التصميم", "التسويق", "المالية", "الموارد البشرية", "الإدارة",
            "التعليم", "الاستشارات", "الصيانة",
        ]
        self.stdout.write("  Creating job categories...")
        for i, jc in enumerate(job_cats):
            JobCategory.objects.get_or_create(name_ar=jc, sort_order=i)

        skills_pool = list(Skill.objects.all())
        colleges_pool = list(College.objects.all())

        # ── Graduate Users ──
        grad_first_names = ["محمد", "أحمد", "علي", "عمر", "خالد", "سارة", "فاطمة", "نور", "مريم", "أسماء", "حسن", "حسين", "يوسف", "إبراهيم", "عبدالله", "ليلى", "هدى", "منى", "رنا", "سامي"]
        grad_last_names = ["السالمي", "القذافي", "المصراتي", "الزنتاني", "الورفلي", "المقريف", "الكيب", "الجهمي", "الطويل", "باعامر", "الفيتوري", "الشريف", "بن سليمان", "العائش", "الدرسي", "شنيب", "بوشناف", "الغويل", "المنفي", "بن سالم"]
        cities = ["طرابلس", "بنغازي", "مصراتة", "الخمس", "زوارة", "سبها", "طبرق", "درنة", "البيضاء", "غريان"]
        degrees = ["بكالوريوس", "ماجستير", "دكتوراه"]
        majors = ["علوم حاسوب", "هندسة برمجيات", "نظم معلومات", "ذكاء اصطناعي", "شبكات", "هندسة كهربائية", "هندسة ميكانيكية", "إدارة أعمال", "محاسبة", "رياضيات"]
        companies = ["ليبيا تك", "المتكاملة", "الحلول المتقدمة", "تقانة", "إبداع", "الجيل الجديد", "العنقاء", "سدرة", "الأندلس", "المستقبل"]

        self.stdout.write("  Creating graduate users...")
        graduate_users = []
        for i in range(30):
            fn = random.choice(grad_first_names)
            ln = random.choice(grad_last_names)
            username = f"graduate{i+1}"
            email = f"graduate{i+1}@email.com"
            user, created = User.objects.get_or_create(
                username=username,
                defaults=dict(
                    email=email, first_name=fn, last_name=ln, user_type="graduate",
                    is_verified=random.random() > 0.3, is_active=True,
                    gender=random.choice(["male", "female"]),
                    phone=f"+21891{random.randint(1000000,9999999)}",
                    bio=f"خريج {random.choice(majors)} مهتم بتطوير المهارات والعمل في مجال التقنية",
                    date_of_birth=date(random.randint(1995, 2002), random.randint(1, 12), random.randint(1, 28)),
                )
            )
            if created:
                user.set_password("pass1234")
                user.save()
            graduate_users.append(user)

        # ── Graduate Profiles ──
        self.stdout.write("  Creating graduate profiles...")
        for user in graduate_users:
            profile, _ = GraduateProfile.objects.get_or_create(
                user=user,
                defaults=dict(
                    headline=random.choice(["مطور برمجيات", "مهندس شبكات", "محلل بيانات", "مصمم واجهات", "مهندس ذكاء اصطناعي", "مطور تطبيقات"]),
                    college=random.choice(colleges_pool),
                    graduation_year=random.randint(2018, 2025),
                    major=random.choice(majors),
                    gpa=round(random.uniform(2.0, 4.0), 2),
                    city=random.choice(cities),
                    available_for_work=random.random() > 0.2,
                    linkedin_url="https://linkedin.com/in/" + user.username,
                    github_url="https://github.com/" + user.username,
                    profile_views=random.randint(10, 500),
                    search_appearances=random.randint(5, 200),
                    employer_interactions=random.randint(0, 50),
                )
            )
            # Skills
            if not profile.skills.exists():
                num_skills = random.randint(3, 8)
                selected = random.sample(skills_pool, min(num_skills, len(skills_pool)))
                for sk in selected:
                    GraduateSkill.objects.get_or_create(
                        graduate=profile, skill=sk,
                        defaults=dict(
                            proficiency=random.choice(["beginner", "intermediate", "advanced", "expert"]),
                            years_experience=random.randint(0, 5),
                            is_top_skill=random.random() > 0.7,
                        )
                    )
            # Education
            if not profile.education.exists():
                Education.objects.get_or_create(
                    graduate=profile, degree=random.choice(degrees),
                    field_of_study=profile.major or random.choice(majors),
                    institution=random.choice([c.name_ar for c in colleges_pool]),
                    start_date=date(profile.graduation_year - 4, 9, 1),
                    end_date=date(profile.graduation_year, 6, 30),
                    grade=random.choice(["ممتاز", "جيد جداً", "جيد"]),
                )
            # Experience
            if not profile.experience.exists() and random.random() > 0.3:
                Experience.objects.get_or_create(
                    graduate=profile,
                    title=random.choice(["مطور مبتدئ", "مهندس دعم", "محلل", "متدرب", "مساعد إداري"]),
                    company=random.choice(companies),
                    start_date=date(profile.graduation_year, random.randint(1, 12), 1),
                    is_current=random.random() > 0.5,
                    employment_type=random.choice(["full_time", "part_time", "internship"]),
                    description="العمل على تطوير وتحسين الأنظمة الداخلية للشركة",
                )
            # Projects
            if not profile.projects.exists() and random.random() > 0.4:
                Project.objects.get_or_create(
                    graduate=profile,
                    title=random.choice(["نظام إدارة المدرسة", "تطبيق توصيل", "منصة تعليمية", "متجر إلكتروني", "تطبيق صحي"]),
                    description="مشروع تطوير ويب متكامل",
                    technologies="React, Django, PostgreSQL",
                    url="https://github.com/" + user.username + "/project",
                    start_date=date(profile.graduation_year - 1, 1, 1),
                )
            # Certifications
            if not profile.certifications.exists() and random.random() > 0.5:
                Certification.objects.get_or_create(
                    graduate=profile,
                    name=random.choice(["CCNA", "CompTIA A+", "AWS Practitioner", "Python for Everybody", "Google IT Support", "Microsoft Azure Fundamentals"]),
                    issuer=random.choice(["Cisco", "CompTIA", "Amazon", "Coursera", "Google", "Microsoft"]),
                    issue_date=date(profile.graduation_year, 1, 15),
                )
            user.profile_completion = random.randint(30, 100)
            user.save(update_fields=["profile_completion"])

        # ── Employer Users & Companies ──
        employer_names = ["شركة ليبيا تك", "المؤسسة المتكاملة", "شركة الحلول المتقدمة", "شركة تقانة", "شركة إبداع", "الجيل الجديد", "شركة العنقاء", "مؤسسة سدرة", "مجموعة الأندلس", "شركة المستقبل"]
        employer_industries = list(Industry.objects.all())

        self.stdout.write("  Creating employer users and companies...")
        employer_users = []
        for i in range(10):
            fn = random.choice(grad_first_names)
            ln = random.choice(grad_last_names)
            username = f"employer{i+1}"
            user, created = User.objects.get_or_create(
                username=username,
                defaults=dict(
                    email=f"employer{i+1}@company.ly", first_name=fn, last_name=ln,
                    user_type="employer", is_verified=random.random() > 0.3, is_active=True,
                )
            )
            if created:
                user.set_password("pass1234")
                user.save()
            employer_users.append(user)

            company, _ = CompanyProfile.objects.get_or_create(
                user=user,
                defaults=dict(
                    company_name=employer_names[i],
                    commercial_registration=f"CR{random.randint(10000,99999)}",
                    industry=random.choice(employer_industries),
                    company_size=random.choice(["1-10", "11-50", "51-200", "201-1000"]),
                    city=random.choice(cities),
                    phone=f"+21891{random.randint(1000000,9999999)}",
                    description=f"{employer_names[i]} هي شركة رائدة في مجال {random.choice(industries)} تقدم خدمات وحلول مبتكرة.",
                    website=f"https://{username}.com",
                    is_verified=random.random() > 0.3,
                    total_jobs=0, total_hires=random.randint(0, 20),
                    profile_views=random.randint(50, 2000),
                )
            )

        self.stdout.write("  Creating job posts...")
        companies_list = list(CompanyProfile.objects.all())
        categories_list = list(JobCategory.objects.all())
        job_titles = [
            "مطور واجهات أمامية", "مطور باك إند", "مهندس برمجيات", "محلل بيانات",
            "مهندس شبكات", "أخصائي أمن معلومات", "مصمم جرافيك", "مدير مشروع",
            "مهندس DevOps", "مطور تطبيقات جوال", "أخصائي تسويق إلكتروني", "محاسب",
            "أخصائي موارد بشرية", "كاتب محتوى", "مهندس ذكاء اصطناعي",
            "مصمم UI/UX", "أخصائي دعم فني", "مدير منتج", "مهندس اختبار",
            "أخصائي علاقات عامة", "محلل مالي", "مدير مبيعات", "مطور Full Stack",
            "مهندس سحابي", "أخصائي تحسين محركات البحث",
        ]
        job_posts = []
        for company in companies_list:
            num_jobs = random.randint(4, 8)
            for _ in range(num_jobs):
                title = random.choice(job_titles)
                job = JobPost.objects.create(
                    title=title, company=company,
                    posted_by=company.user,
                    description=f"نبحث عن {title} للانضمام إلى فريق عمل {company.company_name} في {company.city}.",
                    requirements="خبرة لا تقل عن سنتين في نفس المجال\nإجادة اللغة الإنجليزية\nمهارات تواصل ممتازة",
                    employment_type=random.choice(["full_time", "part_time", "contract", "freelance"]),
                    experience_level=random.choice(["entry", "mid", "senior"]),
                    city=company.city,
                    salary_min=random.choice([1500, 2000, 2500, 3000]),
                    salary_max=random.choice([3500, 4000, 5000, 6000]),
                    vacancies=random.randint(1, 5),
                    status=random.choice(["active", "active", "active", "active", "active", "active", "active", "active", "draft", "closed"]),
                    views_count=random.randint(10, 500),
                    applications_count=0,
                    is_featured=random.random() > 0.8,
                    is_urgent=random.random() > 0.9,
                    published_at=timezone.now() - timedelta(days=random.randint(1, 60)),
                )
                num_skills = random.randint(2, 5)
                selected_skills = random.sample(skills_pool, min(num_skills, len(skills_pool)))
                job.skills.set(selected_skills)
                job_posts.append(job)

        # ── Applications ──
        self.stdout.write("  Creating job applications...")
        profiles_list = list(GraduateProfile.objects.all())
        applications_created = 0
        for job in JobPost.objects.filter(status="active")[:20]:
            num_applicants = random.randint(2, 8)
            selected = random.sample(profiles_list, min(num_applicants, len(profiles_list)))
            for profile in selected:
                app, created = JobApplication.objects.get_or_create(
                    job=job, applicant=profile.user,
                    defaults=dict(
                        status=random.choice(["pending", "reviewed", "shortlisted", "interview", "rejected"]),
                        match_score=random.randint(30, 95),
                        cover_letter="أنا مهتم جداً بهذه الوظيفة وأعتقد أن مهاراتي وخبراتي تتوافق مع متطلباتها.",
                    )
                )
                if created:
                    applications_created += 1
        for job in job_posts:
            job.applications_count = job.applications.count()
            job.save(update_fields=["applications_count"])

        # ── Interviews ──
        self.stdout.write("  Creating interviews...")
        interviewed_apps = JobApplication.objects.filter(status="interview")[:15]
        for app in interviewed_apps:
            Interview.objects.get_or_create(
                application=app,
                defaults=dict(
                    scheduled_by=app.job.company.user,
                    interview_type=random.choice(["video", "in_person", "phone", "technical"]),
                    status=random.choice(["scheduled", "confirmed", "completed"]),
                    scheduled_at=timezone.now() + timedelta(days=random.randint(1, 14), hours=random.randint(9, 17)),
                    duration_minutes=random.choice([30, 45, 60]),
                    notes="مقابلة للتعرف على المرشح ومناقشة الخبرات",
                )
            )

        # ── Notifications ──
        self.stdout.write("  Creating notifications...")
        notification_templates = [
            ("application", "تم استلام طلبك", "تم استلام طلب التقديم على وظيفة {job_title} بنجاح، سنقوم بإعلامك بأي تحديثات"),
            ("interview", "تم تحديد موعد مقابلة", "تم تحديد موعد مقابلة شخصية لوظيفة {job_title} في تاريخ {date}"),
            ("message", "رسالة جديدة", "لديك رسالة جديدة من {name} بخصوص وظيفة {job_title}"),
            ("job_match", "وظائف مقترحة", "تم العثور على وظائف جديدة تتناسب مع مهاراتك في {city}"),
            ("profile_view", "مشاهدة الملف", "قام {name} بمشاهدة ملفك الشخصي"),
            ("verification", "تم توثيق حسابك", "تم توثيق حسابك بنجاح، يمكنك الآن الاستفادة من جميع الخدمات"),
            ("system", "تحديث النظام", "تم تحديث النظام، يرجى مراجعة الإشعارات الجديدة"),
        ]
        for user in graduate_users:
            for _ in range(random.randint(2, 4)):
                notif_type, title, msg = random.choice(notification_templates)
                Notification.objects.create(
                    recipient=user,
                    notification_type=notif_type,
                    title=title,
                    message=msg.format(job_title=random.choice(job_titles), name=random.choice(employer_users).get_full_name(), city=random.choice([c.city for c in companies_list[:5]]), date="2026-06-" + str(random.randint(1, 15)).zfill(2)),
                    is_read=random.random() > 0.5,
                )
        for user in employer_users:
            notif_type, title, msg = random.choice([
                ("application", "تقديم جديد على وظيفة", "هناك تقديم جديد على وظيفة {job_title} من {name}"),
                ("interview", "تم تأكيد المقابلة", "قام {name} بتأكيد حضور المقابلة لوظيفة {job_title}"),
                ("message", "رسالة جديدة", "لديك رسالة جديدة من {name} بخصوص وظيفة {job_title}"),
                ("profile_view", "مشاهدة الملف", "قام {name} بمشاهدة ملف شركتك"),
                ("system", "تحديث النظام", "تم إضافة ميزات جديدة للمنصة"),
            ])
            Notification.objects.create(
                recipient=user,
                notification_type=notif_type,
                title=title,
                message=msg.format(job_title=random.choice(job_titles), name=random.choice(graduate_users).get_full_name()),
                is_read=random.random() > 0.4,
            )

        # ── Advertisements ──
        self.stdout.write("  Creating advertisements...")
        ad_data = [
            ("سجّل الآن في برنامج التدريب الصيفي", "فرصة تدريب ممتدة لخريجي الكليات التقنية", "medium"),
            ("توظيف فوري - شركات تقنية كبرى", "أكثر من 200 وظيفة متاحة في مختلف التخصصات", "sidebar"),
            ("دورات مجانية في البرمجة", "احصل على شهادات معتمدة في تطوير الويب وتطبيقات الجوال", "small"),
            ("مؤتمر التوظيف التقني 2026", "أكبر تجمع لأصحاب العمل والخريجين", "large"),
            ("منحة دراسية في مجال الذكاء الاصطناعي", "فرصة فريدة للدراسة في أفضل الجامعات", "medium"),
            ("برنامج الإرشاد المهني", "مرشدون خبراء لمساعدتك في بناء مسارك المهني", "sidebar"),
            ("مسابقة الابتكار التقني", "جوائز قيّمة للمشاريع المبتكرة", "small"),
        ]
        for title, desc, placement in ad_data:
            Advertisement.objects.get_or_create(
                title=title,
                defaults=dict(
                    description=desc,
                    placement=placement,
                    is_active=True,
                ),
            )
        ads_created = Advertisement.objects.count()

        # ── Chat Conversations ──
        self.stdout.write("  Creating chat conversations...")
        conversations_created = 0
        messages_created = 0
        for i, grad in enumerate(graduate_users[:8]):
            emp = employer_users[i % len(employer_users)]
            try:
                conv, created = Conversation.objects.get_or_create(
                    job=job_posts[i % len(job_posts)],
                    defaults=dict(subject=f"استفسار بخصوص وظيفة {job_posts[i % len(job_posts)].title}"),
                )
                if created:
                    conv.participants.add(grad, emp)
                    conv.save()
                    conversations_created += 1
                else:
                    continue

                # Add a few messages per conversation
                msgs = [
                    f"السلام عليكم، أنا مهتم بوظيفة {conv.job.title} وأود معرفة المزيد عن متطلباتها",
                    "وعليكم السلام، مرحباً بك. يسعدنا تواصلك معنا. يرجى إرسال سيرتك الذاتية للمراجعة",
                    "شكراً جزيلاً. سأقوم بإرسال السيرة الذاتية قريباً",
                    "ممتاز، نحن في انتظارها. يمكنك أيضاً متابعة حالة طلبك من خلال لوحة التحكم",
                    "هل هناك أي تفاصيل إضافية يجب معرفتها عن المقابلة؟",
                    "سيتم إعلامك بموعد المقابلة بعد مراجعة الطلبات",
                ]
                for j, content in enumerate(msgs):
                    Message.objects.create(
                        conversation=conv,
                        sender=grad if j % 2 == 0 else emp,
                        content=content,
                        is_read=j < len(msgs) - 1,
                        created_at=timezone.now() - timedelta(hours=len(msgs) - j),
                    )
                    messages_created += 1
                conv.last_message_at = timezone.now()
                conv.save(update_fields=["last_message_at"])
            except Exception:
                pass

        self.stdout.write(self.style.SUCCESS(f"""
  ✓ Seed complete!
  ─────────────────────────────────
  Admin: admin / admin123
  Graduates: {len(graduate_users)} (pass: pass1234)
  Employers: {len(employer_users)} (pass: pass1234)
  Colleges: {len(colleges_pool)}
  Skills: {len(skills_pool)}
  Industries: {len(industries)}
  Job Categories: {len(job_cats)}
  Job Posts: {len(job_posts)}
  Applications: {applications_created}
  Conversations: {conversations_created}
  Chat Messages: {messages_created}
  Notifications: {Notification.objects.count()}
  Advertisements: {ads_created}
        """))
