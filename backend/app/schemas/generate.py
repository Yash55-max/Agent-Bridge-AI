from pydantic import BaseModel


class GenerateRequest(BaseModel):
    description: str


class GenerateResponse(BaseModel):
    server_name: str
    generated_code: str
    note: str | None = None
