from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='testdriverequest',
            name='preferred_slot',
            field=models.CharField(
                choices=[
                    ('morning', 'Morning · 10:00–13:00'),
                    ('afternoon', 'Afternoon · 13:00–17:00'),
                    ('evening', 'Evening · 17:00–20:00'),
                ],
                default='afternoon',
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name='testdriverequest',
            name='visitor_message',
            field=models.TextField(blank=True),
        ),
    ]
