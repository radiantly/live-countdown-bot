from contextlib import suppress
from datetime import datetime

import dateparser
from flask import Flask, request

app = Flask(__name__)


defaults = {"PREFER_DATES_FROM": "future"}


def is_timezone_aware(dt: datetime | None) -> bool:
    """Checks if dt is a timezone-aware datetime object"""
    return dt and dt.tzinfo and dt.tzinfo.utcoffset(dt)


@app.route("/", methods=["POST"])
def hello_world():
    req = request.json

    text, timezone = req["text"], req["timezone"]

    dt = None

    if timezone:
        try:
            dt = dateparser.parse(
                text, settings={**defaults, "TIMEZONE": timezone, "RETURN_AS_TIMEZONE_AWARE": True}
            )
        except:
            return {"error": "Invalid Timezone"}
    else:
        with suppress(Exception):
            dt = dateparser.parse(text, settings=defaults)

        if not is_timezone_aware(dt):
            dt = dateparser.parse(
                text,
                settings={
                    **defaults,
                    "TIMEZONE": req["default_timezone"],
                    "RETURN_AS_TIMEZONE_AWARE": True,
                },
            )

        if not is_timezone_aware(dt):
            dt = dateparser.parse(
                text, settings={**defaults, "TIMEZONE": "UTC", "RETURN_AS_TIMEZONE_AWARE": True}
            )

    print(repr(dt))
    if not dt:
        return {"error": "Unable to parse given datetime"}
    return {
        "timestamp": int(dt.timestamp()),
        "timezone": str(dt.tzinfo.tzname(dt)),
        "utcoffset": int(dt.tzinfo.utcoffset(dt).total_seconds()),
    }


if __name__ == "__main__":
    app.run(host="unix:///tmp/parsedateserver.sock")
