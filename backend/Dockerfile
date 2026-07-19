# ── Stage 1: Build Application ───────────────────────────────────────────────
FROM rust:1.88 as builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    pkg-config libssl-dev ca-certificates build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release || true

COPY src ./src
COPY migrations ./migrations

RUN touch src/main.rs && cargo build --release

# ── Stage 2: Production Runtime ──────────────────────────────────────────────
FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y libssl3 ca-certificates curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN useradd -r -u 10001 -s /sbin/nologin appuser

COPY --from=builder /app/target/release/gobernador-ia /usr/local/bin/
COPY --from=builder /app/migrations ./migrations

RUN chmod +x /usr/local/bin/gobernador-ia && \
    chown -R appuser:appuser /app

USER appuser

ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["/usr/local/bin/gobernador-ia"]
