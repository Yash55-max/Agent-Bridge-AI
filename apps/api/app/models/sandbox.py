from sqlalchemy import DateTime, ForeignKey, Float, Integer, JSON, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class SandboxSession(Base):
    __tablename__ = "sandbox_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    mcp_server_id: Mapped[int | None] = mapped_column(ForeignKey("mcp_servers.id"), nullable=True)
    status: Mapped[str] = mapped_column(default="configuring", nullable=False)
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    started_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)


class SandboxAgent(Base):
    __tablename__ = "sandbox_agents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sandbox_sessions.id"), nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    role: Mapped[str | None] = mapped_column(Text, nullable=True)
    goal: Mapped[str | None] = mapped_column(Text, nullable=True)
    model: Mapped[str | None] = mapped_column(nullable=True)
    allowed_tools: Mapped[list | None] = mapped_column(JSON, nullable=True)
    max_turns: Mapped[int | None] = mapped_column(Integer, nullable=True)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)


class SandboxEvent(Base):
    __tablename__ = "simulation_events"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sandbox_sessions.id"), nullable=False)
    agent_id: Mapped[int | None] = mapped_column(ForeignKey("sandbox_agents.id"), nullable=True)
    event_type: Mapped[str] = mapped_column(nullable=False)
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    sequence_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
