# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Baixar dependencias com cache de camadas
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copiar codigo fonte e compilar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime otimizado para AWS Free Tier (EC2 t2.micro / t3.micro - 1GB RAM)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Criar usuario sem privilegios para seguranca e preparar diretorios
RUN addgroup -S spring && adduser -S spring -G spring \
    && mkdir -p /app/uploads \
    && chown -R spring:spring /app

# Copiar artifact gerado
COPY --from=builder /app/target/*.jar app.jar
RUN chown -R spring:spring /app

USER spring:spring

# Configuracao de JVM restrita a 384MB de Heap para caber com folga em instancias de 1GB RAM
ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseG1GC -XX:+UseStringDeduplication -XX:MaxGCPauseMillis=100 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
