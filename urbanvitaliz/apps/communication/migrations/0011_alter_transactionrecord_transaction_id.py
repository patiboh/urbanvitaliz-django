# Generated by Django 3.2.23 on 2024-01-09 13:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("communication", "0010_transactionrecord"),
    ]

    operations = [
        migrations.AlterField(
            model_name="transactionrecord",
            name="transaction_id",
            field=models.CharField(max_length=65536),
        ),
    ]
