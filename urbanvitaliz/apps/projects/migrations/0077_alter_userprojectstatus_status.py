# Generated by Django 3.2.16 on 2023-01-17 09:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0076_alter_userprojectstatus_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprojectstatus',
            name='status',
            field=models.CharField(choices=[('NEW', 'Nouveau'), ('TODO', 'A traiter'), ('WIP', 'En cours'), ('DONE', 'Traité'), ('NOT_INTERESTED', "Pas d'intérêt")], max_length=20),
        ),
    ]
