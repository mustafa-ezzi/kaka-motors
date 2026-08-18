def init_sentry():
    from django.conf import settings

    dsn = getattr(settings, 'SENTRY_DSN', '') or ''
    if not dsn:
        return
    import sentry_sdk

    sentry_sdk.init(
        dsn=dsn,
        send_default_pii=False,
        traces_sample_rate=getattr(settings, 'SENTRY_TRACES_SAMPLE_RATE', 0.05),
        environment='production' if not settings.DEBUG else 'development',
    )
