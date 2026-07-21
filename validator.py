import socket


def validate_target(target):
    """
    Validate an IP address or hostname.
    """

    if not target:
        return False

    try:
        socket.gethostbyname(target)
        return True
    except socket.gaierror:
        return False


def validate_ports(start_port, end_port):
    """
    Validate the port range.
    """

    if not isinstance(start_port, int):
        return False

    if not isinstance(end_port, int):
        return False

    if start_port < 1:
        return False

    if end_port > 65535:
        return False

    if start_port > end_port:
        return False

    return True