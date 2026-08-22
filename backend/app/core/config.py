from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Workout Quest"
    secret_key: str = "change-this-secret"
    access_token_expire_minutes: int = 60 * 24 * 7
    algorithm: str = "HS256"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/workout_quest"
    frontend_url: str = "http://localhost:5173"
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
