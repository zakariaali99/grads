from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import re


class ArabicPasswordValidator:
    def validate(self, password, user=None):
        if len(password) < 8:
            raise ValidationError(_("كلمة المرور يجب أن تكون 8 أحرف على الأقل."))
        if not re.search(r"[A-Z]", password):
            raise ValidationError(_("كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل."))
        if not re.search(r"[a-z]", password):
            raise ValidationError(_("كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل."))
        if not re.search(r"\d", password):
            raise ValidationError(_("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل."))

    def get_help_text(self):
        return _("كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم.")
