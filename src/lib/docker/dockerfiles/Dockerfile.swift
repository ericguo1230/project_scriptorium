FROM swift:latest
WORKDIR /app

# Make sure the swift command is in the PATH
RUN which swift

# Test that swift works
RUN swift --version

# Create non-root user and set permissions
RUN useradd -m -r coderunner && \
    chown -R coderunner:coderunner /app && \
    chmod 755 /app

USER coderunner