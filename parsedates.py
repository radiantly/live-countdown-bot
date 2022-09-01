import dateparser
from flask import Flask, request

app = Flask(__name__)


defaults = {"PREFER_DATES_FROM": "future"}


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
        dt = dateparser.parse(text, settings=defaults)
        if not dt or dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
            dt = dt = dateparser.parse(
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
