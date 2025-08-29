FROM openjdk:17-slim
WORKDIR /app

# Create /app with write permissions for nobody user
RUN chown -R nobody:nogroup /app && \
    chmod 777 /app

USER nobody