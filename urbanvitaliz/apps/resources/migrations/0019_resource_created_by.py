# Generated by Django 3.2.3 on 2021-11-30 09:54

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("resources", "0018_alter_resource_expires_on"),
    ]

    operations = [
        migrations.AddField(
            model_name="resource",
            name="created_by",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="authored_resources",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
