FROM gcc:latest

WORKDIR /app

# Create non-root user and give them ownership of /app
RUN useradd -m -r coderunner && \
    chown -R coderunner:coderunner /app && \
    chmod 755 /app

USER coderunner