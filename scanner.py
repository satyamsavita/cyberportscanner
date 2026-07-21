import socket
import time
from concurrent.futures import ThreadPoolExecutor
from services import get_service_name


def scan_single_port(target_ip, port):
    """
    Scan a single TCP port.
    """

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(0.5)

    result = sock.connect_ex((target_ip, port))

    sock.close()

    if result == 0:
        status = "Open"
    else:
        status = "Closed"

    return {
        "port": port,
        "service": get_service_name(port),
        "status": status
    }


def scan_ports(target, start_port, end_port):
    """
    Scan multiple ports using multithreading.
    """

    target_ip = socket.gethostbyname(target)

    start_time = time.time()

    results = []

    with ThreadPoolExecutor(max_workers=100) as executor:

        futures = []

        for port in range(start_port, end_port + 1):
            futures.append(
                executor.submit(scan_single_port, target_ip, port)
            )

        for future in futures:
            results.append(future.result())

    results.sort(key=lambda x: x["port"])

    open_count = sum(
        1 for port in results
        if port["status"] == "Open"
    )

    closed_count = sum(
        1 for port in results
        if port["status"] == "Closed"
    )

    scan_time = round(time.time() - start_time, 2)

    return {
        "results": results,
        "open_count": open_count,
        "closed_count": closed_count,
        "scan_time": scan_time
    }