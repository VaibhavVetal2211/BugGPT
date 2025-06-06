import logging

def setup_logger():
    """Set up the logger for the application."""
    logger = logging.getLogger('app_logger')
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger

# Initialize the logger
logger = setup_logger()
