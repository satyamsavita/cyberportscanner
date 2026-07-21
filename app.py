from flask import Flask, render_template, request, jsonify, send_file
from io import BytesIO

from scanner import scan_ports
from validator import validate_target, validate_ports
from report_generator import generate_pdf

app = Flask(__name__)


# ===============================
# Home Page
# ===============================

@app.route("/")
def home():
    return render_template("index.html")


# ===============================
# Scan Ports
# ===============================

@app.route("/scan", methods=["POST"])
def scan():

    try:

        data = request.get_json()

        target = data.get("ip", "").strip()

        start_port = int(data.get("start_port"))

        end_port = int(data.get("end_port"))

        if not validate_target(target):

            return jsonify({

                "success": False,

                "message": "Invalid IP Address or Hostname"

            }), 400

        if not validate_ports(start_port, end_port):

            return jsonify({

                "success": False,

                "message": "Invalid Port Range"

            }), 400

        result = scan_ports(

            target,

            start_port,

            end_port

        )

        return jsonify({

            "success": True,

            "data": result

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ===============================
# Generate PDF
# ===============================

@app.route("/generate_pdf", methods=["POST"])
def pdf():

    try:

        data = request.get_json()

        pdf = generate_pdf(

            ip=data["ip"],

            open_ports=data["open"],

            closed_ports=data["closed"],

            scan_time=data["scan_time"],

            results=data["results"]

        )

        return send_file(

            BytesIO(pdf),

            download_name="Scan_Report.pdf",

            mimetype="application/pdf",

            as_attachment=True

        )

    except Exception as e:

        print(e)

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500


# ===============================
# Run Flask
# ===============================

if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )