# encoding: utf-8

"""
api for sending emails

Always use the send_email function that can be implemented as:

- a debug version through the terminal
- a production version through send in blue


authors: guillaume.libersat@beta.gouv.fr, raphael.marvie@beta.gouv.fr
updated: 2022-02-03 16:19:24 CET
"""

import logging

from django.utils import timezone
from django.conf import settings
from django.core.mail import mail_admins
from django.core.mail import send_mail as django_send_mail
from django.contrib.auth.models import User
from django.contrib.sites.models import Site

from .brevo import Brevo
from .models import EmailTemplate, TransactionRecord

logger = logging.getLogger("main")


def create_transaction(transaction_id, recipients, label, related, faked=False):
    current_site = Site.objects.get_current()

    if type(recipients) is not list:
        recipients = [recipients]

    if type(recipients[0]) is dict:
        recipients = [recipient.get("email") for recipient in recipients]

    for user in User.objects.filter(profile__sites=current_site, email__in=recipients):
        TransactionRecord.objects.create(
            site=current_site,
            sent_on=timezone.now(),
            transaction_id=transaction_id,
            label=label,
            faked=faked,
            user=user,
            related=related,
        )


def brevo_email(template_name, recipients, params=None, test=False, related=None):
    """Uses Brevo service to send an email using the given template and params"""
    brevo = Brevo()
    try:
        template = EmailTemplate.on_site.get(name__iexact=template_name)
    except EmailTemplate.DoesNotExist:
        mail_admins(
            subject="Unable to send email", message=f"{template_name} was not found !"
        )
        return False

    response = brevo.send_email(template.sib_id, recipients, params, test=test)

    if response:
        create_transaction(
            transaction_id=response.message_id,
            recipients=recipients,
            label=template_name,
            related=related,
            faked=test,
        )

    return response


def send_debug_email(template_name, recipients, params=None, test=False, related=None):
    """
    As an alternative, use the default django send_mail, mostly used for debugging
    and displaying email on the terminal.
    """

    if type(recipients) is not list:
        recipients = [recipients]

    simple_recipients = []
    for recipient in recipients:
        if type(recipient) is dict:
            simple_recipients.append(recipient["email"])
        else:
            simple_recipients.append(recipient)

    logger.debug(f"Sending email to {simple_recipients}")

    django_send_mail(
        "Brevo Mail",
        f"Message utilisant le template {template_name} avec les"
        f"paramètres : {params} (TEST MODE: {test})",
        "no-reply@urbanvitaliz.fr",
        simple_recipients,
        fail_silently=False,
    )

    create_transaction(
        transaction_id=f"FAKE-ID-{timezone.now()}",
        recipients=recipients,
        label=template_name,
        related=related,
        faked=True,
    )

    return True


def fetch_transaction_content(transaction_id):
    brevo = Brevo()

    emails = brevo.get_emails_from_transactionid(transaction_id)

    for email in emails.transactional_emails:
        return brevo.get_content_from_uuid(email.uuid)

    return None


if settings.DEBUG and getattr(settings, "BREVO_FORCE_DEBUG", False):
    send_email = send_debug_email
else:
    send_email = brevo_email

# eof
