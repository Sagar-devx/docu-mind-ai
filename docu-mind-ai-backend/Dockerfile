# Multi-stage Dockerfile for DocuMind Backend
# Stage 1: Build
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copy Maven wrapper & pom for layer caching
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B || true

# Copy source code and package
COPY src src
RUN ./mvnw clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:25-jre
WORKDIR /app

# Security: run as non-root user
RUN groupadd -r spring && useradd -r -g spring spring

COPY --chown=spring:spring --from=build /app/target/*.jar app.jar

USER spring:spring

# Render exposes service on $PORT (default 8080)
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=45.0", "-Xss512k", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
