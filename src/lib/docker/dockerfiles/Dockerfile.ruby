FROM ruby:3.3-slim
WORKDIR /app

# Create non-root user and set permissions
RUN useradd -m -r coderunner && \
    chown -R coderunner:coderunner /app && \
    chmod 755 /app

USER coderunner