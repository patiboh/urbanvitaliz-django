# Generated by Django 3.2.13 on 2022-06-06 11:59

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("onboarding", "0003_alter_onboardingresponse_onboarding"),
        ("home", "0006_alter_siteconfiguration_site"),
    ]

    operations = [
        migrations.AddField(
            model_name="siteconfiguration",
            name="onboarding",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                to="onboarding.onboarding",
            ),
            preserve_default=False,
        ),
    ]
