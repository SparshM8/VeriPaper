import os


class Settings:
    PROJECT_NAME = "VeriPaper"
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://veripaper:veripaper@localhost:5432/veripaper")


settings = Settings()
